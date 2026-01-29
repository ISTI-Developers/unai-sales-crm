/* eslint-disable @typescript-eslint/no-unused-vars */
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNotifications, useReadNotification } from "@/hooks/useNotifications"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useAuth } from "@/providers/auth.provider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"

const Notifications = () => {
    const { user } = useAuth();
    const { data, isLoading } = useNotifications();
    const { mutate } = useReadNotification();
    const [filter, setFilter] = useState("ALL")

    const notifications = useMemo(() => {
        if (!data || isLoading) return [];

        return data.map(item => {
            const { recipients, ...i } = item;
            return i
        }).filter(item => filter === "ALL" ? item : item.read_at === null)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }, [data, filter, isLoading])

    const readNotification = (notification_id: number) => {
        if (!user) return;
        mutate({ notification_id: notification_id, user_id: Number(user.ID) })
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button className='gap-1 bg-white/30 hover:bg-white/20 relative rounded-full' size={"icon"} variant={null}>
                    <Bell size={16} />
                    {notifications.length > 0 && notifications.some(notif => notif.read_at === null) &&
                        <div className="size-5 bg-white text-black absolute rounded-full -top-1 -right-2">
                            {data ? data.filter(item => item.read_at === null).length : null}
                        </div>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="mr-4 p-2 space-y-2">
                <header className="font-bold text-slate-700 flex items-center justify-between">
                    <h1>Notifications</h1>
                    <div className="flex gap-2">
                        <Button className={cn("rounded-full text-xs px-3 h-6", filter === "ALL" ? "bg-slate-500 text-white hover:bg-slate-600 hover:text-white" : "")} size={"sm"} variant="outline" onClick={() => setFilter("ALL")}>All</Button>
                        <Button className={cn("rounded-full text-xs px-3 h-6", filter === "UNR" ? "bg-slate-500 text-white hover:bg-slate-600 hover:text-white" : "")} size={"sm"} variant="outline" onClick={() => setFilter("UNR")}>Unread</Button>
                    </div>
                </header>
                <ScrollArea className="">
                    <main className="flex flex-col gap-1 pt-2 max-h-[250px]">
                        {notifications.length > 0 ? notifications.map(notification => {
                            return <Link key={notification.ID} to={notification.url} onClick={() => readNotification(notification.ID)} className={cn("p-2 w-full hover:bg-slate-100 grid grid-cols-[auto_1fr] gap-2 rounded-md relative", !notification.read_at ? "bg-slate-100 hover:bg-slate-200" : "")}>
                                {/* <div className="size-7 text-white rounded-lg bg-emerald-300 flex items-center justify-center">
                                <Icon size={16} />
                            </div> */}
                                <div className="text-sm">
                                    <h1 className="font-semibold text-slate-700">{notification.title}</h1>
                                    <p className="text-xs">{notification.body}</p>
                                    <TimeReceived created_at={new Date(notification.created_at)} />
                                </div>
                                {!notification.read_at &&
                                    <div className="size-4 bg-red-400 text-black absolute rounded-full -top-1.5 -left-0" />
                                }
                            </Link>
                        }) : <div className="text-xs flex items-center justify-center bg-slate-100 rounded-md py-2">No notifications at the moment.</div>}
                    </main>
                </ScrollArea>
                <footer className="flex items-center justify-center p-1 hover:bg-slate-100 transition-all rounded-md w-full">
                    <Link to="/#notifications" className="text-xs text-center font-medium text-slate-500 w-full">View all notifications</Link>
                </footer>
            </PopoverContent>
        </Popover>
    )
}

const TimeReceived = ({ created_at }: { created_at: Date }) => {
    const timeReceived = useMemo(() => {
        const difference = Math.round((new Date().getTime() - created_at.getTime()) / 1000);
        console.log(new Date(), created_at, (new Date().getTime() - created_at.getTime()) / 1000, difference, 60 * 60 * 24);

        if (difference < 60) {
            return `${difference} secs ago`;
        }
        else if (difference < 3600) {
            return `${Math.round(difference / 60)} mins ago`;
        }
        else if (difference < 3600 * 24) {
            return `${Math.round(difference / 60 / 60)} hours ago`;
        }
        else if (difference < 3600 * 24 * 30) {
            return `${Math.round(difference / 60 / 60 / 24)} days ago`;
        }


        return format(created_at, "PP");
    }, [created_at])

    return <p className="text-[0.6rem] text-slate-400 font-semibold leading-[1.5]">{timeReceived}</p>
}

export default Notifications