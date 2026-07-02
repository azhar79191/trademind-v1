import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import {
  Sparkles,
  TrendingUp,
  Shield,
  Zap,
  BarChart3,
  Brain,
  Globe,
  Lock,
  ArrowRight,
  ChevronRight,
  Check,
  Menu,
  X,
} from "lucide-react";

// ─── Neural Flow Field WebGL Background ──────────────────────────────

function NeuralFlowCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { alpha: true, antialias: false });
    if (!gl) return;

    const vertSrc = `
      attribute vec2 a_pos;
      void main() {
        gl_Position = vec4(a_pos, 0.0, 1.0);
      }
    `;

    const fragSrc = `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_res;
      uniform vec2 u_mouse;

      #define PI 3.14159265359
      #define TAU 6.28318530718

      vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
      vec2 mod289v2(vec2 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289v2(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m * m; m = m * m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        vec3 g;
        g.x = a0.x * x0.x + h.x * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      vec2 sampleVel(vec2 p, float t) {
        return vec2(
          cos(p.y * 0.5 + snoise(p * 0.4 - t * 0.15) * 1.2 + t * 0.08),
          sin(p.x * 0.5 + snoise(p * 0.4 + vec2(100.0) - t * 0.15) * 1.2 + t * 0.08)
        );
      }

      vec2 advect(vec2 p, float dt, float t) {
        for (int i = 0; i < 3; i++) {
          vec2 v = sampleVel(p, t);
          p += v * dt;
        }
        return p;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        float aspect = u_res.x / u_res.y;
        float t = u_time * 0.4;
        vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

        float mouseField = 0.0;
        float mouseActive = step(0.5, u_mouse.x);
        if (mouseActive > 0.5) {
          vec2 mPos = (u_mouse - 0.5) * vec2(aspect, 1.0);
          float md = length(p - mPos);
          mouseField = 2.0 * exp(-md * md * 4.0);
        }

        vec3 brightNavy = vec3(6.0/255.0, 12.0/255.0, 28.0/255.0);
        vec3 col = brightNavy;

        float baseLayer = 0.0;
        for (int i = 0; i < 5; i++) {
          vec2 pp = p;
          float angle = TAU * float(i) / 5.0 + t * 0.02;
          vec2 offset = vec2(cos(angle), sin(angle)) * 0.15;
          pp = advect(pp + offset, 0.08, t);
          float n1 = snoise(pp * 1.8 + t * 0.2);
          float n2 = snoise(pp * 3.5 - t * 0.15 + 50.0);
          float trail = 0.5 + 0.5 * n1;
          trail *= smoothstep(0.6, 0.2, n2);
          float warp = length(pp - p) * 2.0;
          float fade = exp(-warp * warp * 0.8);
          baseLayer += trail * fade;
        }

        float field = baseLayer * 0.12 + mouseField;
        vec3 cyan = vec3(0.0, 1.0, 1.0);
        vec3 magenta = vec3(1.0, 0.0, 1.0);
        vec3 lime = vec3(210.0/255.0, 249.0/255.0, 0.0);
        float gradT = clamp(field * 1.5, 0.0, 1.0);
        vec3 baseColor = mix(cyan, lime, smoothstep(0.0, 0.4, gradT));
        baseColor = mix(baseColor, magenta, smoothstep(0.4, 0.7, gradT));
        float intensity = pow(field, 1.5);
        col += baseColor * intensity * 0.5;

        float detailNoise = snoise(p * 4.0 + t * 0.3) * 0.5 + 0.5;
        col += vec3(0.02, 0.05, 0.1) * detailNoise * smoothstep(0.3, 0.8, field);

        float centerGlow = exp(-dot(p, p) * 1.5);
        col += vec3(0.03, 0.08, 0.2) * centerGlow;

        col = col / (1.0 + col * 0.4);
        col = pow(col, vec3(0.95, 1.0, 1.1));

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    function compileShader(src: string, type: number) {
      const shader = gl!.createShader(type)!;
      gl!.shaderSource(shader, src);
      gl!.compileShader(shader);
      return shader;
    }

    const program = gl.createProgram()!;
    gl.attachShader(program, compileShader(vertSrc, gl.VERTEX_SHADER));
    gl.attachShader(program, compileShader(fragSrc, gl.FRAGMENT_SHADER));
    gl.linkProgram(program);
    gl.useProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, "u_time");
    const uRes = gl.getUniformLocation(program, "u_res");
    const uMouse = gl.getUniformLocation(program, "u_mouse");

    let mouseX = -1, mouseY = -1;
    const handleMouse = (e: MouseEvent) => {
      mouseX = e.clientX / window.innerWidth;
      mouseY = 1.0 - e.clientY / window.innerHeight;
    };
    window.addEventListener("mousemove", handleMouse);

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas!.width = window.innerWidth * dpr;
      canvas!.height = window.innerHeight * dpr;
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
    }
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    function render() {
      const t = performance.now() * 0.001;
      gl!.uniform1f(uTime, t);
      gl!.uniform2f(uRes, canvas!.width, canvas!.height);
      gl!.uniform2f(uMouse, mouseX, mouseY);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(render);
    }
    render();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
      }}
    />
  );
}

// ─── Feature Card ────────────────────────────────────────────────────

function FeatureCard({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="card-surface p-6 group">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110" style={{ background: "var(--navy-highlight)" }}>
        <Icon className="w-6 h-6" style={{ color: "var(--lime-primary)" }} />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: "var(--grey-dim)" }}>{description}</p>
    </div>
  );
}

// ─── Pricing Card ────────────────────────────────────────────────────

function PricingCard({ tier, price, features, highlighted }: { tier: string; price: string; features: string[]; highlighted?: boolean }) {
  return (
    <div className={`card-surface p-6 relative ${highlighted ? "ring-2 ring-[#D2F900]" : ""}`}>
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold" style={{ background: "var(--lime-primary)", color: "var(--navy-base)" }}>
          MOST POPULAR
        </div>
      )}
      <h3 className="text-lg font-semibold text-white mb-1">{tier}</h3>
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-3xl font-bold text-white">{price}</span>
        {price !== "Free" && <span className="text-sm" style={{ color: "var(--grey-dim)" }}>/month</span>}
      </div>
      <ul className="space-y-3 mb-6">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--grey-dim)" }}>
            <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "var(--lime-primary)" }} />
            {f}
          </li>
        ))}
      </ul>
      <button className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${highlighted ? "btn-lime" : ""}`} style={!highlighted ? { background: "var(--navy-highlight)", color: "white" } : {}}>
        Get Started
      </button>
    </div>
  );
}

// ─── Main Landing Page ───────────────────────────────────────────────

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen relative" style={{ background: "var(--navy-base)" }}>
      {/* Background */}
      <NeuralFlowCanvas />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 liquid-glass" style={{ borderBottom: "1px solid var(--navy-highlight)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--lime-primary)" }}>
                <Sparkles className="w-5 h-5" style={{ color: "var(--navy-base)" }} />
              </div>
              <span className="text-xl font-bold text-white">TradeMind</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              {["Features", "Pricing", "Docs"].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium transition-colors hover:text-white" style={{ color: "var(--grey-dim)" }}>
                  {item}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn-lime text-sm flex items-center gap-2">
                  Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link to="/login" className="hidden sm:inline-flex text-sm font-medium transition-colors hover:text-white" style={{ color: "var(--grey-dim)" }}>
                    Sign In
                  </Link>
                  <Link to="/login" className="btn-lime text-sm flex items-center gap-2">
                    Get Started <ArrowRight className="w-4 h-4" />
                  </Link>
                </>
              )}
              <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ color: "var(--grey-dim)" }}>
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden px-4 pb-4 space-y-2">
            {["Features", "Pricing", "Docs"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="block py-2 text-sm font-medium" style={{ color: "var(--grey-dim)" }} onClick={() => setMobileMenuOpen(false)}>
                {item}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4 pt-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-medium" style={{ background: "rgba(210, 249, 0, 0.1)", color: "var(--lime-primary)", border: "1px solid rgba(210, 249, 0, 0.2)" }}>
            <Brain className="w-4 h-4" />
            AI-Powered Trading Intelligence
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
            Autonomous Intelligence for{" "}
            <span style={{ color: "var(--lime-primary)" }}>Decentralized Markets</span>
          </h1>

          <p className="text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: "var(--grey-dim)" }}>
            TradeMind AI aggregates on-chain telemetry, neural sentiment analysis, and algorithmic execution into a unified command layer.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={isAuthenticated ? "/dashboard" : "/login"} className="btn-lime flex items-center gap-2 text-base px-8 py-3">
              Initialize Terminal <Zap className="w-5 h-5" />
            </Link>
            <a href="#features" className="flex items-center gap-2 text-sm font-medium px-6 py-3 rounded-full transition-colors hover:text-white" style={{ color: "var(--grey-dim)", background: "var(--navy-surface)", border: "1px solid var(--navy-highlight)" }}>
              Explore Features <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-2xl mx-auto">
            {[
              { label: "Active Users", value: "12.5K+" },
              { label: "Trades Executed", value: "2.1M+" },
              { label: "Win Rate", value: "68.3%" },
              { label: "AI Signals/Day", value: "1,200+" },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-xl" style={{ background: "rgba(17, 24, 39, 0.6)", border: "1px solid var(--navy-highlight)" }}>
                <div className="text-2xl font-bold font-mono-data" style={{ color: "var(--lime-primary)" }}>{stat.value}</div>
                <div className="text-xs mt-1" style={{ color: "var(--grey-dim)" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 px-4" style={{ background: "var(--navy-base)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Intelligence at Every Layer</h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--grey-dim)" }}>
              From real-time market analysis to fully automated execution, TradeMind AI covers every aspect of intelligent trading.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={Brain}
              title="AI Trend Prediction"
              description="Neural network models analyze market structure, sentiment, and on-chain data to predict price movements with high accuracy."
            />
            <FeatureCard
              icon={TrendingUp}
              title="Automated Trading"
              description="Execute strategies 24/7 with algorithmic precision. Support for grid, DCA, scalping, and custom strategies."
            />
            <FeatureCard
              icon={Shield}
              title="Risk Management"
              description="Advanced risk controls including position sizing, stop losses, trailing stops, and portfolio-level drawdown protection."
            />
            <FeatureCard
              icon={BarChart3}
              title="Technical Analysis"
              description="20+ built-in indicators including RSI, MACD, Bollinger Bands, Ichimoku, and custom indicator builder."
            />
            <FeatureCard
              icon={Globe}
              title="Multi-Exchange Support"
              description="Connect Binance, Bybit, OKX, Coinbase, and more. Execute trades across exchanges from a single interface."
            />
            <FeatureCard
              icon={Lock}
              title="Enterprise Security"
              description="Bank-grade encryption for API keys, 2FA support, audit logging, and RBAC for team accounts."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-24 px-4" style={{ background: "var(--navy-surface)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Choose Your Edge</h2>
            <p className="text-lg" style={{ color: "var(--grey-dim)" }}>
              Start free and scale as your trading grows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PricingCard
              tier="Free"
              price="Free"
              features={["3 AI signals/day", "Basic technical analysis", "Portfolio tracking", "Paper trading", "Community support"]}
            />
            <PricingCard
              tier="Premium"
              price="$49"
              highlighted
              features={["Unlimited AI signals", "Advanced strategy builder", "Automated trading bots", "Real-time alerts", "Priority support", "Custom indicators"]}
            />
            <PricingCard
              tier="Enterprise"
              price="$199"
              features={["Everything in Premium", "Multi-account management", "API access", "White-label options", "Dedicated account manager", "Custom AI model training"]}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-4" style={{ background: "var(--navy-base)", borderTop: "1px solid var(--navy-highlight)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--lime-primary)" }}>
                <Sparkles className="w-4 h-4" style={{ color: "var(--navy-base)" }} />
              </div>
              <span className="text-lg font-bold text-white">TradeMind AI</span>
            </div>

            <div className="flex items-center gap-6 text-sm" style={{ color: "var(--grey-dim)" }}>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Docs</a>
              <a href="#" className="hover:text-white transition-colors">Status</a>
            </div>

            <div className="flex items-center gap-2 text-xs" style={{ color: "var(--lime-primary)" }}>
              <div className="w-2 h-2 rounded-full status-dot active" />
              Systems Operational
            </div>
          </div>

          <p className="text-center text-xs mt-8" style={{ color: "var(--grey-dim)" }}>
            TradeMind AI is for educational and research purposes. Trading involves significant risk of loss.
          </p>
        </div>
      </footer>
    </div>
  );
}
