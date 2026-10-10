import { LoginForm } from "@/components/admin/login-form";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Admin Login</h1>
          <p className="mt-2 text-sm text-slate-500">
            Sign in to manage your website.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}