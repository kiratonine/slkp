import { SyntheticEvent, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { ApiError } from "../services/api/client";
import PhoneFrame from "../components/PhoneFrame";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errorCode === "AUTH_INVALID_CREDENTIALS") {
          setError("Неверный email или пароль");
        } else {
          setError(err.message);
        }
      } else {
        setError("Не удалось войти. Попробуйте позже.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PhoneFrame hideNav>
      <div className="px-5 pt-12 pb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Вход</h1>
        <p className="text-sm text-gray-500 mb-8">Войдите в аккаунт S1lkPay</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-violet-400"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Пароль</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-violet-400"
                placeholder="••••••••"
              />
              <button
                className="absolute right-4 bottom-3 text-gray-400 hover:text-gray-600"
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-violet-600 disabled:bg-gray-300 text-white rounded-2xl py-4 font-semibold text-sm hover:bg-violet-700 transition-colors mt-2"
          >
            {isSubmitting ? "Входим..." : "Войти"}
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-6">
          Нет аккаунта?{" "}
          <Link to="/register" className="text-violet-600">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </PhoneFrame>
  );
}
