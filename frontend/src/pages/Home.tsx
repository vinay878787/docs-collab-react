import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import FormatColorTextOutlinedIcon from '@mui/icons-material/FormatColorTextOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Link } from '@tanstack/react-router';
import { Navbar } from '../components/Navbar';

const features = [
  {
    icon: GroupsOutlinedIcon,
    title: 'Live Multi-Cursor',
    description:
      'See exactly where your teammates are editing in real time. Every keystroke appears instantly for all collaborators.',
  },
  {
    icon: FormatColorTextOutlinedIcon,
    title: 'Rich Formatting',
    description:
      'Full formatting toolbar — headings, bullet lists, inline code blocks, bold, italic, and more for structured content.',
  },
  {
    icon: BoltOutlinedIcon,
    title: 'Instant Sync',
    description:
      'Changes propagate in milliseconds. No refresh, no lag — your team always works from the same live document.',
  },
  {
    icon: LockOutlinedIcon,
    title: 'Secure Rooms',
    description:
      'PIN-protected documents keep your code private. Share only with people who have the ID and PIN.',
  },
];

export const Home = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      <Navbar />

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 pb-20 pt-24 text-center">
        <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/60 px-3.5 py-1 text-xs font-medium text-blue-700 dark:text-blue-300">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
          Real-time collaboration
        </div>

        <h1 className="mb-5 text-5xl font-extrabold leading-[1.1] tracking-tight text-gray-900 dark:text-gray-50 sm:text-6xl">
          Code Together.
          <br />
          <span className="text-blue-600 dark:text-blue-400">Ship Faster.</span>
        </h1>

        <p className="mx-auto mb-8 max-w-lg text-lg leading-relaxed text-gray-500 dark:text-gray-400">
          A collaborative workspace for code and documents. Multiple people edit
          simultaneously — like Google Docs, purpose-built for code sharing.
        </p>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/register"
            className="flex h-11 items-center rounded-md bg-blue-600 dark:bg-blue-500 px-7 text-sm font-semibold text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors no-underline"
          >
            Get Started — It's Free
          </Link>
          <Link
            to="/login"
            className="flex h-11 items-center rounded-md border border-gray-300 dark:border-gray-700 px-7 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors no-underline"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-4 pb-24">
        <h2 className="mb-2 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
          Everything you need to collaborate on code
        </h2>
        <p className="mb-10 text-center text-sm text-gray-500 dark:text-gray-400">
          One shared workspace. No setup. Start editing with your team in
          seconds.
        </p>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-5 transition-colors"
              >
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  <Icon fontSize="small" />
                </div>
                <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {feature.title}
                </h3>
                <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
            Start collaborating today
          </h2>
          <p className="mb-7 text-sm text-gray-500 dark:text-gray-400">
            No credit card required. Create a document, share the ID and PIN,
            and your team is in.
          </p>
          <Link
            to="/register"
            className="inline-flex h-10 items-center rounded-md bg-blue-600 dark:bg-blue-500 px-7 text-sm font-semibold text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors no-underline"
          >
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
};
