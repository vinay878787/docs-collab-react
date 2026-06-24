import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createDoc,
  deleteDoc,
  listDocs,
  shareDoc,
  removeCollaborator,
  setPublicAccess,
} from '../api/docs';

export const useListDocs = () =>
  useQuery({ queryKey: ['docs'], queryFn: listDocs });

export const useCreateDoc = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (title: string) => createDoc(title),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['docs'] }),
  });
};

export const useDeleteDoc = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDoc(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['docs'] }),
  });
};

export const useShareDoc = (docId: string) =>
  useMutation({
    mutationFn: ({
      email,
      permission,
    }: {
      email: string;
      permission: 'read' | 'write';
    }) => shareDoc(docId, email, permission),
  });

export const useRemoveCollaborator = () =>
  useMutation({
    mutationFn: ({ docId, userId }: { docId: string; userId: string }) =>
      removeCollaborator(docId, userId),
  });

export const useSetPublicAccess = () =>
  useMutation({
    mutationFn: ({
      docId,
      enabled,
      permission,
    }: {
      docId: string;
      enabled: boolean;
      permission: 'read' | 'write';
    }) => setPublicAccess(docId, enabled, permission),
  });
