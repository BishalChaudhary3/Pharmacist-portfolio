import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-4 text-display-sm font-serif">Page not found</h1>
      <p className="mt-4 text-text-muted">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-11 items-center rounded-md bg-primary px-6 text-sm font-medium text-white hover:bg-primary/90"
      >
        Back to home
      </Link>
    </div>
  );
}