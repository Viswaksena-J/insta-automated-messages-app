"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const INSTAGRAM_APP_ID = "1046117153761683";
const INSTAGRAM_APP_SECRET = "8787e8069952fb2c1072974c8bcc7ae9";
const REDIRECT_URI = "https://insta-automated-messages-app.vercel.app/instagram/callback";

export default function InstagramCallback() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Exchanging code for access token...");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      setStatus("No code found in URL.");
      setError("No code found in URL.");
      return;
    }

    async function exchangeCode() {
      setStatus("Exchanging code for access token...");
      try {
        const res = await fetch(
          `https://api.instagram.com/oauth/access_token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              client_id: INSTAGRAM_APP_ID,
              client_secret: INSTAGRAM_APP_SECRET,
              grant_type: "authorization_code",
              redirect_uri: REDIRECT_URI,
              code,
            }).toString(),
          }
        );
        const data = await res.json();
        if (data.access_token) {
          setAccessToken(data.access_token);
          setStatus("Instagram account connected! Access token received.");
        } else {
          setError(data.error_message || JSON.stringify(data));
          setStatus("Failed to get access token.");
        }
      } catch (err: any) {
        setError(err.message);
        setStatus("Failed to get access token.");
      }
    }
    exchangeCode();
  }, [searchParams]);

  return (
    <div className="max-w-lg mx-auto mt-20 p-8 bg-white dark:bg-zinc-900 rounded shadow-lg flex flex-col gap-6 text-center">
      <h1 className="text-2xl font-bold mb-2">Instagram OAuth Callback</h1>
      <p>{status}</p>
      {accessToken && (
        <div className="break-all">
          <strong>Access Token:</strong>
          <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">{accessToken}</div>
        </div>
      )}
      {error && (
        <div className="text-red-600">
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
} 