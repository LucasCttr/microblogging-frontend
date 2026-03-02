"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    // No NextAuth: rely on server to redirect after login
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data?.error ?? 'Login failed');
        return;
      }
      // notify other parts of the SPA that auth changed (Header listens for this)
      try { window.dispatchEvent(new Event('auth:changed')); } catch (e) {}
      router.push('/home');
    } catch (e) {
      setError('Network error');
    }
  };

  return (
  <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 p-6">
    <Card className="w-full max-w-md p-6">
      <h1 className="text-2xl font-bold mb-6">Sign in</h1>
      {error && <div className="mb-3 text-red-600 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Email</label>
          <Input 
            type="email"
            placeholder="youremail@example.com"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Password</label>
          <Input 
            type="password"
            placeholder="••••••••"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
        </div>

        <Button type="submit" className="w-full">Sign in</Button>
      </form>
      <div className="mt-6 text-center">
        <a href="/auth/register" className="text-sm text-blue-600 hover:underline">
          Don't have an account? Sign up
        </a>
      </div>
    </Card>
  </div>
);
}
