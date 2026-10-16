import { SidebarFooter, SidebarMenu, SidebarMenuButton, useSidebar } from '../ui/sidebar'
import { useAuth } from '@/providers/auth.provider'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { BadgeCheck, Cog, LogOut } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Avatar, AvatarImage } from '../ui/avatar';
import { Switch } from '../ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { subscribeUserToPush, unsubscribeUserFromPush } from '@/lib/notifications';

const FooterSidebar = () => {
    const { user, logoutUser } = useAuth();
    const { isMobile } = useSidebar();
    const [open, setOpen] = useState(false);
    const [isNotificationsEnabled, setIsNotificationsEnabled] =
        useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const userData = useMemo(() => {
        if (!user) return null;

        return {
            name: `${user.first_name} ${user.last_name}`,
            email: user.email_address,
            avatar: user.image ? `${import.meta.env.VITE_SERVER}images/${user.image}` : '/user.png',
        }
    }, [user])

    async function onEnableNotification(checked: boolean) {
        setIsUpdating(true);

        try {
            const registration = await navigator.serviceWorker.ready;

            if (checked) {
                await subscribeUserToPush(registration);
                setIsNotificationsEnabled(true);
            } else {
                await unsubscribeUserFromPush(registration);
                setIsNotificationsEnabled(false);
            }
        } catch (error) {
            console.error("Failed to update notifications:", error);
            // Keep the UI consistent with the browser's actual subscription.
            try {
                const registration = await navigator.serviceWorker.ready;
                const subscription =
                    await registration.pushManager.getSubscription();

                setIsNotificationsEnabled(Boolean(subscription));
            } catch {
                // Preserve the current state if the status cannot be checked.
            }
        } finally {
            setIsUpdating(false);
        }
    }
    useEffect(() => {
        async function checkSubscription() {
            try {
                const registration = await navigator.serviceWorker.ready;
                const subscription =
                    await registration.pushManager.getSubscription();

                setIsNotificationsEnabled(Boolean(subscription));
            } catch (error) {
                console.error("Failed to check push subscription:", error);
            }
        }

        void checkSubscription();
    }, []);
    if (!userData) return;

    return (
        <>
            <SidebarFooter>
                <SidebarMenu>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="flex items-center hover:bg-main-400 data-[active=true]:bg-main-400 overflow-hidden"
                            >
                                <Avatar className='size-8'>
                                    <AvatarImage src={userData.avatar} className='object-cover object-top' />
                                </Avatar>
                                {/* <div className={cn("bg-transparent text-sidebar-primary-foreground flex aspect-square transition-all items-center justify-center rounded-lg overflow-hidden size-8")}>
                                <img src={userData.avatar} alt="" className='rounded-lg' />
                            </div> */}
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium capitalize">{userData.name}</span>
                                    <span className="truncate text-xs">{userData.email}</span>
                                </div>
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            onInteractOutside={(e) => e.preventDefault()}
                            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                            side={isMobile ? "bottom" : "right"}
                            align="end"
                            sideOffset={4}
                        >
                            <DropdownMenuLabel className="p-0 font-normal rounded-lg">
                                <div className="flex items-center gap-2 p-1.5 text-left text-sm">
                                    <Avatar>
                                        <AvatarImage src={userData.avatar} className='object-cover object-top' />
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-medium capitalize">{userData.name}</span>
                                        <span className="truncate text-xs">{userData.email}</span>
                                    </div>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem className='gap-1' disabled>
                                    <BadgeCheck size={16} />
                                    <span>Account</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className='gap-1' onSelect={() => setOpen(true)}>
                                    <Cog size={16} />
                                    <span>Settings</span>
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
            </SidebarFooter>
            <Dialog open={open} onOpenChange={setOpen} modal={false}>
                {open && <div className='fixed inset-0 bg-black/30' onClick={() => setOpen(false)} />}
                <DialogContent onInteractOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>Account Settings</DialogTitle>
                        <DialogDescription>Manage website configurations here.</DialogDescription>
                    </DialogHeader>
                    <main>
                        <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                            <label
                                htmlFor="enable-notifications"
                                className="cursor-pointer text-sm font-medium"
                            >
                                Enable notifications
                            </label>

                            <Switch
                                id="enable-notifications"
                                checked={isNotificationsEnabled}
                                disabled={isUpdating}
                                onCheckedChange={onEnableNotification}
                            />
                        </div>
                    </main>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default FooterSidebar