import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { useForm } from 'react-hook-form';
import {
  createDocumentSchema,
  type createDocumentFormData,
} from '../utils/zod/create-document-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  joinExistingDocumentSchema,
  type joinExistingDocumentFormData,
} from '../utils/zod/join-exisiting-document-schema';

const recentDocuments = [
  {
    title: 'test document 1',
    id: '724553919',
    owner: 'vinay',
  },
];

const features = [
  {
    icon: DescriptionOutlinedIcon,
    title: 'Rich Text Editor',
    description: 'Full-featured editing with formatting, tables, and media',
  },
  {
    icon: GroupsOutlinedIcon,
    title: 'Real-time Collaboration',
    description: 'See changes instantly as your team edits together',
  },
  {
    icon: BoltOutlinedIcon,
    title: 'Fast & Secure',
    description: 'PIN-protected documents with instant sync',
  },
];

export const Home = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<createDocumentFormData>({
    resolver: zodResolver(createDocumentSchema),
  });

  const {
    register: joinRegister,
    handleSubmit: handleJoinSubmit,
    formState: { errors: joinErrors },
  } = useForm<joinExistingDocumentFormData>({
    resolver: zodResolver(joinExistingDocumentSchema),
  });

  const onCreateDocument = (data: createDocumentFormData) => {
    console.log(data);
  };

  const onJoinDocument = (data: joinExistingDocumentFormData) => {
    console.log(data);
  };

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <div className="mx-auto w-full max-w-198 px-3 pb-4 pt-17">
        <header className="mb-5 text-center">
          <h1 className="mb-1.5 text-5xl font-extrabold leading-[1.08] text-gray-900">
            CollabDocs
          </h1>
          <p className="mb-2 text-base leading-6 text-slate-950">
            Real-time collaborative document editing, simplified
          </p>
          <p className="text-sm leading-[1.45] text-slate-950">
            Edit PDF, Word, and more with real-time collaboration - completely
            free
          </p>
        </header>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* ── Create New Document ── */}
          <div className="min-h-71 rounded border border-slate-200 p-3">
            <h2 className="mb-1 text-xl font-bold text-slate-950">
              Create New Document
            </h2>
            <p className="mb-6 text-xs text-slate-950">
              Start a new collaborative document
            </p>

            <form
              className="grid gap-4"
              onSubmit={handleSubmit(onCreateDocument)}
            >
              <div>
                <label
                  className="mb-1 block text-xs font-semibold text-slate-950"
                  htmlFor="username"
                >
                  Your Name
                </label>
                <input
                  id="username"
                  placeholder="Enter your name..."
                  {...register('username')}
                  className="h-8 w-full rounded border border-slate-300 px-3 text-xs shadow-sm outline-none transition focus:border-slate-900"
                />
                {errors.username && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors?.username?.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  className="mb-1 block text-xs font-semibold text-slate-950"
                  htmlFor="documentTitle"
                >
                  Document Title
                </label>
                <input
                  id="documentTitle"
                  placeholder="Enter document title..."
                  {...register('title')}
                  className="h-8 w-full rounded border border-slate-300 px-3 text-xs shadow-sm outline-none transition focus:border-slate-900"
                />
                {errors?.title && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors?.title?.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="h-8 w-full rounded border border-slate-200 bg-white text-xs font-semibold text-slate-950 shadow-sm transition hover:bg-slate-50"
              >
                Create Document
              </button>
            </form>
          </div>

          {/* ── Join Existing Document ── */}
          <div className="min-h-71 rounded border border-slate-200 p-3">
            <h2 className="mb-1 text-xl font-bold text-slate-950">
              Join Existing Document
            </h2>
            <p className="mb-6 text-xs text-slate-950">
              Enter document ID and PIN to collaborate
            </p>

            <form
              className="grid gap-4"
              onSubmit={handleJoinSubmit(onJoinDocument)}
            >
              <div>
                <label
                  className="mb-1 block text-xs font-semibold text-slate-950"
                  htmlFor="documentId"
                >
                  Document ID
                </label>
                <input
                  id="documentId"
                  placeholder="9-digit ID"
                  {...joinRegister('documentId')}
                  className="h-8 w-full rounded border border-slate-300 px-3 text-xs shadow-sm outline-none transition focus:border-slate-900"
                />
                {joinErrors?.documentId && (
                  <p className="mt-1 text-xs text-red-500">
                    {joinErrors?.documentId?.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  className="mb-1 block text-xs font-semibold text-slate-950"
                  htmlFor="documentPin"
                >
                  PIN
                </label>
                <div className="relative">
                  <input
                    id="documentPin"
                    type="number"
                    placeholder="4-digit PIN"
                    {...joinRegister('documentPin')}
                    className="h-8 w-full rounded border border-slate-300 px-3 pr-9 text-xs shadow-sm outline-none transition focus:border-slate-900"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-700"
                  >
                    <VisibilityOutlinedIcon fontSize="small" />
                  </button>
                </div>
                {joinErrors.documentPin && (
                  <p className="mt-1 text-xs text-red-500">
                    {joinErrors?.documentPin?.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="h-8 w-full rounded border border-slate-200 bg-white text-xs font-semibold text-slate-950 shadow-sm transition hover:bg-slate-50"
              >
                Continue
              </button>
            </form>
          </div>
        </div>

        {/* ── Recent Documents ── */}
        <section className="mb-3">
          <div className="mb-2 flex items-center justify-center gap-1">
            <AccessTimeOutlinedIcon fontSize="small" />
            <h2 className="text-base font-bold text-slate-950">
              Recent Documents
            </h2>
          </div>

          <div className="grid max-w-124 grid-cols-1 gap-1 sm:grid-cols-2">
            {recentDocuments.map((document) => (
              <div
                key={document.id}
                className="relative min-h-20 rounded border border-slate-200 p-2"
              >
                <p className="mb-1 text-sm font-bold text-slate-950">
                  {document.title}
                </p>
                <p className="mb-1 text-xs text-slate-950">ID: {document.id}</p>
                <p className="text-xs text-slate-950">{document.owner}</p>
                <button
                  type="button"
                  className="absolute right-2 top-3 text-slate-950"
                >
                  <OpenInNewOutlinedIcon fontSize="small" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ── */}
        <section className="grid grid-cols-1 gap-4 text-center md:grid-cols-3">
          {features.map((feature) => {
            const FeatureIcon = feature.icon;
            return (
              <div key={feature.title}>
                <FeatureIcon className="mb-2 text-[43px]" />
                <h3 className="mb-2 text-base font-bold text-slate-950">
                  {feature.title}
                </h3>
                <p className="mx-auto max-w-60 text-xs leading-[1.35] text-slate-950">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
};
