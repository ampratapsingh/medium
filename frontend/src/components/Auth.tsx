import { Link } from "react-router-dom";


export const Auth = ({ type }: { type: "signin" | "signup" }) => {
  return (
    <div className="h-screen flex justify-center flex-col">
      <div className="flex justify-center">
        <div className="max-w-md w-full px-8">
          {/* Header */}
          <div className="text-center mb-2">
            <div className="text-3xl font-extrabold">
              {type === "signup" ? "Create an account" : "Login to your account"}
            </div>
            <div className="text-slate-500 mt-2">
              {type === "signup" ? (
                <>
                  Already have an account?{" "}
                  <Link to="/signin" className="underline">
                    Sign in
                  </Link>
                </>
              ) : (
                <>
                  Don't have an account?{" "}
                  <a href="/signup" className="underline">
                    Sign up
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Form */}
          <div className="mt-8">
            {/* Username - Only for signup */}
            {type === "signup" && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="Enter your username"
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
            )}

            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                placeholder="m@example.com"
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            {/* Password */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder=""
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            {/* Submit Button */}
            <button className="w-full bg-black text-white py-2 rounded-md font-medium hover:bg-slate-800 transition-colors">
              {type === "signup" ? "Sign Up" : "Sign In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};