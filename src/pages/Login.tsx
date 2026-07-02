import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Sparkles, Shield, Zap, Globe, Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // tRPC mutations
  const signupMutation = trpc.auth.signup.useMutation({
    onSuccess: () => {
      window.location.href = "/dashboard";
    },
    onError: (error) => {
      setErrors({ submit: error.message });
      setIsLoading(false);
    },
  });

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      window.location.href = "/dashboard";
    },
    onError: (error) => {
      setErrors({ submit: error.message });
      setIsLoading(false);
    },
  });

  if (isAuthenticated) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (isSignUp && !formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (isSignUp) {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      if (isSignUp) {
        // Call signup mutation
        await signupMutation.mutateAsync({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
      } else {
        // Call login mutation
        await loginMutation.mutateAsync({
          email: formData.email,
          password: formData.password,
        });
      }
    } catch (error) {
      // Error handling is done in mutation callbacks
      console.error("Auth error:", error);
    }
  };

  const googleAuthQuery = trpc.auth.googleAuth.useQuery(undefined, { enabled: false });

  const handleGoogleLogin = async () => {
    try {
      const result = await googleAuthQuery.refetch();
      const clientId = result.data?.clientId;
      if (!clientId) {
        setErrors({ submit: "Google OAuth is not configured." });
        return;
      }
      // Build redirect URI from the actual browser URL — guaranteed to match
      const redirectUri = `${window.location.origin}/auth/google/callback`;
      const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      url.searchParams.set("client_id", clientId);
      url.searchParams.set("redirect_uri", redirectUri);
      url.searchParams.set("response_type", "code");
      url.searchParams.set("scope", "email profile");
      url.searchParams.set("access_type", "offline");
      url.searchParams.set("prompt", "consent");
      window.location.href = url.toString();
    } catch {
      setErrors({ submit: "Google OAuth is not configured. Please use email/password login." });
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--navy-base)" }}>
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full" style={{ background: "radial-gradient(circle, var(--lime-primary) 0%, transparent 70%)", filter: "blur(80px)" }} />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full" style={{ background: "radial-gradient(circle, #00E5FF 0%, transparent 70%)", filter: "blur(60px)" }} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--lime-primary)" }}>
              <Sparkles className="w-6 h-6" style={{ color: "var(--navy-base)" }} />
            </div>
            <span className="text-2xl font-bold text-white">TradeMind</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
            AI-Powered<br />
            <span style={{ color: "var(--lime-primary)" }}>Trading Intelligence</span>
          </h1>
          <p className="text-lg max-w-md" style={{ color: "var(--grey-dim)" }}>
            Harness the power of artificial intelligence to analyze markets, execute strategies, and maximize your trading potential.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { icon: Shield, label: "Bank-Grade Security" },
            { icon: Zap, label: "Real-Time Execution" },
            { icon: Globe, label: "Multi-Exchange" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-sm" style={{ color: "var(--grey-dim)" }}>
              <item.icon className="w-4 h-4" style={{ color: "var(--lime-primary)" }} />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Login/Signup Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--lime-primary)" }}>
              <Sparkles className="w-5 h-5" style={{ color: "var(--navy-base)" }} />
            </div>
            <span className="text-xl font-bold text-white">TradeMind</span>
          </div>

          <div className="card-surface p-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="text-sm mb-6" style={{ color: "var(--grey-dim)" }}>
              {isSignUp 
                ? "Sign up to start your trading journey" 
                : "Sign in to access your trading dashboard"
              }
            </p>

            {/* Error Message */}
            {errors.submit && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400">{errors.submit}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name (Sign Up only) */}
              {isSignUp && (
                <div>
                  <label className="text-sm font-medium text-white mb-1.5 block">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "var(--grey-dim)" }} />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full pl-10 pr-4 py-3 rounded-lg text-sm outline-none focus:ring-2"
                      style={{ 
                        background: "var(--navy-base)", 
                        border: `1px solid ${errors.name ? "#EF4444" : "var(--navy-highlight)"}`, 
                        color: "white" 
                      }}
                    />
                  </div>
                  {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
                </div>
              )}

              {/* Email */}
              <div>
                <label className="text-sm font-medium text-white mb-1.5 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "var(--grey-dim)" }} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-lg text-sm outline-none focus:ring-2"
                    style={{ 
                      background: "var(--navy-base)", 
                      border: `1px solid ${errors.email ? "#EF4444" : "var(--navy-highlight)"}`, 
                      color: "white" 
                    }}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="text-sm font-medium text-white mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "var(--grey-dim)" }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 rounded-lg text-sm outline-none focus:ring-2"
                    style={{ 
                      background: "var(--navy-base)", 
                      border: `1px solid ${errors.password ? "#EF4444" : "var(--navy-highlight)"}`, 
                      color: "white" 
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--grey-dim)" }}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
              </div>

              {/* Confirm Password (Sign Up only) */}
              {isSignUp && (
                <div>
                  <label className="text-sm font-medium text-white mb-1.5 block">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "var(--grey-dim)" }} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 rounded-lg text-sm outline-none focus:ring-2"
                      style={{ 
                        background: "var(--navy-base)", 
                        border: `1px solid ${errors.confirmPassword ? "#EF4444" : "var(--navy-highlight)"}`, 
                        color: "white" 
                      }}
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-red-400 mt-1">{errors.confirmPassword}</p>}
                </div>
              )}

              {/* Forgot Password (Login only) */}
              {!isSignUp && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4 rounded" style={{ accentColor: "var(--lime-primary)" }} />
                    <span className="text-sm" style={{ color: "var(--grey-dim)" }}>Remember me</span>
                  </label>
                  <button type="button" className="text-sm font-medium hover:underline" style={{ color: "var(--lime-primary)" }}>
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-lime flex items-center justify-center gap-2 text-base py-3 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    {isSignUp ? "Creating account..." : "Signing in..."}
                  </>
                ) : (
                  <>
                    {isSignUp ? "Create Account" : "Sign In"}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full" style={{ borderTop: "1px solid var(--navy-highlight)" }} />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3" style={{ background: "var(--navy-surface)", color: "var(--grey-dim)" }}>Or continue with</span>
              </div>
            </div>

            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-lg font-medium transition-all hover:opacity-90"
              style={{ background: "var(--navy-base)", border: "1px solid var(--navy-highlight)", color: "white" }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <p className="text-xs text-center mt-6" style={{ color: "var(--grey-dim)" }}>
              By {isSignUp ? "creating an account" : "signing in"}, you agree to our{" "}
              <button className="underline hover:text-white">Terms of Service</button> and{" "}
              <button className="underline hover:text-white">Privacy Policy</button>
            </p>
          </div>

          {/* Toggle Sign Up / Sign In */}
          <p className="text-center text-sm mt-6" style={{ color: "var(--grey-dim)" }}>
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button 
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrors({});
                setFormData({ name: "", email: "", password: "", confirmPassword: "" });
              }}
              className="font-medium transition-colors hover:text-white" 
              style={{ color: "var(--lime-primary)" }}
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
