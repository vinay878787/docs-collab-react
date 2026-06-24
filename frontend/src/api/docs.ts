import { docsApi } from './axios';

export interface DocCollaborator {
  user: { _id: string; username: string; email: string; avatar: string };
  permission: 'read' | 'write';
}

export interface DocPublicAccess {
  enabled: boolean;
  permission: 'read' | 'write';
}

export interface DocListItem {
  _id: string;
  title: string;
  owner: { _id: string; username: string; avatar: string };
  collaborators: DocCollaborator[];
  publicAccess: DocPublicAccess;
  createdAt: string;
  updatedAt: string;
}

//We are maintaining "" empty trailing route since axios is automatically integrating / in the end . Need to remove that.
export const createDoc = async (title: string): Promise<DocListItem> => {
  const res = await docsApi.post<{ doc: DocListItem }>('', { title });
  return res.data.doc;
};

export const listDocs = async (): Promise<DocListItem[]> => {
  const res = await docsApi.get<{ docs: DocListItem[] }>('');
  return res.data.docs;
};

export const getDoc = async (
  id: string,
): Promise<{ doc: DocListItem; userPermission: 'read' | 'write' }> => {
  const res = await docsApi.get<{
    doc: DocListItem;
    userPermission: 'read' | 'write';
  }>(`/${id}`);
  return res.data;
};

export const deleteDoc = async (id: string): Promise<void> => {
  await docsApi.delete(`/${id}`);
};

export const patchDocTitle = async (
  id: string,
  title: string,
): Promise<{ _id: string; title: string }> => {
  const res = await docsApi.patch<{ doc: { _id: string; title: string } }>(
    `/${id}/title`,
    { title },
  );
  return res.data.doc;
};

export const shareDoc = async (
  id: string,
  email: string,
  permission: 'read' | 'write',
): Promise<{ message: string; collaborator: DocCollaborator }> => {
  const res = await docsApi.post<{
    message: string;
    collaborator: DocCollaborator;
  }>(`/${id}/share`, { email, permission });
  return res.data;
};

export const removeCollaborator = async (
  docId: string,
  userId: string,
): Promise<void> => {
  await docsApi.delete(`/${docId}/share/${userId}`);
};

export const setPublicAccess = async (
  id: string,
  enabled: boolean,
  permission: 'read' | 'write',
): Promise<{ message: string; publicAccess: DocPublicAccess }> => {
  const res = await docsApi.patch<{
    message: string;
    publicAccess: DocPublicAccess;
  }>(`/${id}/public-access`, { enabled, permission });
  return res.data;
};
