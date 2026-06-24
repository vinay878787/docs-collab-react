import { useEffect, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import { Route } from '@/routes/docs/$docId';
import { TiptapEditor } from '@/components/editor/TiptapEditor';
import { Navbar } from '@/components/Navbar';
import { ShareModal } from '@/components/editor/ShareModal';
import { getDoc, patchDocTitle } from '@/api/docs';
import { useAuth } from '@/context/AuthContext';
import { useCollaboration } from '@/hooks/useCollaboration';
import type { DocCollaborator, DocListItem, DocPublicAccess } from '@/api/docs';

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
  const [userPermission, setUserPermission] = useState<'read' | 'write'>(
    'read',
  );
  const [title, setTitle] = useState('');
  const [showShare, setShowShare] = useState(false);

  const debouncedTitle = useDebounce(title, 1000);
  const serverTitle = useRef('');
  const isTitleInitialized = useRef(false);

  // Real-time collaboration: Y.Doc + IndexedDB offline cache + Socket.io sync
  const { ydoc, synced, providerRef } = useCollaboration({ docId, user });

  // Auth guard
  useEffect(() => {
    if (!isResolving && !user) navigate({ to: '/login' });
  }, [isResolving, user, navigate]);

  // Fetch doc metadata (title, owner, collaborators, permission)
  useEffect(() => {
    getDoc(docId)
      .then(({ doc: fetched, userPermission: perm }) => {
        setDoc(fetched);
        setUserPermission(perm);
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
  // Use the permission the server confirmed — covers owner, collaborator, and public-link access.
  // While doc is still loading (null), default to read-only for safety.
  const canEdit = doc === null ? false : userPermission === 'write';

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
            <div className="flex items-start gap-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Untitled"
                readOnly={!canEdit}
                className="min-w-0 flex-1 bg-transparent text-4xl font-bold text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-700 focus:outline-none"
              />
              {isOwner && (
                <button
                  onClick={() => setShowShare(true)}
                  className="mt-2 flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 dark:bg-blue-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                >
                  <PersonAddOutlinedIcon style={{ fontSize: 16 }} />
                  Share
                </button>
              )}
            </div>
            {doc && (
              <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                {doc.owner.username}
                {isOwner ? ' · Owner' : ' · Shared with you'}
                {doc.collaborators.length > 0 &&
                  ` · ${doc.collaborators.length} collaborator${doc.collaborators.length > 1 ? 's' : ''}`}
              </p>
            )}
            <hr className="mt-6 border-gray-100 dark:border-gray-800" />
          </div>
        }
      />
      {showShare && doc && (
        <ShareModal
          doc={doc}
          onClose={() => setShowShare(false)}
          onCollaboratorsChange={(collaborators: DocCollaborator[]) =>
            setDoc((prev) => (prev ? { ...prev, collaborators } : prev))
          }
          onPublicAccessChange={(publicAccess: DocPublicAccess) =>
            setDoc((prev) => (prev ? { ...prev, publicAccess } : prev))
          }
        />
      )}
    </div>
  );
};
