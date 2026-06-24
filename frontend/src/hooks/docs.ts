import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createDoc, deleteDoc, listDocs } from '../api/docs';

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
