import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { ApplicationModel } from '../models/application.model';
import { ApplicationStatusLogModel, EmailNotificationModel } from '../models/notification.model';
import { CandidateProfileModel } from '../models/candidate-profile.model';
import { CandidateIdentityVerificationModel } from '../models/candidate-identity-verification.model';
import { AdmissionCombinationModel } from '../models/admissionCombination.model';

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

    const candidateId = application.candidate_id;
    const [candidateProfile, academicRecord, documents, combination, ekycStatus] = await Promise.all([
      CandidateProfileModel.getFullByUserId(candidateId),
      CandidateProfileModel.getAcademicByUserId(candidateId),
      CandidateProfileModel.listDocumentsByUserId(candidateId),
      application.combination_id
        ? AdmissionCombinationModel.findById(application.combination_id)
        : Promise.resolve(null),
      CandidateIdentityVerificationModel.getOrDefaultByUserId(candidateId),
    ]);

    res.json({
      success: true,
      data: {
        ...application,
        status_logs: statusLogs,
        candidate_profile: candidateProfile,
        academic_record: academicRecord,
        documents: documents || [],
        combination,
        ekyc: ekycStatus,
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
    const candidateProfile = await CandidateProfileModel.getByUserId(application.candidate_id);
    if (updated && candidateProfile) {
      let subject = '';
      let content = '';
      if (status === 'APPROVED') {
        subject = `Hồ sơ đã được duyệt - ${application.application_code}`;
        content = `Hồ sơ ${application.application_code} của bạn đã được duyệt. Vui lòng theo dõi thông báo tiếp theo từ văn phòng tuyển sinh.`;
      } else if (status === 'REJECTED') {
        subject = `Hồ sơ đã bị từ chối - ${application.application_code}`;
        content = `Hồ sơ ${application.application_code} của bạn đã bị từ chối.${reject_reason ? ` Lý do: ${reject_reason}` : ''}\n\nVui lòng liên hệ văn phòng tuyển sinh nếu cần thêm thông tin.`;
      } else if (status === 'PASSED') {
        subject = `Chúc mừng! Bạn đã trúng tuyển - ${application.application_code}`;
        content = `Chúc mừng! Hồ sơ ${application.application_code} của bạn đã trúng tuyển.\n\nVui lòng hoàn tất thủ tục nhập học theo hướng dẫn.`;
      } else if (status === 'FAILED') {
        subject = `Kết quả xét tuyển - ${application.application_code}`;
        content = `Hồ sơ ${application.application_code} của bạn không đỗ.${reject_reason ? ` Lý do: ${reject_reason}` : ''}\n\nChúc bạn may mắn trong các đợt tuyển sinh tiếp theo.`;
      } else {
        subject = `Cập nhật trạng thái hồ sơ - ${application.application_code}`;
        content = `Hồ sơ ${application.application_code} đã được cập nhật sang trạng thái mới. Vui lòng kiểm tra chi tiết.`;
      }
      await EmailNotificationModel.create({
        receiver_id: application.candidate_id,
        receiver_email: candidateProfile.email,
        subject,
        content,
        type: 'STATUS_CHANGED',
        sent_by: req.user!.id,
      });
    }

    // Emit real-time notification
    try {
      const io = req.app.get('io');
      io.to(`user:${application.candidate_id}`).emit('status-changed', {
        application_id: parseInt(id as string),
        application_code: application.application_code,
        old_status: oldStatus,
        new_status: status,
        reject_reason: reject_reason || null,
        updated_at: new Date().toISOString(),
      });
      io.to('admin').emit('application-updated', {
        application_id: parseInt(id as string),
        application_code: application.application_code,
        old_status: oldStatus,
        new_status: status,
        updated_by: req.user!.id,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to emit socket event:', err);
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
