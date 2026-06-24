import { useEffect, useRef, useState } from 'react';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonRemoveOutlinedIcon from '@mui/icons-material/PersonRemoveOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import { type AxiosError } from 'axios';
import {
  useShareDoc,
  useRemoveCollaborator,
  useSetPublicAccess,
} from '@/hooks/docs';
import type { DocCollaborator, DocListItem, DocPublicAccess } from '@/api/docs';

function Avatar({ username, avatar }: { username: string; avatar: string }) {
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={username}
        className="h-8 w-8 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold">
      {username[0]?.toUpperCase()}
    </div>
  );
}

const ACCESS_OPTIONS: {
  value: 'off' | 'read' | 'write';
  label: string;
  desc: string;
  Icon: React.ElementType;
}[] = [
  {
    value: 'off',
    label: 'Restricted',
    desc: 'Only people you invite can access',
    Icon: LockOutlinedIcon,
  },
  {
    value: 'read',
    label: 'Anyone with link — Viewer',
    desc: 'Any signed-in user can view',
    Icon: PublicOutlinedIcon,
  },
  {
    value: 'write',
    label: 'Anyone with link — Editor',
    desc: 'Any signed-in user can edit',
    Icon: LinkOutlinedIcon,
  },
];

interface Props {
  doc: DocListItem;
  onClose: () => void;
  onCollaboratorsChange: (collaborators: DocCollaborator[]) => void;
  onPublicAccessChange?: (publicAccess: DocPublicAccess) => void;
}

export function ShareModal({
  doc,
  onClose,
  onCollaboratorsChange,
  onPublicAccessChange,
}: Props) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'read' | 'write'>('write');
  const [successMsg, setSuccessMsg] = useState('');
  const [collaborators, setCollaborators] = useState<DocCollaborator[]>(
    doc.collaborators,
  );
  const [publicAccess, setPublicAccessState] = useState<DocPublicAccess>(
    doc.publicAccess ?? { enabled: false, permission: 'read' },
  );
  const [copied, setCopied] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const {
    mutate: share,
    isPending: isSharing,
    error: shareError,
  } = useShareDoc(doc._id);
  const { mutate: remove, isPending: isRemoving } = useRemoveCollaborator();
  const { mutate: updatePublicAccess, isPending: isSavingPublic } =
    useSetPublicAccess();

  // Derive the current "access level" value for the selector
  const accessLevel: 'off' | 'read' | 'write' = publicAccess.enabled
    ? publicAccess.permission
    : 'off';

  const handleAccessChange = (next: 'off' | 'read' | 'write') => {
    const newAccess: DocPublicAccess =
      next === 'off'
        ? { enabled: false, permission: publicAccess.permission }
        : { enabled: true, permission: next };

    setPublicAccessState(newAccess);
    updatePublicAccess(
      {
        docId: doc._id,
        enabled: newAccess.enabled,
        permission: newAccess.permission,
      },
      {
        onSuccess: (data) => {
          setPublicAccessState(data.publicAccess);
          onPublicAccessChange?.(data.publicAccess);
        },
        onError: () => {
          // Revert on failure
          setPublicAccessState(publicAccess);
        },
      },
    );
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSuccessMsg('');

    share(
      { email: email.trim(), permission },
      {
        onSuccess: (data) => {
          setCollaborators((prev) => {
            const idx = prev.findIndex(
              (c) => c.user._id === data.collaborator.user._id,
            );
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = data.collaborator;
              return next;
            }
            return [...prev, data.collaborator];
          });
          onCollaboratorsChange(collaborators);
          setSuccessMsg(data.message);
          setEmail('');
        },
      },
    );
  };

  const handleRemove = (userId: string) => {
    remove(
      { docId: doc._id, userId },
      {
        onSuccess: () => {
          const next = collaborators.filter((c) => c.user._id !== userId);
          setCollaborators(next);
          onCollaboratorsChange(next);
        },
      },
    );
  };

  const errorMsg = shareError
    ? ((shareError as AxiosError<{ message: string }>).response?.data
        ?.message ?? 'Something went wrong')
    : '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-5 py-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Share document
            </h2>
            <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500 line-clamp-1">
              {doc.title || 'Untitled'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <CloseOutlinedIcon style={{ fontSize: 16 }} />
          </button>
        </div>

        {/* General access */}
        <div className="border-b border-gray-100 dark:border-gray-800 px-5 py-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            General access
          </p>

          {/* Access level selector */}
          <div className="flex flex-col gap-1">
            {ACCESS_OPTIONS.map(({ value, label, desc, Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => handleAccessChange(value)}
                disabled={isSavingPublic}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors disabled:opacity-50 ${
                  accessLevel === value
                    ? 'bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-300 dark:ring-blue-700'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-900'
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    accessLevel === value
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  <Icon style={{ fontSize: 16 }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-medium ${accessLevel === value ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'}`}
                  >
                    {label}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {desc}
                  </p>
                </div>
                {accessLevel === value && (
                  <div className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                )}
              </button>
            ))}
          </div>

          {/* Copy link — shown when public access is on */}
          {publicAccess.enabled && (
            <button
              type="button"
              onClick={() => void handleCopyLink()}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ContentCopyOutlinedIcon style={{ fontSize: 15 }} />
              {copied ? 'Link copied!' : 'Copy link'}
            </button>
          )}
        </div>

        {/* Invite by email */}
        <form
          onSubmit={handleShare}
          className="px-5 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800"
        >
          <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
            Invite by email
          </label>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setSuccessMsg('');
              }}
              className="h-9 min-w-0 flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            />
            <div className="flex overflow-hidden rounded-lg border border-gray-300 dark:border-gray-700 text-xs font-semibold shrink-0">
              {(['write', 'read'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPermission(p)}
                  className={`px-2.5 py-1 transition-colors capitalize ${
                    permission === p
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <p className="mt-1.5 text-xs text-red-500">{errorMsg}</p>
          )}
          {successMsg && (
            <p className="mt-1.5 text-xs text-green-600 dark:text-green-400">
              {successMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={!email.trim() || isSharing}
            className="mt-3 h-9 w-full rounded-lg bg-blue-600 dark:bg-blue-500 text-sm font-semibold text-white hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSharing ? 'Inviting…' : 'Invite'}
          </button>
        </form>

        {/* People with access */}
        <div className="px-5 py-3">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            People with access
          </p>

          <ul className="space-y-2 max-h-44 overflow-y-auto pr-1">
            {/* Owner row */}
            <li className="flex items-center gap-3">
              <Avatar username={doc.owner.username} avatar={doc.owner.avatar} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                  {doc.owner.username}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-blue-50 dark:bg-blue-900/40 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-300">
                Owner
              </span>
            </li>

            {/* Collaborator rows */}
            {collaborators.map((c) => (
              <li key={c.user._id} className="flex items-center gap-3">
                <Avatar username={c.user.username} avatar={c.user.avatar} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                    {c.user.username}
                  </p>
                  <p className="truncate text-xs text-gray-400 dark:text-gray-500">
                    {c.user.email}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    c.permission === 'write'
                      ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {c.permission}
                </span>
                <button
                  onClick={() => handleRemove(c.user._id)}
                  disabled={isRemoving}
                  className="shrink-0 flex h-6 w-6 items-center justify-center rounded-md text-gray-300 dark:text-gray-600 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-500 transition-colors disabled:opacity-40"
                  title="Remove access"
                >
                  <PersonRemoveOutlinedIcon style={{ fontSize: 14 }} />
                </button>
              </li>
            ))}

            {collaborators.length === 0 && (
              <li className="py-2 text-center text-xs text-gray-400 dark:text-gray-500">
                No collaborators yet
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
