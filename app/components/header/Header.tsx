'use client'
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { useAuth } from "../../hooks/useAuth"
import { useAuthContext } from "../../context/AuthContext"
import { useQueueContext } from "../../context/QueueContext"
import { usePendingReviews } from "../../hooks/usePendingReviews"
import Image from "next/image";

interface HeaderProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
}

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/my-projects", label: "Audits & Projects" },
  { href: "/aboutUs", label: "Compliance Standards" },
  { href: "/contactus", label: "Support" },
  { href: "/account", label: "Profile" },
  { href: "/my-notifications", label: "Assigned Audits", isNotification: true },
]

/** Shown to owners only while fixes are waiting for their approval (or while on the page). */
const approvalsLink = { href: "/approvals", label: "Approvals", isApprovals: true }

/** Shield + check mark: compliance verified before closure. */
function BrandMark() {
  return (
<div className="absolute   w-21 h-21 rounded-xl overflow-hidden       flex items-center justify-center shrink-0   group-hover:border-emerald-500/60 transition-all duration-300">
      <Image
        src="/logo.png"
        alt="Imtithal Logo"
        width={180}
        height={180}
        className="w-full h-full object-contain p-0.5"
        priority
      />
    </div>
  )
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-3 group" aria-label="امتثال - Imtithal">
      <BrandMark />
      <div className="leading-none">
        {/* <span className="block text-xl font-extrabold text-slate-100 transition-colors group-hover:text-emerald-400">
          امتثال
        </span>
        <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
          Imtithal · SBC
        </span> */}
      </div>
    </Link>
  )
}

export default function Header({ searchTerm, setSearchTerm }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [hasSeenNotifications, setHasSeenNotifications] = useState(false)

  const pathname = usePathname()
  const { user, isReady } = useAuthContext()
  const { signOut } = useAuth()
  const { myAssignedBugs, fetchMyAssignedBugs } = useQueueContext()
  const { reviews } = usePendingReviews()

  // Re-fetch assigned items on user change
  useEffect(() => {
    if (user) {
      fetchMyAssignedBugs()
    }
  }, [user, fetchMyAssignedBugs])

  // Reset notification tracking when assigned count changes
  useEffect(() => {
    setHasSeenNotifications(false)
  }, [myAssignedBugs.length])

  // Close the mobile menu after navigating
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Count active non-compliance / assigned audit tasks
  const openBugsCount = !hasSeenNotifications
    ? myAssignedBugs.filter((bug) => !['fixed', 'pendingReview'].includes(bug.status ?? (bug as any).Status)).length
    : 0
  const badgeText = openBugsCount > 9 ? "9+" : String(openBugsCount)

  const reviewsCount = reviews.length
  const links: { href: string; label: string; isNotification?: boolean; isApprovals?: boolean }[] =
    reviewsCount > 0 || pathname?.startsWith("/approvals") ? [...navLinks, approvalsLink] : navLinks
  const badgeFor = (link: { isNotification?: boolean; isApprovals?: boolean }) =>
    link.isApprovals
      ? reviewsCount > 0 ? (reviewsCount > 9 ? "9+" : String(reviewsCount)) : null
      : link.isNotification && openBugsCount > 0 ? badgeText : null

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href)

  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() ?? "?"

  return (
    <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 shadow-lg shadow-black/20 text-slate-100">
      <div className="navbar px-4 md:px-8 py-3 max-w-7xl mx-auto flex items-center justify-between">

        {/* Mobile menu + brand */}
        <div className="navbar-start flex items-center gap-2 w-auto">
          <div className={`dropdown md:hidden ${isMobileMenuOpen ? "dropdown-open" : ""}`}>
            <button
              type="button"
              className="btn btn-ghost btn-circle text-slate-200 hover:bg-slate-800"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
            <ul className="menu menu-sm dropdown-content mt-3 p-3 shadow-2xl bg-slate-900 border border-slate-800 rounded-xl w-64 gap-1 text-slate-200">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className={`flex justify-between items-center py-2.5 px-3 rounded-lg transition-colors hover:bg-slate-800 hover:text-emerald-400 ${
                      isActive(link.href) ? "bg-slate-800 text-emerald-400" : ""
                    }`}
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      if (link.isNotification) setHasSeenNotifications(true)
                    }}
                  >
                    <span>{link.label}</span>
                    {badgeFor(link) && (
                      <span className={`badge badge-sm font-bold border-none ${link.isApprovals ? "bg-amber-400" : "bg-emerald-500"} text-slate-950`}>
                        {badgeFor(link)}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <Brand />
        </div>

        {/* Center: Desktop navigation */}
        <nav className="navbar-center hidden md:flex items-center" aria-label="Main">
          <ul className="menu menu-horizontal px-1 text-sm font-medium gap-1">
            {links.map((link) => {
              const active = isActive(link.href)
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => {
                      if (link.isNotification) setHasSeenNotifications(true)
                    }}
                    className={`relative flex items-center gap-2 py-2 px-3 rounded-lg transition-all hover:text-emerald-400 hover:bg-slate-800/60 ${
                      active ? "text-emerald-400" : "text-slate-300"
                    }`}
                  >
                    <span>{link.label}</span>
                    {badgeFor(link) && (
                      <span className={`${link.isApprovals ? "bg-amber-400" : "bg-emerald-500"} text-slate-950 text-[10px] font-black px-1.5 rounded-full min-w-[18px] h-4 flex items-center justify-center shadow-sm`}>
                        {badgeFor(link)}
                      </span>
                    )}
                    {active && (
                      <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-emerald-400" />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Right: search + authentication */}
        <div className="navbar-end flex items-center gap-3 w-auto">
          <div className="hidden sm:block md:hidden">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              type="text"
              placeholder="Search compliance..."
              aria-label="Search"
              className="input input-sm bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:outline-none w-32"
            />
          </div>

          {!isReady ? (
            <div className="w-20 h-8 bg-slate-800 rounded-lg animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex items-center gap-2">
                <span
                  className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-sm font-bold flex items-center justify-center"
                  aria-hidden="true"
                >
                  {initial}
                </span>
                <span className="text-xs font-semibold text-slate-200">{user.name}</span>
              </div>
              <button
                onClick={signOut}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-700/50 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link href="/login">
              <button className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/40 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60">
                Sign In
              </button>
            </Link>
          )}
        </div>

      </div>
    </header>
  )
}