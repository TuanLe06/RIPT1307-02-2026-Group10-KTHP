import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { EkycError, EkycService } from '../services/ekyc.service';

const toPublicMessage = (error: EkycError): string => {
  const messageByCode: Record<string, string> = {
    EKYC_PROVIDER_CONFIG_MISSING: 'eKYC provider is not configured',
    EKYC_PROVIDER_ERROR: 'eKYC provider error',
    EKYC_PROVIDER_TIMEOUT: 'eKYC provider timeout',
    EKYC_DOCUMENT_DOWNLOAD_FAILED: 'Cannot read uploaded document',
    EKYC_WRONG_SIDE: 'Citizen ID side is invalid',
    EKYC_CITIZEN_ID_MISMATCH: 'Citizen ID does not match profile',
    EKYC_FACE_MISMATCH: 'Portrait does not match citizen ID',
    EKYC_FRONT_NOT_VERIFIED: 'Citizen ID front document is not verified',
  };
  return messageByCode[error.code] ?? error.message;
};

const handleEkycError = (error: unknown, res: Response): void => {
  if (error instanceof EkycError) {
    res.status(error.statusCode).json({
      success: false,
      message: toPublicMessage(error),
      code: error.code,
    });
    return;
  }

  const statusCode = (error as Error & { statusCode?: number })?.statusCode;
  if (statusCode) {
    res.status(statusCode).json({
      success: false,
      message: error instanceof Error ? error.message : 'eKYC request failed',
    });
    return;
  }

  console.error('eKYC error:', error);
  res.status(500).json({ success: false, message: 'Internal server error' });
};

const ensureValidRequest = (req: Request, res: Response): boolean => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    return false;
  }
  return true;
};

export const getCandidateEkycStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const status = await EkycService.getStatus(req.user!.id);
    res.json({ success: true, data: status });
  } catch (error) {
    handleEkycError(error, res);
  }
};

export const verifyCandidateCitizenIdFront = async (req: Request, res: Response): Promise<void> => {
  if (!ensureValidRequest(req, res)) return;

  try {
    const status = await EkycService.verifyFront(req.user!.id, Number(req.body.document_id));
    const ok = status.front_status === 'VERIFIED';
    res.status(ok ? 200 : 422).json({
      success: ok,
      message: ok ? 'Citizen ID front verified' : 'Citizen ID front verification failed',
      data: status,
    });
  } catch (error) {
    handleEkycError(error, res);
  }
};

export const verifyCandidateCitizenIdBack = async (req: Request, res: Response): Promise<void> => {
  if (!ensureValidRequest(req, res)) return;

  try {
    const status = await EkycService.verifyBack(req.user!.id, Number(req.body.document_id));
    const ok = status.back_status === 'VERIFIED';
    res.status(ok ? 200 : 422).json({
      success: ok,
      message: ok ? 'Citizen ID back verified' : 'Citizen ID back verification failed',
      data: status,
    });
  } catch (error) {
    handleEkycError(error, res);
  }
};

export const verifyCandidatePortrait = async (req: Request, res: Response): Promise<void> => {
  if (!ensureValidRequest(req, res)) return;

  try {
    const status = await EkycService.verifyFace(
      req.user!.id,
      Number(req.body.front_document_id),
      Number(req.body.portrait_document_id)
    );
    const ok = status.face_status === 'VERIFIED';
    res.status(ok ? 200 : 422).json({
      success: ok,
      message: ok ? 'Portrait verified' : 'Portrait verification failed',
      data: status,
    });
  } catch (error) {
    handleEkycError(error, res);
  }
};
