import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { ApplicationModel } from '../models/application.model';
import { CandidateProfileModel } from '../models/candidate-profile.model';
import { MajorModel, UniversityModel } from '../models/university.model';
import { AdmissionCombinationModel } from '../models/admissionCombination.model';
import { EmailNotificationModel, ApplicationStatusLogModel } from '../models/notification.model';
import { UserModel } from '../models/user.model';
import { isWithinDeadline, getDeadlineStatus } from '../utils/deadline.util';

const SUBJECT_MISMATCH_MESSAGE = 'Môn thi đã khai báo không khớp với tổ hợp xét tuyển đã chọn';

const normalizeSubjectName = (subject: string): string =>
  subject
    .normalize('NFD')
    .replace(/[đĐ]/g, 'd')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

const SUBJECT_CODE_BY_NORMALIZED_NAME: Record<string, string> = {
  toan: 'TOAN',
  van: 'VAN',
  nguvan: 'VAN',
  ly: 'LY',
  la: 'LY',
  vatly: 'LY',
  hoa: 'HOA',
  haa: 'HOA',
  hoahoc: 'HOA',
  sinh: 'SINH',
  su: 'SU',
  sa: 'SU',
  lichsu: 'SU',
  dia: 'DIA',
  aaa: 'DIA',
  dialy: 'DIA',
  gdktpl: 'GDKTPL',
  tinhoc: 'TINHOC',
  tinhac: 'TINHOC',
  congnghe: 'CONGNGHE',
  cangngha: 'CONGNGHE',
  anh: 'NGOAINGU',
  ngoaingu: 'NGOAINGU',
  ngoainga: 'NGOAINGU',
};

const toSubjectCode = (subject: string): string =>
  SUBJECT_CODE_BY_NORMALIZED_NAME[normalizeSubjectName(subject)] ?? subject.trim().toUpperCase();

export const getDeadlineInfo = async (_req: Request, res: Response): Promise<void> => {
  res.json({ success: true, data: getDeadlineStatus() });
};

export const createApplication = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    return;
  }

  try {
    if (!isWithinDeadline()) {
      const info = getDeadlineStatus();
      res.status(400).json({ success: false, message: info.message, deadline: info });
      return;
    }

    const { university_id, major_id, combination_id, subject_1_score, subject_2_score, subject_3_score } = req.body;

    const candidateProfile = await CandidateProfileModel.getByUserId(req.user!.id);
    if (!candidateProfile) {
      res.status(404).json({ success: false, message: 'Candidate profile not found' });
      return;
    }

    const alreadySubmitted = await ApplicationModel.hasSubmittedInCurrentPeriod(req.user!.id);
    if (alreadySubmitted) {
      res.status(409).json({ success: false, message: 'Bạn đã đăng ký xét tuyển trong kỳ tuyển sinh này và không thể đăng ký thêm.' });
      return;
    }

    const university = await UniversityModel.findById(university_id.toString());
    if (!university) {
      res.status(404).json({ success: false, message: 'University not found' });
      return;
    }

    const major = await MajorModel.findById(major_id.toString());
    if (!major) {
      res.status(404).json({ success: false, message: 'Major not found' });
      return;
    }

    const combination = await AdmissionCombinationModel.findById(combination_id.toString());
    if (!combination) {
      res.status(404).json({ success: false, message: 'Combination not found' });
      return;
    }

    const application = await ApplicationModel.create({
      candidate_id: req.user!.id,
      university_id,
      major_id,
      combination_id,
      subject_1_score: subject_1_score ?? null,
      subject_2_score: subject_2_score ?? null,
      subject_3_score: subject_3_score ?? null,
    });

    res.status(201).json({
      success: true,
      message: 'Application created successfully',
      data: application,
    });
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const submitApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!isWithinDeadline()) {
      const info = getDeadlineStatus();
      res.status(400).json({ success: false, message: info.message, deadline: info });
      return;
    }

    const { application_id } = req.params;

    const application = await ApplicationModel.findByIdWithDetails(parseInt(application_id as string));
    if (!application) {
      res.status(404).json({ success: false, message: 'Application not found' });
      return;
    }

    const candidateProfile = await CandidateProfileModel.getByUserId(req.user!.id);
    if (!candidateProfile || candidateProfile.user_id !== application.candidate_id) {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (application.status !== 'DRAFT') {
      res.status(400).json({ success: false, message: 'Application is not in draft status' });
      return;
    }

    const alreadySubmitted = await ApplicationModel.hasSubmittedInCurrentPeriod(req.user!.id);
    if (alreadySubmitted) {
      res.status(409).json({ success: false, message: 'Bạn đã đăng ký xét tuyển trong kỳ tuyển sinh này và không thể nộp thêm.' });
      return;
    }

    const combination = await AdmissionCombinationModel.findById(application.combination_id);
    const academic = await CandidateProfileModel.getAcademicByUserId(req.user!.id);
    const requiredSubjects = combination
      ? [combination.subject_1, combination.subject_2, combination.subject_3].map(toSubjectCode)
      : [];
    const declaredSubjects = new Set(
      academic?.academic_record?.exam_scores.map((score) => score.subject_code.toUpperCase()) ?? []
    );
    const missingSubjects = requiredSubjects.filter((subject) => !declaredSubjects.has(subject));

    if (!combination || requiredSubjects.length !== 3 || missingSubjects.length > 0) {
      res.status(400).json({
        success: false,
        message: SUBJECT_MISMATCH_MESSAGE,
        missing_subjects: missingSubjects.length ? missingSubjects : requiredSubjects,
        required_subjects: requiredSubjects,
      });
      return;
    }

    const submitted = await ApplicationModel.submit(parseInt(application_id as string));

    await ApplicationStatusLogModel.create({
      application_id: parseInt(application_id as string),
      old_status: 'DRAFT',
      new_status: 'SUBMITTED',
      changed_by: req.user!.id,
      note: 'Application submitted by candidate',
    });

    const user = req.user!;
    await EmailNotificationModel.create({
      receiver_id: req.user!.id,
      receiver_email: user.email,
      subject: 'Hồ sơ nộp thành công',
      content: `Hồ sơ với mã ${application.application_code} đã được nộp thành công. Chúng tôi sẽ xem xét hồ sơ của bạn sớm nhất.`,
      type: 'APPLICATION_SUBMITTED',
    });

    try {
      const admins = await UserModel.findByRole('ADMIN');
      const candidateName = candidateProfile?.full_name || 'Thí sinh';
      for (const admin of admins) {
        await EmailNotificationModel.create({
          receiver_id: admin.id,
          receiver_email: admin.email,
          subject: 'Thí sinh vừa nộp hồ sơ mới',
          content: `Thí sinh ${candidateName} vừa nộp hồ sơ mã ${application.application_code} - ${application.university_name} - ${application.major_name}. Vui lòng vào kiểm tra và xét duyệt.`,
          type: 'APPLICATION_SUBMITTED',
          sent_by: req.user!.id,
        });
      }
    } catch {
      console.error('Failed to notify admins');
    }

    try {
      const io = req.app.get('io');
      const candidateName = candidateProfile?.full_name || 'Thí sinh';
      io.to('admin').emit('new-submission', {
        application_id: parseInt(application_id as string),
        application_code: application.application_code,
        candidate_name: candidateName,
        university_name: application.university_name,
        major_name: application.major_name,
        submitted_at: new Date().toISOString(),
      });
    } catch {
      console.error('Failed to emit socket event');
    }

    res.json({
      success: true,
      message: 'Application submitted successfully',
      data: submitted,
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getApplications = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const candidateProfile = await CandidateProfileModel.getByUserId(req.user!.id);
    if (!candidateProfile) {
      res.status(404).json({ success: false, message: 'Candidate profile not found' });
      return;
    }

    const result = await ApplicationModel.findByCandidateId(req.user!.id, page, limit);

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
    console.error('Error getting applications:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getApplicationDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { application_id } = req.params;

    const application = await ApplicationModel.findById(parseInt(application_id as string));
    if (!application) {
      res.status(404).json({ success: false, message: 'Application not found' });
      return;
    }

    const candidateProfile = await CandidateProfileModel.getByUserId(req.user!.id);
    if (!candidateProfile || candidateProfile.user_id !== application.candidate_id) {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const statusLogs = await ApplicationStatusLogModel.findByApplicationId(parseInt(application_id as string));

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

export const getApplicationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { application_id } = req.params;

    const application = await ApplicationModel.findById(parseInt(application_id as string));
    if (!application) {
      res.status(404).json({ success: false, message: 'Application not found' });
      return;
    }

    const candidateProfile = await CandidateProfileModel.getByUserId(req.user!.id);
    if (!candidateProfile || candidateProfile.user_id !== application.candidate_id) {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const statusMap = {
      DRAFT: { display: 'Nháp', color: 'gray' },
      SUBMITTED: { display: 'Đã nộp', color: 'blue' },
      PENDING_REVIEW: { display: 'Chờ duyệt', color: 'orange' },
      APPROVED: { display: 'Đã duyệt', color: 'green' },
      REJECTED: { display: 'Từ chối', color: 'red' },
      PASSED: { display: 'Đã đỗ', color: 'green' },
      FAILED: { display: 'Không đỗ', color: 'red' },
    };

    res.json({
      success: true,
      data: {
        application_code: application.application_code,
        status: application.status,
        status_display: statusMap[application.status as keyof typeof statusMap],
        submitted_at: application.submitted_at,
        reviewed_at: application.reviewed_at,
        reject_reason: application.reject_reason,
      },
    });
  } catch (error) {
    console.error('Error getting application status:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const { application_id } = req.params;

    const application = await ApplicationModel.findById(parseInt(application_id as string));
    if (!application) {
      res.status(404).json({ success: false, message: 'Application not found' });
      return;
    }

    const candidateProfile = await CandidateProfileModel.getByUserId(req.user!.id);
    if (!candidateProfile || candidateProfile.user_id !== application.candidate_id) {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (application.status !== 'DRAFT') {
      res.status(400).json({ success: false, message: 'Only draft applications can be deleted' });
      return;
    }

    const alreadySubmitted = await ApplicationModel.hasSubmittedInCurrentPeriod(req.user!.id);
    if (alreadySubmitted) {
      res.status(409).json({ success: false, message: 'Bạn đã đăng ký xét tuyển trong kỳ tuyển sinh này và không thể xóa thêm.' });
      return;
    }

    const deleted = await ApplicationModel.delete(parseInt(application_id as string));
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Application not found' });
      return;
    }

    res.json({ success: true, message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
