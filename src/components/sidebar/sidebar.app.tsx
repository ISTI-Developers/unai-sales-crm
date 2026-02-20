import { Link, useLocation } from "react-router-dom"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar"
import { LayoutDashboardIcon } from "lucide-react"
import { capitalize, cn } from "@/lib/utils";
import { useMemo } from "react";
import useLinks from "@/data/links";
import HeaderSidebar from "./sidebar.header";
import FooterSidebar from "./sidebar.footer";
import { ScrollArea } from "../ui/scroll-area";

const AppSidebar = () => {
    const { links } = useLinks();
    const { pathname } = useLocation()

    const groupedLinks = useMemo(() => {
        return links.filter(link => link.handler.length !== 0).reduce((acc, link) => {
            const { group } = link;

            if (!acc[group]) {
                acc[group] = [];
            }

            acc[group].push(link);
            return acc;
        }, {} as Record<string, typeof links>);
    }, [links]);
    return (
        <Sidebar>
            <HeaderSidebar />
            <ScrollArea>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarMenu>
                            <SidebarMenuItem key={"dashboard"}>
                                <SidebarMenuButton tooltip="Dashboard" isActive={pathname === "/"} size="sm" asChild>
                                    <Link to="/">
                                        <LayoutDashboardIcon />
                                        <span>Dashboard</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroup>
                    {Object.keys(groupedLinks).map(group => {
                        const groupLinks = groupedLinks[group];
                        return <SidebarGroup key={group}>
                            <SidebarGroupLabel>{capitalize(group)}</SidebarGroupLabel>
                            <SidebarMenu>
                                {groupLinks.map(link => {
                                    return <SidebarMenuItem key={link.id}>
                                        <SidebarMenuButton
                                            tooltip={capitalize(link.title)}
                                            isActive={pathname.includes(link.handler)}
                                            size="sm"
                                            className={cn(
                                                "select-none",
                                                !link.isActive
                                                    ? "opacity-30 pointer-events-none cursor-not-allowed"
                                                    : ""
                                            )} asChild>
                                            <Link to={link.handler}>
                                                <link.icon />
                                                <span className="capitalize">{link.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                })}
                            </SidebarMenu>
                        </SidebarGroup>
                    })}
                </SidebarContent>
            </ScrollArea>
            <FooterSidebar />
        </Sidebar>
    )
}

export default AppSidebar