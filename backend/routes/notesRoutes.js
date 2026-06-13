import express from 'express';
import { getAllNotes, getNoteById, uploadNote, updateNote, deleteNote } from '../controllers/notesController.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

/**
 * Notes Routes
 */

// Admin route to get all notes (including unpublished)
router.get('/admin/all', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    let query = {}; // Admin sees ALL notes, not just published

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const Notes = (await import('../models/Notes.js')).default;

    // Lean queries + field selection for performance
    const notes = await Notes.find(query)
      .lean()
      .select('_id title description category subject fileUrl fileName uploadedAt createdAt')
      .populate('uploadedBy', 'name')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum)
      .exec();

    const total = await Notes.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      count: notes.length,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalNotes: total,
        perPage: limitNum,
      },
      notes,
    });
  } catch (error) {
    next(error);
  }
});

// Public routes
router.get('/', getAllNotes);
router.get('/:id', getNoteById);

// Admin routes
router.post('/', protect, authorize('admin'), upload.single('file'), uploadNote);
router.put('/:id', protect, updateNote);
router.delete('/:id', protect, authorize('admin'), deleteNote);

export default router;
