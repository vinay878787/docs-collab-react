import { IDocument } from '@docs-collab/shared';
import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema<IDocument>(
  {
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
      minlength: [1, 'Document length may be at least 1 character'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    collaborators: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },

        permission: {
          type: String,
          enum: ['read', 'write'],
          default: 'read',
          required: true,
        },
      },
    ],
    content: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  },
);

export const DocumentModel = mongoose.model<IDocument>(
  'Document',
  documentSchema,
);
