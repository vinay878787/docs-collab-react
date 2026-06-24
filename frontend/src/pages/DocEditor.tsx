import { useEffect, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Route } from '@/routes/docs/$docId';
import { TiptapEditor } from '@/components/editor/TiptapEditor';
import { Navbar } from '@/components/Navbar';
import { getDoc, patchDocTitle } from '@/api/docs';
import { useAuth } from '@/context/AuthContext';
import { useCollaboration } from '@/hooks/useCollaboration';
import type { DocListItem } from '@/api/docs';

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export const DocEditor = () => {
  const { docId } = Route.useParams();
  const { user, isResolving } = useAuth();
  const navigate = useNavigate();

  const [doc, setDoc] = useState<DocListItem | null>(null);
  const [title, setTitle] = useState('');

  const debouncedTitle = useDebounce(title, 1000);
  const serverTitle = useRef('');
  const isTitleInitialized = useRef(false);

  // Real-time collaboration: Y.Doc + IndexedDB offline cache + Socket.io sync
  const { ydoc, synced, providerRef } = useCollaboration({ docId, user });

  // Auth guard
  useEffect(() => {
    if (!isResolving && !user) navigate({ to: '/login' });
  }, [isResolving, user, navigate]);

  // Fetch doc metadata (title, owner, collaborators)
  useEffect(() => {
    getDoc(docId)
      .then(({ doc: fetched }) => {
        setDoc(fetched);
        setTitle(fetched.title);
        serverTitle.current = fetched.title;
        isTitleInitialized.current = true;
      })
      .catch(() => {});
  }, [docId]);

  // Debounced title auto-save
  useEffect(() => {
    if (!isTitleInitialized.current || debouncedTitle === serverTitle.current)
      return;
    patchDocTitle(docId, debouncedTitle)
      .then(() => {
        serverTitle.current = debouncedTitle;
      })
      .catch(() => {});
  }, [docId, debouncedTitle]);

  const isOwner = doc ? doc.owner._id === user?.id : false;
  const canEdit =
    !doc ||
    isOwner ||
    doc.collaborators.some(
      (c) => c.user._id === user?.id && c.permission === 'write',
    );

  if (isResolving || !synced) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-950">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2.5 w-2.5 animate-bounce rounded-full bg-blue-500"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 print:bg-white">
      <div className="print:hidden">
        <Navbar />
      </div>

      <TiptapEditor
        ydoc={ydoc}
        editable={canEdit}
        provider={providerRef.current}
        user={user}
        header={
          <div className="mb-8">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled"
              readOnly={!canEdit}
              className="w-full bg-transparent text-4xl font-bold text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-700 focus:outline-none"
            />
            {doc && (
              <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                {doc.owner.username}
                {isOwner ? ' · Owner' : ' · Shared with you'}
              </p>
            )}
            <hr className="mt-6 border-gray-100 dark:border-gray-800" />
          </div>
        }
      />
    </div>
  );
};
