import { createFileRoute } from '@tanstack/react-router';
import '../index.css';
export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <div className="p-2 text-red-900">
      <h3>Welcome Home!</h3>
    </div>
  );
}
