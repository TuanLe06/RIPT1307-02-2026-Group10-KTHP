import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { UniversityModel } from '../models/university.model';
import { MajorModel } from '../models/university.model';

// ===================== UNIVERSITY MANAGEMENT =====================

export const createUniversity = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    return;
  }

  try {
    const { code, name, address, phone, email, website, description } = req.body;

    const existingUniversity = await UniversityModel.findByCode(code);
    if (existingUniversity) {
      res.status(409).json({ success: false, message: 'University code already exists' });
      return;
    }

    const university = await UniversityModel.create({
      code,
      name,
      address,
      phone,
      email,
      website,
      description,
    });

    res.status(201).json({
      success: true,
      message: 'University created successfully',
      data: university,
    });
  } catch (error) {
    console.error('Error creating university:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateUniversity = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    return;
  }

  try {
    const { id } = req.params;
    const { name, address, phone, email, website, description, status } = req.body;

    const university = await UniversityModel.findById(id as string);
    if (!university) {
      res.status(404).json({ success: false, message: 'University not found' });
      return;
    }

    const updated = await UniversityModel.update(id as string, {
      name,
      address,
      phone,
      email,
      website,
      description,
      status,
    });

    if (!updated) {
      res.status(404).json({ success: false, message: 'University not found' });
      return;
    }

    res.json({
      success: true,
      message: 'University updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating university:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteUniversity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const university = await UniversityModel.findById(id as string);
    if (!university) {
      res.status(404).json({ success: false, message: 'University not found' });
      return;
    }

    const deleted = await UniversityModel.softDelete(id as string);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'University not found' });
      return;
    }

    res.json({ success: true, message: 'University deleted successfully' });
  } catch (error) {
    console.error('Error deleting university:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const listUniversities = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await UniversityModel.findAll(page, limit);

    res.json({
      success: true,
      data: result.universities,
      pagination: {
        page,
        limit,
        total: result.total,
        pages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    console.error('Error listing universities:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getUniversityDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const university = await UniversityModel.findById(id as string);
    if (!university) {
      res.status(404).json({ success: false, message: 'University not found' });
      return;
    }

    const result = await MajorModel.findAllByUniversity(id as string);

    res.json({
      success: true,
      data: {
        ...university,
        majors: result.majors,
      },
    });
  } catch (error) {
    console.error('Error getting university details:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ===================== MAJOR MANAGEMENT =====================

export const createMajor = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    return;
  }

  try {
    const { university_id, code, name, description, admission_combinations_id } = req.body;

    const university = await UniversityModel.findById(university_id as string);
    if (!university) {
      res.status(404).json({ success: false, message: 'University not found' });
      return;
    }

    const major = await MajorModel.create({
      university_id: university_id as string,
      code,
      name,
      description,
      admission_combinations_id,
    });

    res.status(201).json({
      success: true,
      message: 'Major created successfully',
      data: major,
    });
  } catch (error) {
    console.error('Error creating major:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateMajor = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    return;
  }

  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    const major = await MajorModel.findById(id as string);
    if (!major) {
      res.status(404).json({ success: false, message: 'Major not found' });
      return;
    }

    const updated = await MajorModel.update(id as string, {
      name,
      description,
      status,
    });

    if (!updated) {
      res.status(404).json({ success: false, message: 'Major not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Major updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating major:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteMajor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const major = await MajorModel.findById(id as string);
    if (!major) {
      res.status(404).json({ success: false, message: 'Major not found' });
      return;
    }

    const deleted = await MajorModel.softDelete(id as string);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Major not found' });
      return;
    }

    res.json({ success: true, message: 'Major deleted successfully' });
  } catch (error) {
    console.error('Error deleting major:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const listMajorsByUniversity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { university_id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const university = await UniversityModel.findById(university_id as string);
    if (!university) {
      res.status(404).json({ success: false, message: 'University not found' });
      return;
    }

    const result = await MajorModel.findAllByUniversity(university_id as string, page, limit);

    res.json({
      success: true,
      data: result.majors,
      pagination: {
        page,
        limit,
        total: result.total,
        pages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    console.error('Error listing majors:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getMajorDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const major = await MajorModel.findById(id as string);
    if (!major) {
      res.status(404).json({ success: false, message: 'Major not found' });
      return;
    }

    res.json({
      success: true,
      data: major,
    });
  } catch (error) {
    console.error('Error getting major details:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
