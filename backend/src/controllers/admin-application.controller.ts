import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { ApplicationModel } from '../models/application.model';
import { ApplicationStatusLogModel, EmailNotificationModel } from '../models/notification.model';
import { CandidateProfileModel } from '../models/candidate-profile.model';

// ===================== ADMIN APPLICATION MANAGEMENT =====================

export const listApplications = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const universityId = req.query.university_id as string | undefined;
    const majorId = req.query.major_id as string | undefined;
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;

    const result = await ApplicationModel.findAllByAdmin(page, limit, {
      university_id: universityId,
      major_id: majorId,
      status,
      search,
    });

    res.json({
      success: true,
      data: result.applications,
      pagination: {
        page,
        limit,
        total: result.total,
        pages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    console.error('Error listing applications:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const searchApplications = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const { university_id, major_id, status, keyword } = req.body;

    const result = await ApplicationModel.findAllByAdmin(page, limit, {
      university_id,
      major_id,
      status,
      search: keyword,
    });

    res.json({
      success: true,
      data: result.applications,
      pagination: {
        page,
        limit,
        total: result.total,
        pages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    console.error('Error searching applications:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const filterApplications = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const { university_id, major_id, status } = req.body;

    const result = await ApplicationModel.findAllByAdmin(page, limit, {
      university_id,
      major_id,
      status,
    });

    res.json({
      success: true,
      data: result.applications,
      pagination: {
        page,
        limit,
        total: result.total,
        pages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    console.error('Error filtering applications:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getApplicationDetailAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const application = await ApplicationModel.findByIdWithDetails(parseInt(id as string));
    if (!application) {
      res.status(404).json({ success: false, message: 'Application not found' });
      return;
    }

    const statusLogs = await ApplicationStatusLogModel.findByApplicationId(parseInt(id as string));

    res.json({
      success: true,
      data: {
        ...application,
        status_logs: statusLogs,
      },
    });
  } catch (error) {
    console.error('Error getting application details:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateApplicationStatus = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    return;
  }

  try {
    const { id } = req.params;
    const { status, reject_reason } = req.body;

    const application = await ApplicationModel.findById(parseInt(id as string));
    if (!application) {
      res.status(404).json({ success: false, message: 'Application not found' });
      return;
    }

    const oldStatus = application.status;
    const updated = await ApplicationModel.updateStatus(
      parseInt(id as string),
      status,
      req.user!.id,
      reject_reason
    );

    if (!updated) {
      res.status(404).json({ success: false, message: 'Application not found' });
      return;
    }

    // Log status change
    await ApplicationStatusLogModel.create({
      application_id: parseInt(id as string),
      old_status: oldStatus,
      new_status: status,
      changed_by: req.user!.id,
      note: `Status changed by admin. ${reject_reason ? `Reason: ${reject_reason}` : ''}`,
    });

    // Send notification email to candidate
    // Get candidate email from candidate profile
    const candidateProfile = await CandidateProfileModel.getByUserId(application.candidate_id);
    if (updated && candidateProfile) {
      await EmailNotificationModel.create({
        receiver_id: application.candidate_id,
        receiver_email: candidateProfile.email,
        subject: `Cập nhật trạng thái hồ sơ - ${application.application_code}`,
        content: `Hồ sơ ${application.application_code} đã được cập nhật sang trạng thái mới. Vui lòng kiểm tra chi tiết.`,
        type: 'STATUS_CHANGED',
        sent_by: req.user!.id,
      });
    }

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
