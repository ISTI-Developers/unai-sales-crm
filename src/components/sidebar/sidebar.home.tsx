import { ReactNode } from "react"
import { SidebarProvider } from "../ui/sidebar"
import AppSidebar from "./sidebar.app"

const HomeSidebar = ({ children }: { children: ReactNode }) => {
    const defaultOpen = localStorage.getItem("sidebar_state") === "true"
    return (
        <SidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar />
            {children}
        </SidebarProvider>
    )
}

export default HomeSidebar