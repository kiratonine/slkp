import { SyntheticEvent, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { ApiError } from "../services/api/client";
import PhoneFrame from "../components/PhoneFrame";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  return (
    <PhoneFrame>
      <div className="px-5 pt-12 pb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">
          Регистрация
        </h1>
        <p className="text-sm text-gray-500 mb-8">Создайте аккаунт S1lkPay</p>

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
                placeholder="Минимум 6 символов"
              />
              <button
                className="absolute right-3 bottom-2.5 text-gray-400 hover:text-gray-600"
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Подтвердите пароль
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-violet-400"
                placeholder="Повторите пароль"
              />
              <button
                className="absolute right-3 bottom-2.5 text-gray-400 hover:text-gray-600"
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
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
            {isSubmitting ? "Регистрируем..." : "Зарегистрироваться"}
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-6">
          Уже есть аккаунт?{" "}
          <Link to="/login" className="text-violet-600">
            Войти
          </Link>
        </p>
      </div>
    </PhoneFrame>
  );
}
