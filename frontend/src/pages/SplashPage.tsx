import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Bot, Coins, Zap } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import PhoneFrame from "../components/PhoneFrame";

export default function SplashPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) return null;

  return (
    <PhoneFrame hideNav>
      <div className="px-5 pt-8 pb-8 min-h-full flex flex-col">
        {/* Logo */}

        {/* Hero text */}
        <h1 className="text-[2.5rem] font-bold text-gray-900 leading-tight mb-3">
          AI Payments.
          <br />
          Web3 Rails.
          <br />
          Fiat Control.
        </h1>
        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
          Secure KZT payments for AI agents powered by Solana & x402.
        </p>

        {/* Hero illustration */}
        <div className="flex-1 flex items-center justify-center mb-8 relative">
          <div className="relative w-56 h-56">
            {/* Main gradient blob */}
            <div
              className="absolute inset-0 rounded-[2.5rem] rotate-12"
              style={{
                background:
                  "linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%)",
              }}
            />

            {/* Inner sphere */}
            <div className="absolute top-8 left-8 w-32 h-32 rounded-full bg-gradient-to-br from-fuchsia-400 to-pink-500 shadow-lg" />

            {/* Floating icons */}
            <div className="absolute top-6 right-4 w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center -rotate-12">
              <Bot size={22} className="text-violet-600" />
            </div>

            <div className="absolute bottom-8 left-2 w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center rotate-6">
              <Coins size={22} className="text-amber-500" />
            </div>

            <div className="absolute bottom-2 right-8 w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center -rotate-6">
              <Zap size={22} className="text-blue-500" />
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 mb-4">
          <Link
            to="/register"
            className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-2xl py-3.5 font-semibold text-sm text-center transition-colors"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="w-full bg-white border border-gray-200 text-gray-900 rounded-2xl py-3.5 font-semibold text-sm text-center hover:bg-gray-50 transition-colors"
          >
            Log In
          </Link>
        </div>

        {/* Terms */}
        <p className="text-[10px] text-gray-400 text-center px-4">
          By continuing, you agree to our{" "}
          <span className="text-gray-600 underline">Terms of Service</span> and{" "}
          <span className="text-gray-600 underline">Privacy Policy</span>.
        </p>
      </div>
    </PhoneFrame>
  );
}
