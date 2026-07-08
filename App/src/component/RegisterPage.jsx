import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../service/auth";

// const FloatingOrb = ({ className }) => (
//   <div className={`absolute rounded-full blur-3xl opacity-20 animate-pulse ${className}`} />
// );

const InputField = ({
  label,
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
}) => (
  <div className="flex flex-col gap-1.5">
    <label
      htmlFor={id}
      className="text-xs font-medium text-white/50 tracking-wide uppercase"
    >
      {label}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete={autoComplete}
      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 text-sm
                 focus:outline-none focus:border-indigo-500/60 focus:bg-white/8 transition-all duration-200"
    />
  </div>
);

function PasswordStrength({ password }) {
  const checks = [
    { label: "6+ characters", pass: password.length >= 6 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /[0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const bar = ["bg-red-500", "bg-yellow-400", "bg-emerald-400"];
  const label = ["Weak", "Fair", "Strong"];

  if (!password) return null;

  return (
    <div className="flex flex-col gap-2 mt-1">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < score ? bar[score - 1] : "bg-white/10"
            }`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          {checks.map((c) => (
            <span
              key={c.label}
              className={`text-[10px] flex items-center gap-1 ${c.pass ? "text-emerald-400" : "text-white/25"}`}
            >
              <span>{c.pass ? "✓" : "·"}</span> {c.label}
            </span>
          ))}
        </div>
        {score > 0 && (
          <span
            className={`text-[10px] font-semibold ${bar[score - 1].replace("bg-", "text-")}`}
          >
            {label[score - 1]}
          </span>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function validate() {
    if (!fullName.trim()) return "Enter your full name.";
    if (!email.trim())   return "Enter your email address.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (password !== confirm) return "Passwords don't match.";
    return null;
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      await registerUser({
        fullName,
        email,
        password,
      });
      navigate("/Smart_Assist/login")
      const data = await res.json();
    } catch (err) {
      setError(
        err.response?.data?.message || err.message ||
        "Registration failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-[#0a0c1b] flex items-center justify-center overflow-hidden px-6 py-16">
      {/* Orbs */}
      {/* <FloatingOrb className="w-[500px] h-[500px] bg-indigo-600 -top-32 -left-32" />
      <FloatingOrb className="w-[400px] h-[400px] bg-violet-600 bottom-0 right-0" />
      <FloatingOrb className="w-[250px] h-[250px] bg-sky-500 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" /> */}

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium tracking-wide mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
            Study AI Assistant
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Create your account
          </h1>
          <p className="text-white/40 text-sm mt-2">
            Free to join — start studying smarter today
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-8 backdrop-blur-sm shadow-2xl shadow-black/40">
          <form
            onSubmit={handleRegister}
            className="flex flex-col gap-5"
            noValidate
          >
            <InputField
              label="Full name"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Alex Johnson"
              autoComplete="name"
            />
            <InputField
              label="Email"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />

            {/* Password with strength meter */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-xs font-medium text-white/50 tracking-wide uppercase"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 text-sm
                           focus:outline-none focus:border-indigo-500/60 focus:bg-white/8 transition-all duration-200"
              />
              <PasswordStrength password={password} />
            </div>

            <InputField
              label="Confirm password"
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />

            {/* Confirm match indicator */}
            {confirm && (
              <p
                className={`-mt-3 text-xs flex items-center gap-1.5 ${password === confirm ? "text-emerald-400" : "text-red-400"}`}
              >
                {password === confirm
                  ? "✓ Passwords match"
                  : "✗ Passwords don't match"}
              </p>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <svg
                  className="w-4 h-4 mt-0.5 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  />
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group relative mt-1 w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl
                         bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold text-sm
                         shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50
                         hover:scale-[1.02] active:scale-100
                         disabled:opacity-60 disabled:pointer-events-none
                         transition-all duration-200"
            >
              {loading ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Creating account…
                </>
              ) : (
                <>
                  Create account
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </>
              )}
              <span className="absolute inset-0 rounded-2xl ring-2 ring-indigo-400/0 group-hover:ring-indigo-400/40 transition-all duration-300" />
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/20 text-xs">
              already have an account?
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button
            onClick={() => navigate("/Smart_Assist/Login")}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-2xl
                       border border-white/10 bg-white/[0.03] text-white/60 text-sm font-medium
                       hover:border-indigo-500/40 hover:text-white/90 hover:bg-white/[0.06]
                       transition-all duration-200"
          >
            Sign in instead
          </button>
        </div>

        {/* Back to home */}
        <button
          onClick={() => navigate("/Smart_Assist/")}
          className="mt-6 mx-auto flex items-center gap-1.5 text-white/25 hover:text-white/50 text-xs transition-colors"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to home
        </button>
      </div>
    </div>
  );
}
