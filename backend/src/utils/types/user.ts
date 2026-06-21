import { Types } from 'mongoose';

export interface ICollaborator {
  user: Types.ObjectId;
  permission: 'read' | 'write';
}

export interface IDocument extends Document {
  title: string;
  owner: Types.ObjectId;
  collaborators: ICollaborator[];
  content: string;
}
