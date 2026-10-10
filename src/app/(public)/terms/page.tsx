// terms/page.tsx
export const metadata = { title: "Terms of Use" };
export default function TermsPage() {
  return (
    <div className="container-prose section-padding">
      <h1 className="text-display-sm font-serif">Terms of Use</h1>
      <div className="prose-editorial mt-8">
        <p>
          By using this website you agree to use it for lawful purposes only. Content is
          provided for general informational and educational purposes.
        </p>
      </div>
    </div>
  );
}