export interface ICollaborator {
  userId: string;
  permission: 'read' | 'write';
}

export interface IDocumentOwner {
  _id: string;
  username: string;
  avatar: string;
}

export interface IDocument {
  _id: string;
  title: string;
  owner: IDocumentOwner;
  collaborators: ICollaborator[];
  createdAt: string;
  updatedAt: string;
}
