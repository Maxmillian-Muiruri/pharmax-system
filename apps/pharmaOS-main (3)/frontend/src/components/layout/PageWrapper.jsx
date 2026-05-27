import Sidebar from './Sidebar'
import Header from './Header'
import Navbar from './Navbar'
import { useState } from 'react'

export default function PageWrapper({ title, action, children }) {
  // Open on desktop, closed on mobile by default
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  )

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar - Transition handled internally in Sidebar component */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main Content Area - Transitions smoothly when Sidebar static width changes */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden transition-all duration-300 ease-in-out">
        {/* Top Navbar */}
        <Navbar onMenuClick={toggleSidebar} />

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {title && <Header title={title} action={action} />}
            <div className="mt-6 font-sans">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
