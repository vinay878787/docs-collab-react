import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import CodeIcon from '@mui/icons-material/Code';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import HighlightOutlinedIcon from '@mui/icons-material/HighlightOutlined';
import LockPersonOutlinedIcon from '@mui/icons-material/LockPersonOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import { Link } from '@tanstack/react-router';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const features = [
  {
    icon: GroupsOutlinedIcon,
    title: 'Real-time Collaboration',
    description:
      'Multiple people edit simultaneously. Every keystroke syncs in milliseconds — no refresh, no conflicts.',
  },
  {
    icon: VerifiedUserOutlinedIcon,
    title: 'Secured by Claude AI',
    description:
      'Claude AI and SonarQube scan your code for sensitive data and vulnerabilities before you share.',
  },
  {
    icon: HighlightOutlinedIcon,
    title: 'Syntax Highlighting',
    description:
      'Paste any code block and it auto-highlights. 60+ languages including TypeScript, Python, Go, Rust, SQL.',
  },
  {
    icon: AutoFixHighOutlinedIcon,
    title: 'Code Formatting',
    description:
      'One-click Prettier formatting inside any code block. Consistent style across your whole team.',
  },
  {
    icon: ShareOutlinedIcon,
    title: 'Granular Sharing',
    description:
      'Invite by email. Assign read or write access per person. Revoke anytime. You stay in control.',
  },
  {
    icon: LockPersonOutlinedIcon,
    title: 'Data Stays in India',
    description:
      'Every document and keystroke lives exclusively on Indian servers. Zero cross-border transfer, ever.',
  },
];

const modes = [
  {
    icon: ArticleOutlinedIcon,
    label: 'Document Editing',
    headline: 'Everything Google Docs does — and more',
    points: [
      'Rich text: headings, bold, italic, bullet lists',
      "Real-time cursors — see who's where",
      'Share with read or write permissions',
      "Works offline, syncs when you're back",
    ],
  },
  {
    icon: CodeIcon,
    label: 'Code Sharing',
    headline: 'Built for developers, not just writers',
    points: [
      'Syntax-highlighted code blocks, 60+ languages',
      'One-click Prettier formatting',
      'Claude AI flags sensitive data before you share',
      'No code leaves India',
    ],
  },
];

export const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section
        className="relative mx-auto max-w-5xl px-4 pb-20 pt-24 text-center"
        style={{
          background:
            'radial-gradient(ellipse 80% 40% at 50% -10%, rgba(59,130,246,0.12), transparent)',
        }}
      >
        {/* Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-7">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            Secured by Claude AI &amp; SonarQube
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/60 px-3 py-1 text-xs font-semibold text-green-700 dark:text-green-300">
            🇮🇳 Data stays in India
          </span>
        </div>

        {/* Headline */}
        <h1 className="mb-6 text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
          <span className="text-gray-900 dark:text-gray-50">Write Docs.</span>
          <br />
          <span className="bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Share Code.
          </span>
          <br />
          <span className="text-gray-900 dark:text-gray-50">
            Stay in India.
          </span>
        </h1>

        <p className="mx-auto mb-3 max-w-2xl text-lg leading-relaxed text-gray-500 dark:text-gray-400">
          The enhanced Google Docs built for Indian teams — rich document
          editing <em>and</em> developer-grade code sharing in one secure
          workspace.
        </p>
        <p className="mx-auto mb-10 max-w-lg text-sm text-gray-400 dark:text-gray-500">
          Read, write, and share safely. Powered by Claude AI. No data stored
          outside India.
        </p>

        {/* CTAs */}
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          {user ? (
            <Link
              to="/dashboard"
              className="flex h-12 items-center rounded-lg bg-blue-600 dark:bg-blue-500 px-8 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 dark:hover:bg-blue-600 transition-all no-underline"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="flex h-12 items-center rounded-lg bg-blue-600 dark:bg-blue-500 px-8 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 dark:hover:bg-blue-600 transition-all no-underline"
              >
                Start for Free
              </Link>
              <Link
                to="/login"
                className="flex h-12 items-center rounded-lg border border-gray-300 dark:border-gray-700 px-8 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors no-underline"
              >
                Sign In
              </Link>
            </>
          )}
        </div>

        {/* Trust pills */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-400 dark:text-gray-500">
          <span>🔒 End-to-end access control</span>
          <span className="hidden sm:inline">·</span>
          <span>⚡ Millisecond sync</span>
          <span className="hidden sm:inline">·</span>
          <span>✦ No credit card required</span>
        </div>
      </section>

      {/* Two-mode section */}
      <section className="mx-auto max-w-5xl px-4 pb-24">
        <h2 className="mb-2 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
          One workspace. Two superpowers.
        </h2>
        <p className="mb-10 text-center text-sm text-gray-500 dark:text-gray-400">
          Switch between rich documents and developer-grade code editing — in
          the same file.
        </p>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {modes.map((mode) => {
            const Icon = mode.icon;
            return (
              <div
                key={mode.label}
                className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 p-7 transition-colors"
              >
                <div className="mb-4 inline-flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                    <Icon fontSize="small" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                    {mode.label}
                  </span>
                </div>
                <h3 className="mb-4 text-base font-bold text-gray-900 dark:text-gray-100">
                  {mode.headline}
                </h3>
                <ul className="space-y-2">
                  {mode.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400"
                    >
                      <span className="mt-0.5 text-blue-500">✓</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features grid */}
      <section className="mx-auto max-w-5xl px-4 pb-24">
        <h2 className="mb-2 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
          Built for teams who care about security
        </h2>
        <p className="mb-10 text-center text-sm text-gray-500 dark:text-gray-400">
          Your documents and code stay where they belong — in India, under your
          control.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 transition-all hover:border-blue-300 dark:hover:border-blue-800 hover:shadow-sm"
              >
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900 transition-colors">
                  <Icon fontSize="small" />
                </div>
                <h3 className="mb-1.5 text-sm font-semibold text-gray-900 dark:text-gray-100">
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

      {/* Security callout */}
      <section className="mx-auto max-w-5xl px-4 pb-24">
        <div
          className="relative overflow-hidden rounded-2xl border border-blue-200 dark:border-blue-900 px-8 py-12 text-center"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 120%, rgba(59,130,246,0.1), transparent)',
          }}
        >
          <div className="absolute inset-0 bg-blue-50/50 dark:bg-blue-950/20" />
          <div className="relative">
            <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
              <LockPersonOutlinedIcon />
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-100">
              Your data never leaves India
            </h3>
            <p className="mx-auto max-w-lg text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              Every document, every keystroke, every shared code snippet —
              stored exclusively on Indian infrastructure. No foreign clouds. No
              hidden transfers. Claude AI keeps your code safe, not surveilled.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 transition-colors">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
            India's documents and code are safer here
          </h2>
          <p className="mb-8 text-sm text-gray-500 dark:text-gray-400">
            No credit card required. Create a workspace, invite your team, and
            collaborate — entirely within India.
          </p>
          {user ? (
            <Link
              to="/dashboard"
              className="inline-flex h-11 items-center rounded-lg bg-blue-600 dark:bg-blue-500 px-8 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 dark:hover:bg-blue-600 transition-all no-underline"
            >
              Open Dashboard
            </Link>
          ) : (
            <Link
              to="/register"
              className="inline-flex h-11 items-center rounded-lg bg-blue-600 dark:bg-blue-500 px-8 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 dark:hover:bg-blue-600 transition-all no-underline"
            >
              Create Free Account
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};
