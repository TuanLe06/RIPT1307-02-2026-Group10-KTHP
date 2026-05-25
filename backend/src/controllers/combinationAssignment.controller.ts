import { Request, Response } from "express";
import { AdmissionCombinationModel } from "../models/admissionCombination.model";
import { UniversityModel, MajorModel } from "../models/university.model";

export const getAssignedCombinations = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const universityCode = req.params.universityCode as string;
  const majorCode = req.params.majorCode as string;

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
    const ids = await AdmissionCombinationModel.findIdsByMajor(major.id);
    res.json({
      success: true,
      message: "Lấy danh sách tổ hợp đã gán thành công",
      data: ids,
    });
  } catch (error) {
    throw error;
  }
};

export const assignCombinations = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const universityCode = req.params.universityCode as string;
  const majorCode = req.params.majorCode as string;
  const { combination_ids } = req.body;

  if (!Array.isArray(combination_ids)) {
    res.status(400).json({ success: false, message: "Dữ liệu không hợp lệ" });
    return;
  }

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
    await AdmissionCombinationModel.assignToMajor(major.id, combination_ids);
    res.json({
      success: true,
      message: "Gán tổ hợp xét tuyển thành công",
    });
  } catch (error) {
    throw error;
  }
};
