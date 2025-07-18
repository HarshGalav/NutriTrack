'use client'

import { useSession, signIn, signOut } from "next-auth/react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { Sun, Moon, User, LogOut, Home, Camera, Settings, BarChart3 } from "lucide-react"

export function Navigation() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()

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
                    <img
                      src={session.user.image}
                      alt={session.user.name || ''}
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
    </nav>
  )
}