import { SyntheticEvent, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { ApiError } from "../services/api/client";
import PhoneFrame from "../components/PhoneFrame";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    if (!agreedToTerms) {
      setError("Необходимо согласиться с условиями");
      return;
    }

    setIsSubmitting(true);

    try {
      await register(email, password);
      navigate("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errorCode === "AUTH_EMAIL_ALREADY_EXISTS") {
          setError("Этот email уже зарегистрирован");
        } else {
          setError(err.message);
        }
      } else {
        setError("Не удалось зарегистрироваться. Попробуйте позже.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTermsClick = () => {
    toast("Страница условий скоро будет доступна", { icon: "🚧" });
  };

  return (
    <PhoneFrame hideNav>
      <div className="px-5 pt-4 pb-8 min-h-full flex flex-col">
        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="text-gray-500 mb-6 self-start"
        >
          <ArrowLeft size={20} />
        </button>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          Create Account
        </h1>
        <p className="text-sm text-gray-500 mb-8">Join S1LK x402 Bridge</p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-violet-400 focus:bg-white transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 pr-11 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-violet-400 focus:bg-white transition-colors"
                placeholder="Минимум 6 символов"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 pr-11 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-violet-400 focus:bg-white transition-colors"
                placeholder="Повторите пароль"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

          {/* Terms checkbox */}
          <label className="flex items-start gap-2 cursor-pointer mt-1">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-400"
            />
            <span className="text-xs text-gray-600 leading-relaxed">
              I agree to the{" "}
              <button
                type="button"
                onClick={handleTermsClick}
                className="text-violet-600 underline"
              >
                Terms of Service
              </button>{" "}
              and{" "}
              <button
                type="button"
                onClick={handleTermsClick}
                className="text-violet-600 underline"
              >
                Privacy Policy
              </button>
            </span>
          </label>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-violet-600 disabled:bg-gray-300 text-white rounded-2xl py-3.5 font-semibold text-sm hover:bg-violet-700 transition-colors mt-2"
          >
            {isSubmitting ? "Регистрируем..." : "Create Account"}
          </button>
        </form>

        {/* Login link */}
        <p className="text-sm text-gray-500 text-center mt-auto pt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-violet-600 font-medium">
            Log In
          </Link>
        </p>
      </div>
    </PhoneFrame>
  );
}
