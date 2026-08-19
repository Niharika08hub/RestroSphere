import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
type ApiResponse = {
  message?: string;
};

const ForgotPassword = () => {
  const navigate = useNavigate();
<motion.div
  initial={{ opacity: 0, x: 30 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: -30 }}
  transition={{ duration: 0.3, ease: "easeInOut" }}
></motion.div>
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getResponse = async (response: Response): Promise<ApiResponse> => {
    const text = await response.text();

    let data: ApiResponse = {};

    if (text.trim()) {
      try {
        data = JSON.parse(text);
      } catch {
        if (!response.ok) {
          throw new Error(`Request failed (${response.status})`);
        }
      }
    }

    if (!response.ok) {
      throw new Error(
        data.message || `Request failed (${response.status})`
      );
    }

    return data;
  };

 const sendOtp = async () => {
  setError("");
  setMessage("");

  if (!email.trim()) {
    setError("Please enter your email");
    return;
  }

  try {
    setLoading(true);

    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
      }),
    });

    const data = await getResponse(response);

    // Only registered email reaches here
    setMessage(data.message || "OTP sent successfully to your email.");
    setStep(2);

  } catch (err) {
    // Unregistered email / other backend error
    setError(
      err instanceof Error
        ? err.message
        : "Unable to send OTP"
    );

    // Stay on email screen
    setStep(1);
  } finally {
    setLoading(false);
  }
};




  const verifyOtp = async () => {
    setError("");
    setMessage("");

    if (!otp.trim() || otp.length !== 6) {
      setError("Enter the 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
        }),
      });

      const data = await getResponse(response);

      setMessage(data.message || "OTP verified successfully.");
      setStep(3);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Invalid OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    setError("");
    setMessage("");

    if (newPassword.length < 8) {
      setError("Password must contain at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
          newPassword,
        }),
      });

      const data = await getResponse(response);

      setMessage(
        data.message || "Password reset successfully!"
      );

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Password reset failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffaf5] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[650px] bg-white rounded-[32px] shadow-2xl px-8 sm:px-12 py-10">
        
        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {step === 1 && "Forgot Password?"}
            {step === 2 && "Verify OTP"}
            {step === 3 && "Create New Password"}
          </h1>

          <p className="text-gray-500 mt-2 text-sm">
            {step === 1 &&
              "Enter your registered email and we'll send you an OTP."}

            {step === 2 &&
              "Enter the 6-digit OTP sent to your email."}

            {step === 3 &&
              "Create a new password for your account."}
          </p>
        </div>

        {/* SUCCESS MESSAGE */}
        {message && (
          <div className="mb-5 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* STEP 1 — EMAIL */}
        {step === 1 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email"
              className="w-full h-12 rounded-xl border border-gray-300 px-4 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />

            <button
              type="button"
              onClick={sendOtp}
              disabled={loading}
              className="w-full mt-6 h-12 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-60 transition"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </div>
        )}

        {/* STEP 2 — OTP */}
        {step === 2 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter OTP
            </label>

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, ""))
              }
              placeholder="Enter 6-digit OTP"
              className="w-full h-12 rounded-xl border border-gray-300 px-4 text-center text-xl tracking-[8px] outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />

            <button
              type="button"
              onClick={verifyOtp}
              disabled={loading}
              className="w-full mt-6 h-12 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-60 transition"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtp("");
                setError("");
                setMessage("");
              }}
              className="w-full mt-3 text-sm text-orange-500 font-medium hover:underline"
            >
              Change Email
            </button>
          </div>
        )}

        {/* STEP 3 — NEW PASSWORD */}
        {step === 3 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>

            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full h-12 rounded-xl border border-gray-300 px-4 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />

            <label className="block text-sm font-medium text-gray-700 mb-2 mt-5">
              Confirm New Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="Confirm new password"
              className="w-full h-12 rounded-xl border border-gray-300 px-4 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />

            <button
              type="button"
              onClick={resetPassword}
              disabled={loading}
              className="w-full mt-6 h-12 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-60 transition"
            >
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </div>
        )}

        {/* BACK TO LOGIN */}
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="w-full mt-6 text-sm text-gray-500 hover:text-orange-500 transition"
        >
          ← Back to Login
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;