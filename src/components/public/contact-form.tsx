"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export function ContactForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        else setErrors({ _form: data.error || "Something went wrong." });
        return;
      }

      setSuccess(true);
      toast({
        variant: "success",
        title: "Message sent",
        description: "I'll get back to you as soon as possible.",
      });
      (e.target as HTMLFormElement).reset();
    } catch {
      setErrors({ _form: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {errors._form && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {errors._form}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          required
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        {errors.name && <p id="name-error" className="text-xs text-red-600">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && <p id="email-error" className="text-xs text-red-600">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          name="subject"
          required
          aria-invalid={!!errors.subject}
        />
        {errors.subject && <p className="text-xs text-red-600">{errors.subject}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          name="message"
          rows={6}
          required
          aria-invalid={!!errors.message}
        />
        {errors.message && <p className="text-xs text-red-600">{errors.message}</p>}
      </div>

      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading ? "Sending..." : "Send Message"}
      </Button>

      {success && (
        <p className="text-sm text-emerald-600">Thank you — your message has been sent.</p>
      )}
    </form>
  );
}