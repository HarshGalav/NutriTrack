'use client'

import { Github, Linkedin, Mail, Code, Heart, Coffee } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="space-y-16">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Harsh Galav
            </h1>
            <p className="text-xl text-gray-300 font-medium">
              Full-Stack Developer
            </p>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Passionate about creating innovative web applications with modern technologies. 
              Specializing in React, Next.js, and AI integration.
            </p>
          </div>

          {/* About Section */}
          <div className="grid gap-8 md:grid-cols-2">
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-slate-700/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gray-600 rounded-lg">
                  <Code className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-white">About Me</h2>
              </div>
              <p className="text-gray-300 leading-relaxed mb-6">
                I&apos;m a dedicated full-stack developer with a passion for building scalable web applications. 
                I enjoy working with cutting-edge technologies and solving complex problems through code.
              </p>
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-white">Technologies I Love</h3>
                <div className="flex flex-wrap gap-2">
                  {['React', 'Next.js', 'TypeScript', 'Node.js', 'Prisma', 'PostgreSQL', 'Tailwind CSS'].map((tech) => (
                    <span key={tech} className="px-3 py-1 bg-gray-700 text-gray-200 rounded-full text-sm font-medium hover:bg-gray-600 transition-colors">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-slate-700/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gray-600 rounded-lg">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-white">NutriTrack Project</h2>
              </div>
              <p className="text-gray-300 leading-relaxed mb-6">
                NutriTrack is a comprehensive nutrition tracking application that combines AI-powered meal analysis 
                with intuitive user experience design. Built with modern web technologies and integrated with Google Gemini AI.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  AI-powered meal analysis
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                  Barcode scanning integration
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                  Comprehensive nutrition tracking
                </div>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-slate-700/50">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-gray-600 rounded-lg">
                <Coffee className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-white">Let&apos;s Connect</h2>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
              <a 
                href="mailto:harshsharma3122@gmail.com" 
                className="flex items-center gap-4 p-4 bg-slate-700/50 rounded-xl hover:bg-slate-700 transition-colors group"
              >
                <div className="p-2 bg-gray-600 rounded-lg group-hover:scale-110 transition-transform">
                  <Mail className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-white">Email</div>
                  <div className="text-sm text-gray-400">Get in touch</div>
                </div>
              </a>
              
              <a 
                href="https://github.com/HarshGalav" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-slate-700/50 rounded-xl hover:bg-slate-700 transition-colors group"
              >
                <div className="p-2 bg-gray-600 rounded-lg group-hover:scale-110 transition-transform">
                  <Github className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-white">GitHub</div>
                  <div className="text-sm text-gray-400">View my code</div>
                </div>
              </a>
              
              <a 
                href="https://www.linkedin.com/in/harsh-sharma-a3a560244/" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-slate-700/50 rounded-xl hover:bg-slate-700 transition-colors group"
              >
                <div className="p-2 bg-gray-600 rounded-lg group-hover:scale-110 transition-transform">
                  <Linkedin className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-white">LinkedIn</div>
                  <div className="text-sm text-gray-400">Connect with me</div>
                </div>
              </a>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-gray-400">
                Open to new opportunities and interesting projects
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-gray-500">
            <p>© {new Date().getFullYear()} Harsh Galav. Built with Next.js and Tailwind CSS.</p>
          </div>
        </div>
      </div>
    </div>
  )
}