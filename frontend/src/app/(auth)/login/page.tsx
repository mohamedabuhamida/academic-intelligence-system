"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function Login() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error) {
      router.push("/dashboard");
    } else {
      alert(error.message);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#0f172a] text-white">
      <div className="p-8 bg-white/5 backdrop-blur-xl rounded-2xl w-96 space-y-4">
        <h1 className="text-xl font-semibold">Login</h1>

        <input
          className="w-full p-3 rounded bg-white/10"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full p-3 rounded bg-white/10"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={signIn}
          className="w-full bg-blue-600 p-3 rounded"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}