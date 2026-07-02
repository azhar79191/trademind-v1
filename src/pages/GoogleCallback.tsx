import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { Sparkles } from "lucide-react";

export default function GoogleCallback() {
  const navigate = useNavigate();
  const called = useRef(false);

  const callbackMutation = trpc.auth.googleCallback.useMutation({
    onSuccess: () => {
      window.location.href = "/dashboard";
    },
    onError: (err) => {
      console.error("Google OAuth callback failed:", err.message);
      navigate("/login?error=" + encodeURIComponent(err.message));
    },
  });

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");

    if (error) {
      navigate("/login?error=" + encodeURIComponent(error));
      return;
    }

    if (!code) {
      navigate("/login?error=No+authorization+code+received");
      return;
    }

    // Reconstruct the exact same redirectUri that was sent to Google
    const redirectUri = `${window.location.protocol}//${window.location.host}/auth/google/callback`;
    callbackMutation.mutate({ code, redirectUri });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--navy-base)" }}>
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse" style={{ background: "var(--lime-primary)" }}>
          <Sparkles className="w-8 h-8" style={{ color: "var(--navy-base)" }} />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Signing you in...</h2>
        <p className="text-sm" style={{ color: "var(--grey-dim)" }}>Completing Google authentication</p>
      </div>
    </div>
  );
}
