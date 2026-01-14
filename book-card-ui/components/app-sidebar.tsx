"use client"

import { SidebarContent, Sidebar } from "@/components/ui/sidebar"

interface AppSidebarProps {
  activeLibraryId: string | null
  onLibrarySelect: (id: string | null) => void
}

export function AppSidebar({ activeLibraryId, onLibrarySelect }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarContent>
        <div className="px-4 py-6">
          <h2 className="text-sm font-semibold mb-4 text-foreground">Libraries</h2>
          <button
            onClick={() => onLibrarySelect(null)}
            className={`w-full px-4 py-2 rounded-lg text-sm mb-2 transition-colors ${
              activeLibraryId === null ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-foreground"
            }`}
          >
            My Library
          </button>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
