import { Link } from "react-router";
import { Sparkles, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--navy-base)" }}>
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: "var(--navy-surface)", border: "1px solid var(--navy-highlight)" }}>
          <span className="text-3xl font-bold" style={{ color: "var(--lime-primary)" }}>404</span>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Page Not Found</h1>
        <p className="text-sm mb-8" style={{ color: "var(--grey-dim)" }}>
          The page you're looking for doesn't exist or has been moved. Check the URL or navigate back to the dashboard.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/dashboard" className="btn-lime flex items-center gap-2 text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-colors hover:text-white"
            style={{ color: "var(--grey-dim)", background: "var(--navy-surface)", border: "1px solid var(--navy-highlight)" }}
          >
            <Sparkles className="w-4 h-4" />
            Landing Page
          </Link>
        </div>
      </div>
    </div>
  );
}
