import React from 'react'

export default function Footer() {
  return (
    <div>
     <footer className="relative py-8 px-6 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-gray-600">
            &copy; 2026 QAFlow Project Hub. All rights reserved.
          </p>
          <div className="flex justify-center gap-6 mt-4">
            <a href="/privacy" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">Privacy Policy</a>
            <a href="/privacy" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">Terms of Service</a>
            <a href="/contactus" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
