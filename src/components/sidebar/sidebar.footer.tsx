import { SidebarFooter, SidebarMenu, SidebarMenuButton, useSidebar } from '../ui/sidebar'
import { useAuth } from '@/providers/auth.provider'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { BadgeCheck, Bell, ChevronsUpDown, LogOut } from 'lucide-react';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

const FooterSidebar = () => {
    const { user, logoutUser } = useAuth();
    const { state, isMobile } = useSidebar();

    const userData = useMemo(() => {
        if (!user) return null;

        return {
            name: `${user.first_name} ${user.last_name}`,
            email: user.email_address,
            avatar: user.image,
        }
    }, [user])

    if (!userData) return;

    return (
        <SidebarFooter>
            <SidebarMenu>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="flex items-center hover:bg-main-400 data-[active=true]:bg-main-400"
                        >
                            <div className={cn("bg-transparent text-sidebar-primary-foreground flex aspect-square transition-all items-center justify-center rounded-lg", state === "collapsed" ? "size-8" : "size-8")}>
                                <img src="https://github.com/vncntkyl.png" alt="" className='rounded-lg' />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{userData.name}</span>
                                <span className="truncate text-xs">{userData.email}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <div className={cn("bg-transparent text-sidebar-primary-foreground flex aspect-square transition-all items-center justify-center rounded-lg", state === "collapsed" ? "size-8" : "size-8")}>
                                    <img src="https://github.com/vncntkyl.png" alt="" className='rounded-lg' />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{userData.name}</span>
                                    <span className="truncate text-xs">{userData.email}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem className='gap-1'>
                                <BadgeCheck size={16} />
                                <span>Account</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className='gap-1'>
                                <Bell size={16} />
                                <span>Notifications</span>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className='gap-1 text-red-300' onClick={logoutUser}>
                            <LogOut size={16} />
                            <span>Logout</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenu>
        </SidebarFooter >
    )
}

export default FooterSidebar