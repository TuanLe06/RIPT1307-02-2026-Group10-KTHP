import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AdmissionCombinationModel, MajorCombinationModel } from '../models/combination.model';
import { MajorModel } from '../models/university.model';

// ===================== ADMISSION COMBINATION MANAGEMENT =====================

export const createAdmissionCombination = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    return;
  }

  try {
    const { code, subject_1, subject_2, subject_3 } = req.body;

    const existing = await AdmissionCombinationModel.findByCode(code);
    if (existing) {
      res.status(409).json({ success: false, message: 'Combination code already exists' });
      return;
    }

    const combination = await AdmissionCombinationModel.create({
      code,
      subject_1,
      subject_2,
      subject_3,
    });

    res.status(201).json({
      success: true,
      message: 'Admission combination created successfully',
      data: combination,
    });
  } catch (error) {
    console.error('Error creating admission combination:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const listAdmissionCombinations = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await AdmissionCombinationModel.findAll(page, limit);

    res.json({
      success: true,
      data: result.combinations,
      pagination: {
        page,
        limit,
        total: result.total,
        pages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    console.error('Error listing admission combinations:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ===================== MAJOR COMBINATION MANAGEMENT =====================

export const addCombinationToMajor = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    return;
  }

  try {
    const { major_id, combination_id, min_score } = req.body;

    const major = await MajorModel.findById(major_id as string);
    if (!major) {
      res.status(404).json({ success: false, message: 'Major not found' });
      return;
    }

    const combination = await AdmissionCombinationModel.findById(combination_id);
    if (!combination) {
      res.status(404).json({ success: false, message: 'Combination not found' });
      return;
    }

    const existing = await MajorCombinationModel.findByMajorIdAndCombinationId(major_id, combination_id);
    if (existing) {
      res.status(409).json({ success: false, message: 'This combination is already associated with this major' });
      return;
    }

    const majorCombination = await MajorCombinationModel.create({
      major_id,
      combination_id,
      min_score,
    });

    res.status(201).json({
      success: true,
      message: 'Combination added to major successfully',
      data: majorCombination,
    });
  } catch (error) {
    console.error('Error adding combination to major:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateMajorCombination = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    return;
  }

  try {
    const { id } = req.params;
    const { min_score, status } = req.body;

    const majorCombination = await MajorCombinationModel.findById(parseInt(id as string));
    if (!majorCombination) {
      res.status(404).json({ success: false, message: 'Major combination not found' });
      return;
    }

    const updated = await MajorCombinationModel.update(parseInt(id as string), {
      min_score,
      status,
    });

    if (!updated) {
      res.status(404).json({ success: false, message: 'Major combination not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Major combination updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating major combination:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const removeCombinationFromMajor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const majorCombination = await MajorCombinationModel.findById(parseInt(id as string));
    if (!majorCombination) {
      res.status(404).json({ success: false, message: 'Major combination not found' });
      return;
    }

    const deleted = await MajorCombinationModel.delete(parseInt(id as string));
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Major combination not found' });
      return;
    }

    res.json({ success: true, message: 'Combination removed from major successfully' });
  } catch (error) {
    console.error('Error removing combination from major:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const listCombinationsByMajor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { major_id } = req.params;

    const major = await MajorModel.findById(major_id as string);
    if (!major) {
      res.status(404).json({ success: false, message: 'Major not found' });
      return;
    }

    const combinations = await MajorCombinationModel.findByMajorId(parseInt(major_id as string));

    res.json({
      success: true,
      data: combinations,
    });
  } catch (error) {
    console.error('Error listing combinations by major:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
