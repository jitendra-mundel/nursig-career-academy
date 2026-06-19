import Notes from '../models/Notes.js';
import mongoose from 'mongoose';
import { Readable } from 'stream';
import path from 'path';

/**
 * Get All Notes (Optimized for 3000+ users)
 * GET /api/notes?page=1&limit=20&category=Math&search=quadratic
 */
export const getAllNotes = async (req, res, next) => {
  try {
    const { category, fileType, search, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    let query = { isPublished: true };

    if (category) {
      query.category = category;
    }
    if (fileType) {
      query.fileType = fileType;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Lean queries + field selection for performance
    const notes = await Notes.find(query)
      .lean()
      .select('title description category subject fileUrl fileName fileType uploadedAt')
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
};

/**
 * Get Single Note
 * GET /api/notes/:id
 */
export const getNoteById = async (req, res, next) => {
  try {
    const note = await Notes.findById(req.params.id).populate('uploadedBy', 'name email');

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    res.status(200).json({
      success: true,
      note,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload Note (Admin Only)
 * POST /api/notes
 */
export const uploadNote = async (req, res, next) => {
  try {
    // Expect multer.memoryStorage -> req.file.buffer available
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const { title, description, category, subject, fileType } = req.body;

    if (!title || !category || !subject) {
      return res.status(400).json({ success: false, message: 'Please provide title, category, and subject' });
    }

    // Use a deterministic filename for GridFS to keep existing `/uploads/:filename` URL format
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = req.file.originalname ? path.extname(req.file.originalname) : '';
    const gridFilename = `${uniqueSuffix}${ext}`;

    // Ensure mongoose connection is ready
    if (!mongoose.connection || !mongoose.connection.db) {
      return res.status(500).json({ success: false, message: 'Database not connected' });
    }

    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });

    // Stream the buffer into GridFS
    const readableStream = Readable.from(req.file.buffer);
    const uploadStream = bucket.openUploadStream(gridFilename, { contentType: req.file.mimetype });

    readableStream.pipe(uploadStream)
      .on('error', (err) => {
        next(err);
      })
      .on('finish', async () => {
        try {
          const note = await Notes.create({
            title,
            description,
            category,
            subject,
            fileType: fileType || 'pdf',
            // Keep the same public URL shape so frontend doesn't change
            fileUrl: `/uploads/${gridFilename}`,
            fileName: req.file.originalname,
            uploadedBy: req.user.id,
          });

          res.status(201).json({ success: true, message: 'Note uploaded successfully', note });
        } catch (e) {
          next(e);
        }
      });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Note (Admin Only)
 * PUT /api/notes/:id
 */
export const updateNote = async (req, res, next) => {
  try {
    let note = await Notes.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    // Check if user is the uploader or admin
    if (note.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this note',
      });
    }

    note = await Notes.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      note,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Note (Admin Only)
 * DELETE /api/notes/:id
 */
export const deleteNote = async (req, res, next) => {
  try {
    const note = await Notes.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    // Check if user is the uploader or admin
    if (note.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this note',
      });
    }

    await Notes.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export default { getAllNotes, getNoteById, uploadNote, updateNote, deleteNote };
