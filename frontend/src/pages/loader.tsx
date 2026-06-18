import CodeIcon from '@mui/icons-material/Code';

export const FullPageLoader = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-gray-950">
      <div className="flex items-center gap-3">
        <CodeIcon className="animate-pulse text-4xl text-blue-600 dark:text-blue-400" />

        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          CodeCollab
        </h1>
      </div>

      <div className="mt-6 flex gap-2">
        <div className="h-3 w-3 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.3s]" />
        <div className="h-3 w-3 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.15s]" />
        <div className="h-3 w-3 animate-bounce rounded-full bg-blue-600" />
      </div>

      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        Loading...
      </p>
    </div>
  );
};
