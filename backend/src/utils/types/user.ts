import { Types } from 'mongoose';

export interface ICollaboratorDoc {
  user: Types.ObjectId;
  permission: 'read' | 'write';
}

export interface IDocumentDoc {
  title: string;
  owner: Types.ObjectId;
  collaborators: ICollaboratorDoc[];
  yjsState: Buffer | null;
}
