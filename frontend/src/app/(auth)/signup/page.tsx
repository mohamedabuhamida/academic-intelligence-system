"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLocale, useLocaleRouter } from "@/components/providers/LocaleProvider";
import { getMessages } from "@/lib/i18n/messages";

export default function Login() {
  const supabase = createClient();
  const { locale } = useLocale();
  const copy = getMessages(locale).auth;
  const router = useLocaleRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signIn = async () => {
    const { error } = await supabase.auth.signUp({ email, password });

    if (!error) {
      router.push("/dashboard");
    } else {
      alert(error.message);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#0f172a] text-white">
      <div className="p-8 bg-white/5 backdrop-blur-xl rounded-2xl w-96 space-y-4">
        <h1 className="text-xl font-semibold">{copy.simpleLoginTitle}</h1>

        <input
          className="w-full p-3 rounded bg-white/10"
          placeholder={copy.emailAddress}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full p-3 rounded bg-white/10"
          placeholder={copy.password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={signIn} className="w-full bg-blue-600 p-3 rounded">
          {copy.signIn}
        </button>
      </div>
    </div>
  );
}
