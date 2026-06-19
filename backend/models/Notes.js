import mongoose from 'mongoose';

/**
 * Notes Schema
 * Stores PDF notes uploaded by admin
 */
const notesSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Literature', 'General'],
    },
    subject: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'png', 'jpg', 'jpeg', 'docx', 'pptx', 'any'],
      default: 'pdf',
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    downloads: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Notes = mongoose.model('Notes', notesSchema);
export default Notes;
