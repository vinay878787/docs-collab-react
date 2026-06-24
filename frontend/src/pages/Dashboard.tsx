import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { useNavigate } from '@tanstack/react-router';
import { type AxiosError } from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCreateDoc, useDeleteDoc, useListDocs } from '../hooks/docs';
import { Navbar } from '../components/Navbar';
import { type DocListItem } from '../api/docs';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function DocCard({
  doc,
  isOwner,
  onDelete,
  onClick,
}: {
  doc: DocListItem;
  isOwner: boolean;
  onDelete: (id: string) => void;
  onClick: (id: string) => void;
}) {
  const { mutate: deleteDoc, isPending: isDeleting } = useDeleteDoc();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete "${doc.title}"? This cannot be undone.`)) {
      deleteDoc(doc._id, { onSuccess: () => onDelete(doc._id) });
    }
  };

  return (
    <div
      onClick={() => onClick(doc._id)}
      className="group relative flex cursor-pointer flex-col gap-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 transition-all hover:border-blue-300 dark:hover:border-blue-800 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
          <ArticleOutlinedIcon fontSize="small" />
        </div>
        {!isOwner && (
          <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[10px] font-medium text-gray-500 dark:text-gray-400">
            Shared
          </span>
        )}
      </div>

      <div className="flex-1">
        <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {doc.title}
        </h3>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {doc.owner.username} · {timeAgo(doc.updatedAt)}
        </p>
      </div>

      {isOwner && (
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-md text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-500 transition-all"
          aria-label="Delete document"
        >
          <DeleteOutlineOutlinedIcon style={{ fontSize: 16 }} />
        </button>
      )}
    </div>
  );
}

function CreateDocModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('');
  const { mutate: createDoc, isPending, error } = useCreateDoc();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    createDoc(title.trim(), {
      onSuccess: (doc) => {
        onClose();
        navigate({ to: '/docs/$docId', params: { docId: doc._id } });
      },
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-2xl">
        <h2 className="mb-1 text-base font-bold text-gray-900 dark:text-gray-100">
          New Document
        </h2>
        <p className="mb-5 text-xs text-gray-400 dark:text-gray-500">
          Give your document a title to get started.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            ref={inputRef}
            type="text"
            placeholder="Untitled document"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
          />

          {error && (
            <p className="text-xs text-red-500">
              {(error as AxiosError<{ message: string }>).response?.data
                ?.message ?? 'Failed to create document'}
            </p>
          )}

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 items-center rounded-lg border border-gray-300 dark:border-gray-700 px-4 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || isPending}
              className="flex h-9 items-center rounded-lg bg-blue-600 dark:bg-blue-500 px-4 text-sm font-semibold text-white hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export const Dashboard = () => {
  const { user, isResolving } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const { data: docs = [], isLoading } = useListDocs();

  // Auth guard — redirect to login if not authenticated after resolution
  useEffect(() => {
    if (!isResolving && !user) {
      navigate({ to: '/login' });
    }
  }, [isResolving, user, navigate]);

  if (isResolving || !user) return null;

  const myDocs = docs.filter((d) => d.owner._id === user.id);
  const sharedDocs = docs.filter((d) => d.owner._id !== user.id);

  const openDoc = (id: string) =>
    navigate({ to: '/docs/$docId', params: { docId: id } });

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-10">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              My Workspace
            </h1>
            <p className="mt-0.5 text-sm text-gray-400 dark:text-gray-500">
              Welcome back, {user.username}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex h-10 items-center gap-2 rounded-lg bg-blue-600 dark:bg-blue-500 px-4 text-sm font-semibold text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-sm shadow-blue-500/20"
          >
            <AddOutlinedIcon style={{ fontSize: 18 }} />
            New Document
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
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
        ) : (
          <>
            {/* Your documents */}
            <section className="mb-12">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                Your Documents
              </h2>
              {myDocs.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 dark:border-gray-800 py-16 text-center">
                  <ArticleOutlinedIcon className="mb-3 text-gray-300 dark:text-gray-700 text-4xl!" />
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    No documents yet.
                  </p>
                  <button
                    onClick={() => setShowModal(true)}
                    className="mt-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Create your first document →
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {myDocs.map((doc) => (
                    <DocCard
                      key={doc._id}
                      doc={doc}
                      isOwner
                      onDelete={() => {}}
                      onClick={openDoc}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Shared with you */}
            {sharedDocs.length > 0 && (
              <section>
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  Shared with You
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {sharedDocs.map((doc) => (
                    <DocCard
                      key={doc._id}
                      doc={doc}
                      isOwner={false}
                      onDelete={() => {}}
                      onClick={openDoc}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {showModal && <CreateDocModal onClose={() => setShowModal(false)} />}
    </div>
  );
};
