'use client'

import { useSession, signIn, signOut } from "next-auth/react"
import { useTheme } from "next-themes"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Sun, Moon, User, LogOut, Home, Camera, Settings, BarChart3, Menu, X } from "lucide-react"

export function Navigation() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">NT</span>
              </div>
              <span className="font-bold text-xl">NutriTrack</span>
            </Link>
          </div>

          {session && (
            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              >
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/scan"
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              >
                <Camera className="w-4 h-4" />
                <span>Scan Meal</span>
              </Link>
              <Link
                href="/trends"
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Trends</span>
              </Link>
              <Link
                href="/settings"
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </Link>
            </div>
          )}

          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            {session && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md hover:bg-accent hover:text-accent-foreground"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}

            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {session ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {session.user?.image && (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || ''}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span className="hidden sm:block text-sm font-medium">
                    {session.user?.name}
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:block">Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn('google')}
                className="flex items-center space-x-1 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {session && isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-background border-b border-border">
            <Link
              href="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium hover:bg-accent hover:text-accent-foreground"
            >
              <Home className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/scan"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium hover:bg-accent hover:text-accent-foreground"
            >
              <Camera className="w-5 h-5" />
              <span>Scan Meal</span>
            </Link>
            <Link
              href="/trends"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium hover:bg-accent hover:text-accent-foreground"
            >
              <BarChart3 className="w-5 h-5" />
              <span>Trends</span>
            </Link>
            <Link
              href="/settings"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium hover:bg-accent hover:text-accent-foreground"
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </Link>
            
            {/* Mobile user info and sign out */}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center px-3 py-2">
                {session.user?.image && (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || ''}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full mr-3"
                  />
                )}
                <div className="flex-1">
                  <div className="text-base font-medium text-foreground">
                    {session.user?.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {session.user?.email}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  signOut()
                }}
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium hover:bg-accent hover:text-accent-foreground w-full text-left"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}