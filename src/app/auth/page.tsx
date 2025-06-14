"use client";
import { useState } from "react";
import { supabase } from "@/utils/supabaseClient";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Magic link login
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({ email });
    setLoading(false);
    if (error) setMessage(error.message);
    else setMessage("Check your email for the magic link!");
  };

  // Email/password sign up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) setMessage(error.message);
    else setMessage("Sign up successful! Check your email to confirm.");
  };

  // Email/password sign in
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setMessage(error.message);
    else setMessage("Signed in successfully!");
  };

  // Google sign in
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
    setLoading(false);
    if (error) setMessage(error.message);
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white dark:bg-zinc-900 rounded shadow-lg flex flex-col gap-6">
      <h1 className="text-2xl font-bold mb-2 text-center">Sign in to your account</h1>
      <form className="flex flex-col gap-3" onSubmit={handleSignIn}>
        <input
          type="email"
          placeholder="Email"
          className="border rounded px-3 py-2"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="border rounded px-3 py-2"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white rounded px-4 py-2 font-semibold hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          Sign In
        </button>
      </form>
      <form className="flex flex-col gap-3" onSubmit={handleSignUp}>
        <button
          type="submit"
          className="bg-green-600 text-white rounded px-4 py-2 font-semibold hover:bg-green-700 disabled:opacity-50"
          disabled={loading}
        >
          Sign Up (Email/Password)
        </button>
      </form>
      <form className="flex flex-col gap-3" onSubmit={handleMagicLink}>
        <button
          type="submit"
          className="bg-purple-600 text-white rounded px-4 py-2 font-semibold hover:bg-purple-700 disabled:opacity-50"
          disabled={loading}
        >
          Send Magic Link
        </button>
      </form>
      <button
        onClick={handleGoogleSignIn}
        className="bg-red-500 text-white rounded px-4 py-2 font-semibold hover:bg-red-600 disabled:opacity-50"
        disabled={loading}
      >
        Sign in with Google
      </button>
      {message && <div className="mt-4 text-center text-sm text-red-600">{message}</div>}
    </div>
  );
} 