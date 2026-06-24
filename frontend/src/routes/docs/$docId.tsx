import { createFileRoute } from '@tanstack/react-router';
import { DocEditor } from '@/pages/DocEditor';

export const Route = createFileRoute('/docs/$docId')({
  component: DocEditor,
});
