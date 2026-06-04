'use client'
import Link from "next/link"
import { useState, useEffect } from "react"
import { useAuth } from "../../hooks/useAuth"
import { useAuthContext } from "../../context/AuthContext"
import { useQueueContext } from "../../context/QueueContext"

interface HeaderProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
}

export default function Header({ searchTerm, setSearchTerm }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [hasSeenNotifications, setHasSeenNotifications] = useState(false) // State to clear badge on click
  
  const { user, isReady } = useAuthContext()   
  const { signOut } = useAuth()
  const { myAssignedBugs, fetchMyAssignedBugs } = useQueueContext()

  // Re-fetch bugs on login or context initialization
  useEffect(() => {
    if (user) {
      fetchMyAssignedBugs()
    }
  }, [user, fetchMyAssignedBugs])

  // Reset the read tracking indicator if the total item count increases (new notifications arrive)
  useEffect(() => {
    setHasSeenNotifications(false)
  }, [myAssignedBugs.length])

  // Count active un-fixed items conditionally hidden if clicked
  const openBugsCount = !hasSeenNotifications 
    ? myAssignedBugs.filter((bug) => (bug.status ?? (bug as any).Status) !== 'fixed').length 
    : 0

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/my-projects", label: "Projects" },
    { href: "/aboutUs",     label: "About Us" },
    { href: "/contactus",   label: "Contact" },
    { href: "/account",     label: "profile" },
    { href: "/my-notifications", label: "Assigned to me", isNotification: true },
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
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 p-3 shadow-xl bg-base-100 rounded-box w-56 gap-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="flex justify-between items-center" 
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      if (link.isNotification) setHasSeenNotifications(true)
                    }}
                  >
                    <span>{link.label}</span>
                    {link.isNotification && openBugsCount > 0 && (
                      <span className="badge badge-sm badge-error text-white font-bold animate-pulse">
                        {openBugsCount}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <Link href="/" className="text-2xl font-bold text-primary hover:text-primary-focus transition-colors">
            QAFlow
          </Link>
        </div>

        {/* Center: Desktop Navigation Links */}
        <div className="navbar-center hidden md:flex items-center gap-6">
          <ul className="menu menu-horizontal px-1 text-sm font-medium gap-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link 
                  href={link.href} 
                  onClick={() => {
                    if (link.isNotification) setHasSeenNotifications(true)
                  }}
                  className="hover:text-primary flex items-center gap-1.5 relative"
                >
                  <span>{link.label}</span>
                  {link.isNotification && openBugsCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[18px] text-center h-4 flex items-center justify-center shadow-sm">
                      {openBugsCount}
                    </span>
                  )}
                </Link>
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

          {/* Wait for isReady to avoid hydration flash */}
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