import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { AdmissionCombinationModel } from "../models/admissionCombination.model";
import { UniversityModel, MajorModel } from "../models/university.model";

export const createCombination = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: "Dữ liệu không hợp lệ",
      errors: errors.array(),
    });
    return;
  }

  const universityCode = req.params.universityCode as string;
  const majorCode = req.params.majorCode as string;
  const { code, subject_1, subject_2, subject_3 } = req.body;

  const universityId = await UniversityModel.findIdByCode(universityCode);
  if (!universityId) {
    res.status(404).json({ success: false, message: "Không tìm thấy trường đại học" });
    return;
  }

  const major = await MajorModel.findByCode(universityId, majorCode);
  if (!major) {
    res.status(404).json({ success: false, message: "Không tìm thấy ngành học" });
    return;
  }

  if (await AdmissionCombinationModel.existsByCode(major.id, code.trim())) {
    res
      .status(409)
      .json({ success: false, message: "Mã tổ hợp đã tồn tại trong ngành này" });
    return;
  }

  try {
    const combination = await AdmissionCombinationModel.create({
      code: code.trim(),
      subject_1: subject_1.trim(),
      subject_2: subject_2.trim(),
      subject_3: subject_3.trim(),
    });
    await AdmissionCombinationModel.linkToMajor(combination.id, major.id);
    res.status(201).json({
      success: true,
      message: "Thêm tổ hợp xét tuyển thành công",
      data: combination,
    });
  } catch (error) {
    if ((error as { code?: string }).code === "ER_DUP_ENTRY") {
      res
        .status(409)
        .json({ success: false, message: "Mã tổ hợp đã tồn tại trong ngành này" });
      return;
    }
    throw error;
  }
};

export const updateCombination = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: "Dữ liệu không hợp lệ",
      errors: errors.array(),
    });
    return;
  }

  const universityCode = req.params.universityCode as string;
  const majorCode = req.params.majorCode as string;
  const combinationId = req.params.combinationId as string;
  const { code, subject_1, subject_2, subject_3 } = req.body;

  const universityId = await UniversityModel.findIdByCode(universityCode);
  if (!universityId) {
    res.status(404).json({ success: false, message: "Không tìm thấy trường đại học" });
    return;
  }

  const major = await MajorModel.findByCode(universityId, majorCode);
  if (!major) {
    res.status(404).json({ success: false, message: "Không tìm thấy ngành học" });
    return;
  }

  const existing = await AdmissionCombinationModel.findById(combinationId);
  if (!existing) {
    res
      .status(404)
      .json({ success: false, message: "Không tìm thấy tổ hợp xét tuyển" });
    return;
  }

  const linked = await AdmissionCombinationModel.findByMajorAndCode(major.id, existing.code);
  if (!linked || linked.id !== combinationId) {
    res
      .status(404)
      .json({ success: false, message: "Không tìm thấy tổ hợp xét tuyển" });
    return;
  }

  if (code && (await AdmissionCombinationModel.existsByCode(major.id, code.trim(), combinationId))) {
    res
      .status(409)
      .json({ success: false, message: "Mã tổ hợp đã tồn tại trong ngành này" });
    return;
  }

  try {
    const combination = await AdmissionCombinationModel.update(combinationId, {
      code: code?.trim(),
      subject_1: subject_1?.trim(),
      subject_2: subject_2?.trim(),
      subject_3: subject_3?.trim(),
    });
    res.json({
      success: true,
      message: "Cập nhật tổ hợp xét tuyển thành công",
      data: combination,
    });
  } catch (error) {
    if ((error as { code?: string }).code === "ER_DUP_ENTRY") {
      res
        .status(409)
        .json({ success: false, message: "Mã tổ hợp đã tồn tại trong ngành này" });
      return;
    }
    throw error;
  }
};

export const deleteCombination = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const universityCode = req.params.universityCode as string;
  const majorCode = req.params.majorCode as string;
  const combinationId = req.params.combinationId as string;

  const universityId = await UniversityModel.findIdByCode(universityCode);
  if (!universityId) {
    res.status(404).json({ success: false, message: "Không tìm thấy trường đại học" });
    return;
  }

  const major = await MajorModel.findByCode(universityId, majorCode);
  if (!major) {
    res.status(404).json({ success: false, message: "Không tìm thấy ngành học" });
    return;
  }

  const existing = await AdmissionCombinationModel.findById(combinationId);
  if (!existing) {
    res
      .status(404)
      .json({ success: false, message: "Không tìm thấy tổ hợp xét tuyển" });
    return;
  }

  const linked = await AdmissionCombinationModel.findByMajorAndCode(major.id, existing.code);
  if (!linked || linked.id !== combinationId) {
    res
      .status(404)
      .json({ success: false, message: "Không tìm thấy tổ hợp xét tuyển" });
    return;
  }

  try {
    await AdmissionCombinationModel.unlinkFromMajor(combinationId, major.id);
    res.json({
      success: true,
      message: "Xóa tổ hợp xét tuyển thành công",
    });
  } catch (error) {
    throw error;
  }
};

export const getCombinations = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const universityCode = req.params.universityCode as string;
  const majorCode = req.params.majorCode as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const universityId = await UniversityModel.findIdByCode(universityCode);
  if (!universityId) {
    res.status(404).json({ success: false, message: "Không tìm thấy trường đại học" });
    return;
  }

  const major = await MajorModel.findByCode(universityId, majorCode);
  if (!major) {
    res.status(404).json({ success: false, message: "Không tìm thấy ngành học" });
    return;
  }

  try {
    const result = await AdmissionCombinationModel.findAllByMajor(major.id, page, limit);
    res.json({
      success: true,
      message: "Lấy danh sách tổ hợp xét tuyển thành công",
      data: result.combinations,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    throw error;
  }
};

export const getAllCombinationsGlobal = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  try {
    const result = await AdmissionCombinationModel.findAll(page, limit);
    res.json({
      success: true,
      message: "Lấy danh sách tổ hợp xét tuyển thành công",
      data: result.combinations,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    throw error;
  }
};

export const getAllCombinationsList = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const combinations = await AdmissionCombinationModel.findAllWithoutPagination();
    res.json({
      success: true,
      message: "Lấy danh sách tổ hợp xét tuyển thành công",
      data: combinations,
    });
  } catch (error) {
    throw error;
  }
};

export const createCombinationGlobal = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: "Dữ liệu không hợp lệ",
      errors: errors.array(),
    });
    return;
  }

  const { code, subject_1, subject_2, subject_3 } = req.body;

  if (await AdmissionCombinationModel.existsByCodeGlobal(code.trim())) {
    res.status(409).json({ success: false, message: "Mã tổ hợp đã tồn tại" });
    return;
  }

  try {
    const combination = await AdmissionCombinationModel.createGlobal({
      code: code.trim(),
      subject_1: subject_1.trim(),
      subject_2: subject_2.trim(),
      subject_3: subject_3.trim(),
    });
    res.status(201).json({
      success: true,
      message: "Thêm tổ hợp xét tuyển thành công",
      data: combination,
    });
  } catch (error) {
    if ((error as { code?: string }).code === "ER_DUP_ENTRY") {
      res.status(409).json({ success: false, message: "Mã tổ hợp đã tồn tại" });
      return;
    }
    throw error;
  }
};

export const updateCombinationGlobal = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: "Dữ liệu không hợp lệ",
      errors: errors.array(),
    });
    return;
  }

  const combinationId = req.params.combinationId as string;
  const { code, subject_1, subject_2, subject_3 } = req.body;

  const existing = await AdmissionCombinationModel.findById(combinationId);
  if (!existing) {
    res.status(404).json({ success: false, message: "Không tìm thấy tổ hợp xét tuyển" });
    return;
  }

  if (code && code !== existing.code && await AdmissionCombinationModel.existsByCodeGlobal(code.trim(), combinationId)) {
    res.status(409).json({ success: false, message: "Mã tổ hợp đã tồn tại" });
    return;
  }

  try {
    const combination = await AdmissionCombinationModel.update(combinationId, {
      code: code?.trim(),
      subject_1: subject_1?.trim(),
      subject_2: subject_2?.trim(),
      subject_3: subject_3?.trim(),
    });
    res.json({
      success: true,
      message: "Cập nhật tổ hợp xét tuyển thành công",
      data: combination,
    });
  } catch (error) {
    if ((error as { code?: string }).code === "ER_DUP_ENTRY") {
      res.status(409).json({ success: false, message: "Mã tổ hợp đã tồn tại" });
      return;
    }
    throw error;
  }
};

export const deleteCombinationGlobal = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const combinationId = req.params.combinationId as string;

  const existing = await AdmissionCombinationModel.findById(combinationId);
  if (!existing) {
    res.status(404).json({ success: false, message: "Không tìm thấy tổ hợp xét tuyển" });
    return;
  }

  try {
    await AdmissionCombinationModel.delete(combinationId);
    res.json({
      success: true,
      message: "Xóa tổ hợp xét tuyển thành công",
    });
  } catch (error) {
    throw error;
  }
};

export const getCombinationDetail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const universityCode = req.params.universityCode as string;
  const majorCode = req.params.majorCode as string;
  const combinationId = req.params.combinationId as string;

  const universityId = await UniversityModel.findIdByCode(universityCode);
  if (!universityId) {
    res.status(404).json({ success: false, message: "Không tìm thấy trường đại học" });
    return;
  }

  const major = await MajorModel.findByCode(universityId, majorCode);
  if (!major) {
    res.status(404).json({ success: false, message: "Không tìm thấy ngành học" });
    return;
  }

  try {
    const combination = await AdmissionCombinationModel.findById(combinationId);
    if (!combination) {
      res
        .status(404)
        .json({ success: false, message: "Không tìm thấy tổ hợp xét tuyển" });
      return;
    }
    const linked = await AdmissionCombinationModel.findByMajorAndCode(major.id, combination.code);
    if (!linked) {
      res
        .status(404)
        .json({ success: false, message: "Không tìm thấy tổ hợp xét tuyển" });
      return;
    }
    res.json({
      success: true,
      message: "Lấy thông tin tổ hợp xét tuyển thành công",
      data: combination,
    });
  } catch (error) {
    throw error;
  }
};
