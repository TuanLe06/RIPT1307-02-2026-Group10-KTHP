import { Request, Response } from "express";
import { validationResult } from "express-validator";
import {
  MAJOR_ERRORS,
  MAJOR_MESSAGES,
  UNIVERSITY_ERRORS,
  UNIVERSITY_MESSAGES,
} from "../constants/university";
import { MajorModel, UniversityModel } from "../models/university.model";

export const createUniversity = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: UNIVERSITY_ERRORS.REQUIRED,
      errors: errors.array(),
    });
    return;
  }

  const { code, name, address, phone, email, website, description } = req.body;

  if (!code || !code.trim()) {
    res.status(400).json({
      success: false,
      message: "Mã trường (viết tắt) không được để trống",
    });
    return;
  }

  if (await UniversityModel.existsByCode(code.trim())) {
    res.status(409).json({ success: false, message: UNIVERSITY_ERRORS.CODE_EXISTS });
    return;
  }

  try {
    const university = await UniversityModel.create({
      code: code.trim(),
      name,
      address,
      phone,
      email,
      website,
      description,
    });
    res.status(201).json({
      success: true,
      message: UNIVERSITY_MESSAGES.CREATED,
      data: university,
    });
  } catch (error) {
    if ((error as { code?: string }).code === "ER_DUP_ENTRY") {
      res
        .status(409)
        .json({ success: false, message: UNIVERSITY_ERRORS.CODE_EXISTS });
      return;
    }
    throw error;
  }
};

export const updateUniversity = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: UNIVERSITY_ERRORS.REQUIRED,
      errors: errors.array(),
    });
    return;
  }

  const { code, name, address, phone, email, website, description, status } =
    req.body;
  const id = req.params.id as string;

  const university = await UniversityModel.findById(id);
  if (!university) {
    res
      .status(404)
      .json({ success: false, message: UNIVERSITY_ERRORS.NOT_FOUND });
    return;
  }

  if (
    code &&
    code !== university.code &&
    (await UniversityModel.existsByCode(code, id))
  ) {
    res
      .status(409)
      .json({ success: false, message: UNIVERSITY_ERRORS.CODE_EXISTS });
    return;
  }

  await UniversityModel.update(id, {
    code,
    name,
    address,
    phone,
    email,
    website,
    description,
    status,
  });
  res.json({ success: true, message: UNIVERSITY_MESSAGES.UPDATED });
};

export const deleteUniversity = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = req.params.id as string;

  const hasApps = await UniversityModel.hasRelatedApplications(id);
  if (hasApps) {
    res.status(409).json({ success: false, message: UNIVERSITY_ERRORS.IN_USE });
    return;
  }

  const deleted = await UniversityModel.softDelete(id);
  if (!deleted) {
    res
      .status(404)
      .json({ success: false, message: UNIVERSITY_ERRORS.NOT_FOUND });
    return;
  }

  res.json({ success: true, message: UNIVERSITY_MESSAGES.DELETED });
};

export const getUniversities = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: UNIVERSITY_ERRORS.REQUIRED,
      errors: errors.array(),
    });
    return;
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const { universities, total } = await UniversityModel.findAll(page, limit);

  res.json({
    success: true,
    message: UNIVERSITY_MESSAGES.LISTED,
    data: universities,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
};

export const getUniversityDetail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: UNIVERSITY_ERRORS.REQUIRED,
      errors: errors.array(),
    });
    return;
  }

  const university = await UniversityModel.findByCode(req.params.code as string);
  if (!university) {
    res
      .status(404)
      .json({ success: false, message: UNIVERSITY_ERRORS.NOT_FOUND });
    return;
  }

  res.json({
    success: true,
    message: UNIVERSITY_MESSAGES.RETRIEVED,
    data: university,
  });
};

export const createMajor = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: MAJOR_ERRORS.REQUIRED,
      errors: errors.array(),
    });
    return;
  }

  const { code, name, description, admission_combinations_id, min_score } =
    req.body;
  const universityId = req.params.universityId as string;

  if (!code || !code.trim()) {
    res.status(400).json({
      success: false,
      message: "Mã ngành (viết tắt) không được để trống",
    });
    return;
  }

  if (await MajorModel.existsByCode(universityId, code.trim())) {
    res.status(409).json({ success: false, message: MAJOR_ERRORS.CODE_EXISTS });
    return;
  }

  if (!(await MajorModel.universityExists(universityId))) {
    res
      .status(404)
      .json({ success: false, message: MAJOR_ERRORS.UNIVERSITY_NOT_FOUND });
    return;
  }

  if (
    !(await MajorModel.admissionCombinationExists(admission_combinations_id))
  ) {
    res
      .status(404)
      .json({ success: false, message: MAJOR_ERRORS.ADMISSION_NOT_FOUND });
    return;
  }

  try {
    const major = await MajorModel.create({
      university_id: universityId,
      code: code.trim(),
      name,
      description,
      admission_combinations_id,
      min_score,
    });
    res
      .status(201)
      .json({ success: true, message: MAJOR_MESSAGES.CREATED, data: major });
  } catch (error) {
    if ((error as { code?: string }).code === "ER_DUP_ENTRY") {
      res
        .status(409)
        .json({ success: false, message: MAJOR_ERRORS.CODE_EXISTS });
      return;
    }
    throw error;
  }
};

export const updateMajor = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: MAJOR_ERRORS.REQUIRED,
      errors: errors.array(),
    });
    return;
  }

  const {
    code,
    name,
    description,
    admission_combinations_id,
    min_score,
    status,
  } = req.body;
  const majorId = req.params.majorId as string;

  const major = await MajorModel.findById(majorId);
  if (!major) {
    res.status(404).json({ success: false, message: MAJOR_ERRORS.NOT_FOUND });
    return;
  }

  if (
    code &&
    code !== major.code &&
    (await MajorModel.existsByCode(major.university_id, code, majorId))
  ) {
    res.status(409).json({ success: false, message: MAJOR_ERRORS.CODE_EXISTS });
    return;
  }

  await MajorModel.update(majorId, {
    code,
    name,
    description,
    admission_combinations_id,
    min_score,
    status,
  });
  res.json({ success: true, message: MAJOR_MESSAGES.UPDATED });
};

export const deleteMajor = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const majorId = req.params.majorId as string;

  const hasApps = await MajorModel.hasRelatedApplications(majorId);
  if (hasApps) {
    res.status(409).json({ success: false, message: MAJOR_ERRORS.IN_USE });
    return;
  }

  const deleted = await MajorModel.softDelete(majorId);
  if (!deleted) {
    res.status(404).json({ success: false, message: MAJOR_ERRORS.NOT_FOUND });
    return;
  }

  res.json({ success: true, message: MAJOR_MESSAGES.DELETED });
};

export const getMajorsByUniversity = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: MAJOR_ERRORS.REQUIRED,
      errors: errors.array(),
    });
    return;
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const universityCode = req.params.universityCode as string;

  const universityId = await UniversityModel.findIdByCode(universityCode);
  if (!universityId) {
    res.status(404).json({
      success: false,
      message: UNIVERSITY_ERRORS.NOT_FOUND,
    });
    return;
  }

  const { majors, total } = await MajorModel.findAllByUniversity(
    universityId,
    page,
    limit,
  );

  res.json({
    success: true,
    message: MAJOR_MESSAGES.LISTED,
    data: majors,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
};

export const getMajorDetail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: MAJOR_ERRORS.REQUIRED,
      errors: errors.array(),
    });
    return;
  }

  const universityCode = req.params.universityCode as string;
  const code = req.params.code as string;

  const universityId = await UniversityModel.findIdByCode(universityCode);
  if (!universityId) {
    res.status(404).json({
      success: false,
      message: UNIVERSITY_ERRORS.NOT_FOUND,
    });
    return;
  }

  const major = await MajorModel.findByCode(universityId, code);
  if (!major) {
    res.status(404).json({ success: false, message: MAJOR_ERRORS.NOT_FOUND });
    return;
  }

  res.json({ success: true, message: MAJOR_MESSAGES.RETRIEVED, data: major });
};
