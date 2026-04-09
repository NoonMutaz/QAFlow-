'use client'
import Link from "next/link"
import { useState } from "react"
import { useAuth } from "../../hooks/useAuth"
import { useAuthContext } from "../../context/AuthContext"

interface HeaderProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
}

export default function Header({ searchTerm, setSearchTerm }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, isReady } = useAuthContext()   //   use context, not localStorage directly
  const { signOut } = useAuth()

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/my-projects", label: "Projects" },
    { href: "/aboutUs",     label: "About Us" },
    { href: "/contact",     label: "Contact" },
  ]

  return (
    <div className="sticky top-0 z-50 bg-base-100/90 backdrop-blur-md shadow-md border-b border-base-300">
      <div className="navbar px-4 md:px-8 py-3">

        {/* Left: Logo + Mobile Menu */}
        <div className="navbar-start flex items-center gap-2">

          <div className={`dropdown md:hidden ${isMobileMenuOpen ? "dropdown-open" : ""}`}>
            <label
              tabIndex={0}
              className="btn btn-ghost btn-circle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </label>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 p-3 shadow-xl bg-base-100 rounded-box w-56">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <Link href="/" className="text-2xl font-bold text-primary hover:text-primary-focus transition-colors">
            QAFlow
          </Link>
        </div>

        {/* Center: Search + Desktop Nav */}
        <div className="navbar-center hidden md:flex items-center gap-6">
          <div className="relative">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              type="text"
              placeholder="Search user, project..."
              className="input input-bordered w-72 pl-10 focus:ring-primary"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <ul className="menu menu-horizontal px-1 text-sm font-medium gap-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-primary">{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Mobile Search + Auth Button */}
        <div className="navbar-end flex items-center gap-3">
          <div className="md:hidden">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              type="text"
              placeholder="Search..."
              className="input input-bordered input-sm w-32"
            />
          </div>

          {/*   wait for isReady to avoid hydration flash */}
    {!isReady ? (
  <div className="w-20 h-8 bg-gray-200 rounded animate-pulse" />
) : user ? (
  <div className="flex items-center gap-3">
    <span className="hidden md:block text-sm text-gray-500">
      Hi, <span className="font-medium text-gray-800">{user.name}</span>
    </span>
    <button
      onClick={signOut}
      className="btn btn-secondary btn-sm md:btn-md hover:scale-105 transition-transform"
    >
      Logout
    </button>
  </div>
) : (
  <Link href="/login">
    <button className="btn btn-primary btn-sm md:btn-md hover:scale-105 transition-transform">
      Sign In
    </button>
  </Link>
)}
        </div>

      </div>
    </div>
  )
}