// disclaimer/page.tsx
import { db } from "@/lib/db";

export const metadata = { title: "Medical Disclaimer" };

export default async function DisclaimerPage() {
  const settings = await db.siteSettings.findFirst();
  return (
    <div className="container-prose section-padding">
      <h1 className="text-display-sm font-serif">Medical Disclaimer</h1>
      <div className="prose-editorial mt-8">
        <p>
          {settings?.medicalDisclaimer ||
            "The information on this website is for general educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition."}
        </p>
      </div>
    </div>
  );
}