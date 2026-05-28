import { Request, Response } from 'express';
import pool from '../config/database';
import { RowDataPacket } from 'mysql2/promise';
import { ApplicationModel } from '../models/application.model';

// ===================== STATISTICS & REPORTING =====================

export const getStatisticsByUniversity = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        u.id,
        u.code,
        u.name,
        COUNT(DISTINCT a.id) as total_applications,
        SUM(CASE WHEN a.status = 'SUBMITTED' THEN 1 ELSE 0 END) as submitted,
        SUM(CASE WHEN a.status = 'PENDING_REVIEW' THEN 1 ELSE 0 END) as pending_review,
        SUM(CASE WHEN a.status = 'APPROVED' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN a.status = 'REJECTED' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN a.status = 'PASSED' THEN 1 ELSE 0 END) as passed,
        SUM(CASE WHEN a.status = 'FAILED' THEN 1 ELSE 0 END) as failed
       FROM universities u
       LEFT JOIN applications a ON u.id = a.university_id
       WHERE u.status = 'ACTIVE'
       GROUP BY u.id, u.code, u.name
       ORDER BY total_applications DESC`
    );

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error('Error getting statistics by university:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getStatisticsByMajor = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        m.id,
        m.code,
        m.name,
        u.name as university_name,
        COUNT(DISTINCT a.id) as total_applications,
        SUM(CASE WHEN a.status = 'SUBMITTED' THEN 1 ELSE 0 END) as submitted,
        SUM(CASE WHEN a.status = 'PENDING_REVIEW' THEN 1 ELSE 0 END) as pending_review,
        SUM(CASE WHEN a.status = 'APPROVED' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN a.status = 'REJECTED' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN a.status = 'PASSED' THEN 1 ELSE 0 END) as passed,
        SUM(CASE WHEN a.status = 'FAILED' THEN 1 ELSE 0 END) as failed
       FROM majors m
       LEFT JOIN universities u ON m.university_id = u.id
       LEFT JOIN applications a ON m.id = a.major_id
       WHERE m.status = 'ACTIVE'
       GROUP BY m.id, m.code, m.name, u.name
       ORDER BY total_applications DESC`
    );

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error('Error getting statistics by major:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getStatisticsByStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        a.status,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM applications), 2) as percentage
       FROM applications a
       GROUP BY a.status
       ORDER BY count DESC`
    );

    const statusNames: Record<string, string> = {
      DRAFT: 'Nháp',
      SUBMITTED: 'Đã nộp',
      PENDING_REVIEW: 'Chờ duyệt',
      APPROVED: 'Đã duyệt',
      REJECTED: 'Từ chối',
      PASSED: 'Đã đỗ',
      FAILED: 'Không đỗ',
    };

    const formattedRows = rows.map(row => ({
      ...row,
      status_display: statusNames[row.status as string],
    }));

    res.json({
      success: true,
      data: formattedRows,
    });
  } catch (error) {
    console.error('Error getting statistics by status:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getOverallStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const [totalApps] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM applications`
    );

    const [statusStats] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'SUBMITTED' THEN 1 ELSE 0 END) as submitted,
        SUM(CASE WHEN status = 'PENDING_REVIEW' THEN 1 ELSE 0 END) as pending_review,
        SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN status = 'PASSED' THEN 1 ELSE 0 END) as passed,
        SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed
       FROM applications`
    );

    const [universityCount] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM universities WHERE status = 'ACTIVE'`
    );

    const [majorCount] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM majors WHERE status = 'ACTIVE'`
    );

    const [candidateCount] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(DISTINCT candidate_id) as total FROM applications`
    );

    res.json({
      success: true,
      data: {
        total_applications: (totalApps[0] as any).total,
        status_statistics: statusStats[0],
        total_universities: (universityCount[0] as any).total,
        total_majors: (majorCount[0] as any).total,
        total_candidates: (candidateCount[0] as any).total,
      },
    });
  } catch (error) {
    console.error('Error getting overall statistics:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getStatisticsByDateRange = async (req: Request, res: Response): Promise<void> => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      res.status(400).json({ success: false, message: 'start_date and end_date are required' });
      return;
    }

    const query = `SELECT 
        DATE(a.submitted_at) as date,
        COUNT(*) as count,
        SUM(CASE WHEN a.status = 'APPROVED' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN a.status = 'REJECTED' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN a.status = 'PASSED' THEN 1 ELSE 0 END) as passed,
        SUM(CASE WHEN a.status = 'FAILED' THEN 1 ELSE 0 END) as failed
       FROM applications a
       WHERE a.submitted_at BETWEEN ? AND ?
       GROUP BY DATE(a.submitted_at)
       ORDER BY date ASC`;
    const [rows] = await pool.query<RowDataPacket[]>(query, [start_date, end_date]);

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error('Error getting statistics by date range:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getDetailedReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const universityId = req.query.university_id ? parseInt(req.query.university_id as string) : undefined;
    const majorId = req.query.major_id ? parseInt(req.query.major_id as string) : undefined;

    const statistics = await ApplicationModel.getStatistics(universityId, majorId);

    res.json({
      success: true,
      data: {
        total: statistics.total,
        submitted: statistics.submitted,
        pending_review: statistics.pending_review,
        approved: statistics.approved,
        rejected: statistics.rejected,
        passed: statistics.passed,
        failed: statistics.failed,
        approval_rate: statistics.total ? ((statistics.approved / statistics.total) * 100).toFixed(2) : 0,
        pass_rate: statistics.total ? ((statistics.passed / statistics.total) * 100).toFixed(2) : 0,
      },
    });
  } catch (error) {
    console.error('Error getting detailed report:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
