import mongoose from 'mongoose';
import { IDocumentDoc } from '../utils/types';

const documentSchema = new mongoose.Schema<IDocumentDoc>(
  {
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
      minlength: [1, 'Document title must be at least 1 character'],
      maxlength: [200, 'Document title must be under 200 characters'],
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
    yjsState: {
      type: Buffer,
      default: null,
    },
    publicAccess: {
      enabled: { type: Boolean, default: false },
      permission: { type: String, enum: ['read', 'write'], default: 'read' },
    },
  },
  {
    timestamps: true,
  },
);

export const DocumentModel = mongoose.model<IDocumentDoc>(
  'Document',
  documentSchema,
);
