"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

const INSTAGRAM_APP_ID = "1046117153761683";
const INSTAGRAM_APP_SECRET = "8787e8069952fb2c1072974c8bcc7ae9";
const REDIRECT_URI = "https://insta-automated-messages-app.vercel.app/instagram/callback";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://993a-2405-201-e004-f101-5dbf-419b-3559-85a9.ngrok-free.app";

interface Message {
  id: string;
  message: string;
  from: {
    id: string;
    username?: string;
  };
  to: {
    id: string;
    username?: string;
  };
  created_time: string;
}

interface Conversation {
  id: string;
  participants: {
    id: string;
    username?: string;
  }[];
  messages: Message[];
}

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("Exchanging code for access token...");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

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
        // Use our backend proxy instead of calling Instagram directly
        const res = await fetch(
          `${API_BASE_URL}/api/instagram/auth/token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              code,
              redirect_uri: REDIRECT_URI,
              client_id: INSTAGRAM_APP_ID,
              client_secret: INSTAGRAM_APP_SECRET
            }),
          }
        );
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to exchange code for token");
        }
        
        const data = await res.json();
        if (data.access_token) {
          setAccessToken(data.access_token);
          setStatus("Instagram account connected! Fetching messages...");
          fetchMessages(data.access_token);
        } else {
          setError(data.error_message || JSON.stringify(data));
          setStatus("Failed to get access token.");
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(String(err));
        }
        setStatus("Failed to get access token.");
      }
    }

    async function fetchMessages(token: string) {
      setIsLoadingMessages(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/instagram/messages?access_token=${token}`
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch messages");
        }
        
        const data = await response.json();
        setConversations(data);
        setStatus("Instagram account connected! Messages retrieved successfully.");
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError("Error fetching messages: " + err.message);
        } else {
          setError("Error fetching messages: " + String(err));
        }
        setStatus("Connected, but failed to fetch messages.");
      } finally {
        setIsLoadingMessages(false);
      }
    }

    exchangeCode();
  }, [searchParams]);

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white dark:bg-zinc-900 rounded shadow-lg">
      <h1 className="text-2xl font-bold mb-4 text-center">Instagram OAuth Callback</h1>
      <p className="text-center mb-6">{status}</p>
      
      {error && (
        <div className="text-red-600 p-4 bg-red-50 dark:bg-red-900/20 rounded mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}

      {accessToken && (
        <div className="mb-6">
          <details className="mb-4">
            <summary className="cursor-pointer font-semibold">Show Access Token</summary>
            <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs break-all">
              {accessToken}
            </div>
          </details>
        </div>
      )}

      {isLoadingMessages && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {conversations.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Instagram Messages</h2>
          <div className="space-y-6">
            {conversations.map((conversation) => (
              <div key={conversation.id} className="border dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium mb-2">
                  Conversation with: {conversation.participants.map(p => p.username || p.id).join(", ")}
                </h3>
                
                <div className="space-y-3 mt-4">
                  {conversation.messages.length > 0 ? (
                    conversation.messages.map((message) => (
                      <div 
                        key={message.id} 
                        className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                      >
                        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
                          <span>From: {message.from?.username || message.from?.id || "Unknown"}</span>
                          <span>{formatDate(message.created_time)}</span>
                        </div>
                        <p>{message.message}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">No messages in this conversation</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {accessToken && conversations.length === 0 && !isLoadingMessages && (
        <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-600 dark:text-gray-300">No messages found for this Instagram account.</p>
        </div>
      )}

      <div className="mt-8 text-center">
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}

export default function InstagramCallback() {
  return (
    <Suspense fallback={<div className="max-w-lg mx-auto mt-20 p-8 bg-white dark:bg-zinc-900 rounded shadow-lg text-center">
      <h1 className="text-2xl font-bold mb-2">Instagram OAuth Callback</h1>
      <p>Loading...</p>
    </div>}>
      <CallbackContent />
    </Suspense>
  );
} 