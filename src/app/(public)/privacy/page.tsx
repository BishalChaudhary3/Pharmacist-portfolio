// privacy/page.tsx
export const metadata = { title: "Privacy Policy" };
export default function PrivacyPage() {
  return (
    <div className="container-prose section-padding">
      <h1 className="text-display-sm font-serif">Privacy Policy</h1>
      <div className="prose-editorial mt-8">
        <p>
          This website collects only the information you voluntarily submit through the
          contact form (name, email, subject, and message). This information is used
          solely to respond to your inquiry and is never sold or shared with third parties.
        </p>
        <p>
          Anonymous analytics may be collected to understand site usage. You can contact
          us at any time to request deletion of your submitted data.
        </p>
      </div>
    </div>
  );
}