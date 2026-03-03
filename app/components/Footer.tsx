import React from 'react'

export default function Footer() {
  return (
    <div>
        <footer className="px-8 py-6 bg-gray-900 text-gray-400 text-sm flex flex-col md:flex-row justify-between items-center gap-4 mt-12">
        <span>© 2026 ResearchBrain</span>
        <div className="flex space-x-6">
          <a href="#" className="hover:text-white transition-colors">About</a>
          <a href="#" className="hover:text-white transition-colors">Resources</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
          <a href="#" className="hover:text-white transition-colors">Legal</a>
        </div>
      </footer>
    </div>
  )
}
