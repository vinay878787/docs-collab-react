import { Route } from '@/routes/docs/$docId';

// Placeholder — Milestone 4 will replace this with the full Tiptap + YJS editor.
export const DocEditor = () => {
  const { docId } = Route.useParams();

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <div className="text-center">
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Document ID: {docId}
        </p>
        <p className="mt-2 text-lg font-semibold">
          Editor coming in Milestone 4
        </p>
      </div>
    </div>
  );
};
