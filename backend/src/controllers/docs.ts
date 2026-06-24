import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';
import { DocumentModel } from '../models/Document';
import { User } from '../models/User';

export const createDoc = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { title } = req.body;
    const userId = req.user!.id;

    const doc = await DocumentModel.create({
      title,
      owner: userId,
      collaborators: [],
      yjsState: null,
    });

    res.status(201).json({ doc });
  } catch (err) {
    next(err);
  }
};

export const listDocs = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;

    const docs = await DocumentModel.find({
      $or: [{ owner: userId }, { 'collaborators.user': userId }],
    })
      .select('-yjsState')
      .sort({ updatedAt: -1 })
      .populate('owner', 'username avatar')
      .populate('collaborators.user', 'username email avatar')
      .lean();

    res.json({ docs });
  } catch (err) {
    next(err);
  }
};

export const getDoc = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const doc = await DocumentModel.findById(id)
      .select('-yjsState')
      .populate('owner', 'username avatar')
      .populate('collaborators.user', 'username email avatar')
      .lean();

    if (!doc) return res.status(404).json({ message: 'Document not found' });

    const ownerId = (
      doc.owner as unknown as { _id: Types.ObjectId }
    )._id.toString();
    const collaborator = doc.collaborators.find(
      (c) =>
        (c.user as unknown as { _id: Types.ObjectId })._id.toString() ===
        userId,
    );

    if (ownerId !== userId && !collaborator) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const userPermission =
      ownerId === userId ? 'write' : collaborator!.permission;

    res.json({ doc, userPermission });
  } catch (err) {
    next(err);
  }
};

export const deleteDoc = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const doc = await DocumentModel.findById(id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    if (doc.owner.toString() !== userId) {
      return res
        .status(403)
        .json({ message: 'Only the owner can delete this document' });
    }

    await doc.deleteOne();
    res.json({ message: 'Document deleted' });
  } catch (err) {
    next(err);
  }
};

export const patchDocTitle = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const userId = req.user!.id;

    const doc = await DocumentModel.findById(id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    const isOwner = doc.owner.toString() === userId;
    const isWriteCollaborator = doc.collaborators.some(
      (c) => c.user.toString() === userId && c.permission === 'write',
    );

    if (!isOwner && !isWriteCollaborator) {
      return res.status(403).json({ message: 'Access denied' });
    }

    doc.title = title;
    await doc.save();

    res.json({ doc: { _id: doc._id, title: doc.title } });
  } catch (err) {
    next(err);
  }
};

export const shareDoc = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { email, permission } = req.body;
    const userId = req.user!.id;

    const doc = await DocumentModel.findById(id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    if (doc.owner.toString() !== userId) {
      return res
        .status(403)
        .json({ message: 'Only the owner can share this document' });
    }

    const targetUser = await User.findOne({
      email: email.toLowerCase(),
    }).select('_id username email avatar');
    if (!targetUser)
      return res.status(404).json({ message: 'No user found with that email' });
    if (targetUser._id.toString() === userId) {
      return res
        .status(400)
        .json({ message: 'You cannot share a document with yourself' });
    }

    const existingIdx = doc.collaborators.findIndex(
      (c) => c.user.toString() === targetUser._id.toString(),
    );

    if (existingIdx >= 0) {
      doc.collaborators[existingIdx].permission = permission;
    } else {
      doc.collaborators.push({
        user: targetUser._id as Types.ObjectId,
        permission,
      });
    }

    await doc.save();

    res.json({
      message: `Shared with ${targetUser.email}`,
      collaborator: { user: targetUser, permission },
    });
  } catch (err) {
    next(err);
  }
};
