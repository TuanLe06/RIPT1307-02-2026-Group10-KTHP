import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { CandidateProfileModel } from '../models/candidate-profile.model';
import { deleteAssetByPublicId, uploadDocumentBuffer } from '../services/cloudinary.service';

export const candidateDocumentDeps = {
  uploadDocumentBuffer,
  deleteAssetByPublicId,
};

export const getCandidateProfile = async (req: Request, res: Response): Promise<void> => {
  const profile = await CandidateProfileModel.getFullByUserId(req.user!.id);
  if (!profile) {
    res.status(404).json({ success: false, message: 'Candidate profile not found' });
    return;
  }
  res.json({ success: true, data: profile });
};

export const updateCandidateProfile = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    return;
  }

  const allowedFields = [
    'full_name',
    'phone',
    'date_of_birth',
    'gender',
    'citizen_issue_date',
    'citizen_issue_place',
    'religion',
    'ethnic',
    'nation',
    'province',
    'ward',
    'address',
  ] as const;

  const payload: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in req.body) payload[field] = req.body[field];
  }

  const updated = await CandidateProfileModel.updateByUserId(req.user!.id, payload);
  if (!updated) {
    res.status(404).json({ success: false, message: 'Candidate profile not found' });
    return;
  }

  res.json({
    success: true,
    message: 'Candidate profile updated',
    data: CandidateProfileModel.toFullResponse(updated),
  });
};

export const getCandidateAcademicRecord = async (req: Request, res: Response): Promise<void> => {
  const academic = await CandidateProfileModel.getAcademicByUserId(req.user!.id);
  if (!academic) {
    res.status(404).json({ success: false, message: 'Candidate profile not found' });
    return;
  }
  res.json({ success: true, data: academic });
};

export const upsertCandidateAcademicRecord = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    return;
  }

  const allowedFields = [
    'graduation_year',
    'science_group',
    'priority_score',
  ] as const;

  const payload: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in req.body) payload[field] = req.body[field];
  }

  const updated = await CandidateProfileModel.upsertAcademicRecordByUserId(req.user!.id, payload);
  if (!updated) {
    res.status(404).json({ success: false, message: 'Candidate profile not found' });
    return;
  }

  res.json({ success: true, message: 'Academic record updated', data: updated });
};

export const upsertCandidateExamScoresByGroupAsAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    return;
  }

  const citizenId = Number(req.params.citizenId);
  if (!Number.isInteger(citizenId) || citizenId <= 0) {
    res.status(400).json({ success: false, message: 'citizenId must be a positive integer' });
    return;
  }

  const updated = await CandidateProfileModel.upsertExamScoresByGroupForCandidateByCitizenId(citizenId, {
    science_group: req.body.science_group,
    scores: req.body.scores,
  });

  if (!updated) {
    res.status(404).json({ success: false, message: 'Candidate profile not found' });
    return;
  }

  res.json({ success: true, message: 'Candidate exam scores updated by group', data: updated });
};

export const upsertCandidateAcademicProgress = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    return;
  }

  const payload = {
    grade_10: req.body.grade_10,
    grade_11: req.body.grade_11,
    grade_12: req.body.grade_12,
  };

  const updated = await CandidateProfileModel.upsertAcademicProgressByUserId(req.user!.id, payload);
  if (!updated) {
    res.status(404).json({ success: false, message: 'Candidate profile not found' });
    return;
  }

  res.json({ success: true, message: 'Academic progress updated', data: updated });
};

const mimeToFileType: Record<string, 'PDF' | 'JPEG' | 'PNG'> = {
  'application/pdf': 'PDF',
  'image/jpeg': 'JPEG',
  'image/png': 'PNG',
};

const extractPublicIdFromCloudinaryUrl = (url: string): string | null => {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.\/?]+(?:\?.*)?$/);
  return match?.[1] ?? null;
};

export const listCandidateDocuments = async (req: Request, res: Response): Promise<void> => {
  const documents = await CandidateProfileModel.listDocumentsByUserId(req.user!.id);
  if (documents === null) {
    res.status(404).json({ success: false, message: 'Candidate profile not found' });
    return;
  }
  res.json({ success: true, data: documents });
};

export const uploadCandidateDocument = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    return;
  }

  if (!req.file) {
    res.status(400).json({ success: false, message: 'File is required' });
    return;
  }

  const fileType = mimeToFileType[req.file.mimetype];
  if (!fileType) {
    res.status(400).json({ success: false, message: 'Unsupported file type. Only PDF/JPEG/PNG allowed' });
    return;
  }

  const uploaded = await candidateDocumentDeps.uploadDocumentBuffer(req.file.buffer, req.file.originalname);
  const created = await CandidateProfileModel.createDocumentByUserId(req.user!.id, {
    document_type: req.body.document_type,
    file_name: uploaded.publicId,
    file_url: uploaded.secureUrl,
    file_type: fileType,
    file_size: req.file.size ?? null,
  });

  if (!created) {
    res.status(404).json({ success: false, message: 'Candidate profile not found' });
    return;
  }

  res.status(201).json({ success: true, message: 'Document uploaded', data: created });
};

export const deleteCandidateDocument = async (req: Request, res: Response): Promise<void> => {
  const documentId = Number(req.params.documentId);
  if (!Number.isInteger(documentId) || documentId <= 0) {
    res.status(400).json({ success: false, message: 'documentId must be a positive integer' });
    return;
  }

  const document = await CandidateProfileModel.findDocumentByUserId(req.user!.id, documentId);
  if (!document) {
    res.status(404).json({ success: false, message: 'Document not found' });
    return;
  }

  const publicId = extractPublicIdFromCloudinaryUrl(document.file_url);
  if (!publicId) {
    res.status(500).json({ success: false, message: 'Cannot resolve Cloudinary public id from file URL' });
    return;
  }

  await candidateDocumentDeps.deleteAssetByPublicId(publicId);

  const deleted = await CandidateProfileModel.softDeleteDocumentByUserId(req.user!.id, documentId);
  if (!deleted) {
    res.status(500).json({ success: false, message: 'Failed to soft delete document after cloud delete' });
    return;
  }

  res.json({ success: true, message: 'Document deleted' });
};
