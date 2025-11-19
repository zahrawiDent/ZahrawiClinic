import { createFileRoute, Link, redirect } from "@tanstack/solid-router"
import { PageLayout } from "@/components/ui"

export const Route = createFileRoute('/')({
  beforeLoad: ({ context }) => {
    // Redirect authenticated users to dashboard before rendering
    if (context.auth.isAuthenticated()) {
      throw redirect({
        to: '/dashboard',
      })
    }
  },
  component: HomePage,
})

function HomePage() {
  return (
    <PageLayout variant="auth">
      <div class="min-h-screen bg-gradient-to-br from-[var(--color-bg-primary)] via-[var(--color-bg-secondary)] to-[var(--color-bg-tertiary)]">
        {/* Navigation */}
        <nav class="absolute top-0 left-0 right-0 z-10 border-b border-[var(--color-border-primary)]/20 bg-[var(--color-bg-primary)]/80 backdrop-blur-md">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-secondary)] rounded-xl flex items-center justify-center shadow-lg">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <div class="text-lg font-bold text-[var(--color-text-primary)]">Zahrawi Clinic</div>
                  <div class="text-xs text-[var(--color-text-secondary)]">Dental Management System</div>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <Link 
                  to="/login" 
                  class="px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] hover:text-[var(--color-brand-primary)] transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  to="/signup" 
                  class="px-5 py-2 text-sm font-semibold bg-gradient-to-r from-[var(--color-brand-primary)] to-[var(--color-brand-secondary)] text-white rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div class="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div class="max-w-7xl mx-auto">
            <div class="text-center mb-16">
              {/* Open Source Badge */}
              <div class="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-success-bg)] border border-[var(--color-success-border)] rounded-full text-sm font-medium text-[var(--color-success-text)] mb-6">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                </svg>
                Free & Open Source
              </div>

              <h1 class="text-5xl sm:text-6xl lg:text-7xl font-bold text-[var(--color-text-primary)] mb-6 leading-tight">
                Own Your Data,
                <br />
                <span class="bg-gradient-to-r from-[var(--color-brand-primary)] to-[var(--color-brand-secondary)] bg-clip-text text-transparent">
                  Empower Your Practice
                </span>
              </h1>
              <p class="text-xl sm:text-2xl text-[var(--color-text-secondary)] max-w-3xl mx-auto mb-4 leading-relaxed">
                Free, open-source dental practice management system. Self-host it, customize it, own it completely.
              </p>
              <p class="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed">
                Part of the <span class="font-semibold text-[var(--color-brand-primary)]">zahrawiDent</span> project — making quality dentistry accessible for all.
              </p>
              <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link 
                  to="/signup" 
                  class="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-[var(--color-brand-primary)] to-[var(--color-brand-secondary)] text-white rounded-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105"
                >
                  Get Started Free
                </Link>
                <a 
                  href="https://github.com/zahrawiDent/new-clinic"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="px-8 py-4 text-lg font-semibold border-2 border-[var(--color-border-primary)] text-[var(--color-text-primary)] rounded-xl hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)] transition-all duration-200 flex items-center gap-2"
                >
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
                  </svg>
                  View on GitHub
                </a>
              </div>
            </div>

            {/* Features Grid */}
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              <div class="bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-1">
                <div class="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-5 shadow-lg">
                  <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clip-rule="evenodd" />
                  </svg>
                </div>
                <h3 class="text-xl font-bold text-[var(--color-text-primary)] mb-3">100% Free Forever</h3>
                <p class="text-[var(--color-text-secondary)] leading-relaxed">
                  No subscriptions, no hidden fees, no paywalls. Download, install, and use completely free. Forever.
                </p>
              </div>

              <div class="bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-1">
                <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-5 shadow-lg">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                </div>
                <h3 class="text-xl font-bold text-[var(--color-text-primary)] mb-3">Self-Hostable</h3>
                <p class="text-[var(--color-text-secondary)] leading-relaxed">
                  Run it on your own servers. Full control over your infrastructure, no cloud dependencies, no vendor lock-in.
                </p>
              </div>

              <div class="bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-1">
                <div class="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-5 shadow-lg">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 class="text-xl font-bold text-[var(--color-text-primary)] mb-3">You Own Your Data</h3>
                <p class="text-[var(--color-text-secondary)] leading-relaxed">
                  Your patient data stays with you. Complete privacy, full ownership, no third-party access. Ever.
                </p>
              </div>

              <div class="bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-1">
                <div class="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-5 shadow-lg">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 class="text-xl font-bold text-[var(--color-text-primary)] mb-3">Patient Management</h3>
                <p class="text-[var(--color-text-secondary)] leading-relaxed">
                  Complete patient records with medical history, treatment plans, and real-time updates across your team.
                </p>
              </div>

              <div class="bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-1">
                <div class="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-5 shadow-lg">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 class="text-xl font-bold text-[var(--color-text-primary)] mb-3">Smart Scheduling</h3>
                <p class="text-[var(--color-text-secondary)] leading-relaxed">
                  Intelligent appointment booking with conflict detection, reminders, and calendar integration.
                </p>
              </div>

              <div class="bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-1">
                <div class="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center mb-5 shadow-lg">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 class="text-xl font-bold text-[var(--color-text-primary)] mb-3">Digital Charting</h3>
                <p class="text-[var(--color-text-secondary)] leading-relaxed">
                  Interactive dental charts with condition tracking, periodontal records, and treatment documentation.
                </p>
              </div>
            </div>

            {/* Mission Section */}
            <div class="bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] rounded-3xl p-12 text-center shadow-xl mb-16">
              <div class="max-w-3xl mx-auto">
                <div class="w-16 h-16 bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-secondary)] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                </div>
                <h2 class="text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)] mb-4">
                  Part of zahrawiDent
                </h2>
                <p class="text-xl text-[var(--color-text-secondary)] leading-relaxed mb-6">
                  Our mission is to make quality dental care accessible to everyone, everywhere. 
                  By providing free, open-source tools, we empower dental professionals to focus 
                  on what matters most — their patients.
                </p>
                <p class="text-lg text-[var(--color-text-secondary)] leading-relaxed">
                  No barriers. No costs. Just better dentistry for all.
                </p>
              </div>
            </div>

            {/* CTA Section */}
            <div class="bg-gradient-to-r from-[var(--color-brand-primary)] to-[var(--color-brand-secondary)] rounded-3xl p-12 text-center shadow-2xl">
              <h2 class="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Own Your Practice Data?
              </h2>
              <p class="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Join the movement of dental professionals taking control of their practice management.
              </p>
              <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link 
                  to="/signup" 
                  class="inline-block px-10 py-4 text-lg font-semibold bg-white text-[var(--color-brand-primary)] rounded-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105"
                >
                  Get Started Free
                </Link>
                <a 
                  href="https://github.com/zahrawiDent/new-clinic"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-block px-10 py-4 text-lg font-semibold bg-white/10 text-white border-2 border-white/30 rounded-xl hover:bg-white/20 transition-all duration-200"
                >
                  Star on GitHub
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer class="border-t border-[var(--color-border-primary)] bg-[var(--color-bg-primary)]/80 backdrop-blur-md mt-16">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="text-center">
              <div class="flex items-center justify-center gap-2 mb-3">
                <svg class="w-5 h-5 text-[var(--color-text-secondary)]" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
                </svg>
                <p class="text-sm text-[var(--color-text-secondary)]">
                  Built with love in Egypt 🇪🇬
                </p>
              </div>
              <p class="text-sm text-[var(--color-text-secondary)] mb-3">
                © 2024 zahrawiDent Project. Free & Open Source Software.
              </p>
              <div class="flex justify-center gap-6 text-sm text-[var(--color-text-secondary)] mb-4">
                <a 
                  href="https://github.com/zahrawiDent/new-clinic" 
                  target="_blank"
                  rel="noopener noreferrer"
                  class="hover:text-[var(--color-brand-primary)] transition-colors flex items-center gap-1"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
                  </svg>
                  GitHub
                </a>
                <a href="https://github.com/zahrawiDent/new-clinic/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" class="hover:text-[var(--color-brand-primary)] transition-colors">License</a>
                <a href="https://github.com/zahrawiDent/new-clinic/wiki" target="_blank" rel="noopener noreferrer" class="hover:text-[var(--color-brand-primary)] transition-colors">Documentation</a>
                <a href="https://github.com/zahrawiDent/new-clinic/issues" target="_blank" rel="noopener noreferrer" class="hover:text-[var(--color-brand-primary)] transition-colors">Support</a>
              </div>
              <p class="text-xs text-[var(--color-text-secondary)]">
                Making dentistry accessible for all 🦷
              </p>
            </div>
          </div>
        </footer>
      </div>
    </PageLayout>
  )
}
