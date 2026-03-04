'use client';

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 px-6">
      <div className="text-center max-w-xl">
        
        {/* Big 404 */}
        <h1 className="text-7xl md:text-8xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          404
        </h1>

        {/* Title */}
        <h2 className="mt-6 text-2xl md:text-3xl font-bold text-gray-800">
          Page Not Found
        </h2>

        {/* Description */}
        <p className="mt-4 text-gray-600 text-base md:text-lg">
          The page you're looking for doesn’t exist or has been moved.
          Let’s get you back to your dashboard.
        </p>

        {/* Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition shadow-md hover:shadow-lg"
          >
            Go Home
          </Link>

          <Link
            href="/my-projects"
            className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition"
          >
            View Projects
          </Link>
        </div>

        {/* Decorative subtle card */}
        <div className="mt-12 p-6 bg-white/70 backdrop-blur rounded-2xl shadow-md border border-gray-100">
          <p className="text-sm text-gray-500">
            If you believe this is an error, please contact support or check the URL.
          </p>
        </div>
      </div>
    </div>
  );
}