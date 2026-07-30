import { ReactNode } from "react"
import AppSidebar from "./sidebar.app"

const HomeSidebar = ({ children }: { children: ReactNode }) => {
    return (
        <>
            <AppSidebar />
            {children}
        </>
    )
}

export default HomeSidebar