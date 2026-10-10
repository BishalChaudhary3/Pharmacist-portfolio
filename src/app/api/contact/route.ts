import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { contactFormSchema } from "@/lib/validation";
import { db } from "@/lib/db";
import { sendContactNotification } from "@/lib/email";

function getRatelimit(): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  // Only enable rate limiting if BOTH vars are set to real values.
  // Rejects empty strings, whitespace, and the placeholder examples.
  const isValidUrl =
    url &&
    url.startsWith("https://") &&
    !url.includes("your-redis");

  const isValidToken =
    token &&
    token.length > 10 &&
    !token.includes("your-token");

  if (!isValidUrl || !isValidToken) return null;

  return new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(5, "1 h"),
  });
}

export async function POST(request: Request) {
  try {
    const ratelimit = getRatelimit();

    if (ratelimit) {
      try {
        const ip =
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          request.headers.get("x-real-ip") ??
          "anonymous";

        const { success } = await ratelimit.limit(ip);

        if (!success) {
          return NextResponse.json(
            { error: "Too many requests. Please try again later." },
            { status: 429 }
          );
        }
      } catch (rateError) {
        // Never let a rate-limiter failure block the contact form.
        console.error("Rate limiter error (continuing without limit):", rateError);
      }
    }

    const body = await request.json();
    const parsed = contactFormSchema.safeParse(body);

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        if (issue.path[0]) errors[String(issue.path[0])] = issue.message;
      });
      return NextResponse.json({ errors }, { status: 400 });
    }

    const { name, email, subject, message } = parsed.data;

    await db.contactMessage.create({
      data: { name, email, subject, message },
    });

    try {
      await sendContactNotification({ name, email, subject, message });
    } catch (emailError) {
      // Email is a nice-to-have; the message is already stored.
      console.error("Email notification failed:", emailError);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}