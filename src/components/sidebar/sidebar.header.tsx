import { SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '../ui/sidebar'
import { cn } from '@/lib/utils'

const HeaderSidebar = () => {
    const { state } = useSidebar();
    return (
        <SidebarHeader>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        size="lg"
                        className={cn("hover:bg-main", state === "collapsed" ? "bg-transparent border-none shadow-none" : "")}
                    >
                        <div className={cn("bg-transparent text-sidebar-primary-foreground flex aspect-square transition-all items-center justify-center rounded-lg", state === "collapsed" ? "size-8" : "size-12")}>
                            <img src="/LogoWR.png" alt="" />
                        </div>
                        <div className="grid flex-1 text-left text-sm leading-tight text-sidebar-accent-foreground">
                            <span className="truncate font-semibold">Sales</span>
                            <span className="truncate font-semibold">Platform</span>
                        </div>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarHeader>
    )
}

export default HeaderSidebar