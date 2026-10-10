"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="eyebrow">Error</p>
      <h1 className="mt-4 text-display-sm font-serif">Something went wrong</h1>
      <p className="mt-4 text-text-muted">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="mt-8 inline-flex h-11 items-center rounded-md bg-primary px-6 text-sm font-medium text-white hover:bg-primary/90"
      >
        Try again
      </button>
    </div>
  );
}