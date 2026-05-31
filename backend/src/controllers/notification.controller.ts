import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { EmailNotificationModel } from '../models/notification.model';
import { ApplicationModel } from '../models/application.model';

// ===================== EMAIL NOTIFICATION MANAGEMENT =====================

export const sendManualNotification = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    return;
  }

  try {
    const { receiver_id, receiver_email, subject, content, type } = req.body;

    const notification = await EmailNotificationModel.create({
      receiver_id,
      receiver_email,
      subject,
      content,
      type: type || 'MANUAL',
      sent_by: req.user!.id,
    });

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: notification,
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const sendNotificationToMultipleCandidates = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    return;
  }

  try {
    const { university_id, major_id, status, subject, content } = req.body;

    // Find all applications matching the filters
    const result = await ApplicationModel.findAllByAdmin(1, 10000, {
      university_id,
      major_id,
      status,
    });

    const notifications: any[] = [];

    for (const app of result.applications) {
      try {
        const notification = await EmailNotificationModel.create({
          receiver_id: app.candidate_id,
          receiver_email: '', // TODO: Fetch candidate email from profile
          subject,
          content,
          type: 'MANUAL',
          sent_by: req.user!.id,
        });
        notifications.push(notification);
      } catch (err) {
        console.error(`Failed to send notification to candidate ${app.candidate_id}:`, err);
      }
    }

    res.status(201).json({
      success: true,
      message: `${notifications.length} notifications created successfully`,
      data: {
        total_sent: notifications.length,
        failed: result.applications.length - notifications.length,
      },
    });
  } catch (error) {
    console.error('Error sending notifications to multiple candidates:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await EmailNotificationModel.findByReceiverId(req.user.id, page, limit);

    res.json({
      success: true,
      data: result.notifications,
      pagination: {
        page,
        limit,
        total: result.total,
        pages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    res.status(500).json({ success: false, message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const getNotificationDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const notification = await EmailNotificationModel.findById(parseInt(id as string));
    if (!notification) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }

    if (notification.receiver_id !== req.user!.id && req.user!.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error('Error getting notification details:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getPendingNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;

    const notifications = await EmailNotificationModel.findPending(limit);

    res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error('Error getting pending notifications:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const markNotificationAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const notification = await EmailNotificationModel.markAsRead(parseInt(id as string));
    if (!notification) {
      res.status(404).json({ success: false, message: 'Notification not found or already read' });
      return;
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateNotificationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, error_message } = req.body;

    if (!['SENT', 'FAILED'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status' });
      return;
    }

    const notification = await EmailNotificationModel.updateStatus(
      parseInt(id as string),
      status,
      error_message
    );

    if (!notification) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Notification status updated successfully',
      data: notification,
    });
  } catch (error) {
    console.error('Error updating notification status:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
