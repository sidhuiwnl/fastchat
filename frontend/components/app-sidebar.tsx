import { Plus } from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/frontend/components/ui/sidebar";

// Mock session data grouped by date
const sessions = {
    today: [
        { id: 1, title: "Project Discussion" },
        { id: 2, title: "Marketing Strategy" }
    ],
    yesterday: [
        { id: 3, title: "Team Meeting" },
        { id: 4, title: "Client Feedback" }
    ],
    lastWeek: [
        { id: 5, title: "Product Roadmap" },
        { id: 6, title: "Q2 Planning" },
        { id: 7, title: "User Research" }
    ]
};

export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>FashChat</SidebarGroupLabel>

                    <SidebarMenuButton className="w-full mb-4 mt-5  border">
                        <div className="flex items-center justify-center gap-2  w-full px-4 py-2 rounded-md cursor-pointer  text-white transition-colors">
                            <Plus size={16} />
                            <span>New Chat</span>
                        </div>
                    </SidebarMenuButton>

                    <SidebarGroupContent>
                        <SidebarGroupLabel>Today</SidebarGroupLabel>
                        <SidebarMenu>
                            {sessions.today.map((session) => (
                                <SidebarMenuItem key={session.id}>
                                    <SidebarMenuButton asChild>
                                        <a href="#" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md">
                                            <span>{session.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>

                        {/* Yesterday's Sessions */}
                        <SidebarGroupLabel>Yesterday</SidebarGroupLabel>
                        <SidebarMenu>
                            {sessions.yesterday.map((session) => (
                                <SidebarMenuItem key={session.id}>
                                    <SidebarMenuButton asChild>
                                        <a href="#" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md">
                                            <span>{session.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>

                        {/* Last Week's Sessions */}
                        <SidebarGroupLabel>Last Week</SidebarGroupLabel>
                        <SidebarMenu>
                            {sessions.lastWeek.map((session) => (
                                <SidebarMenuItem key={session.id}>
                                    <SidebarMenuButton asChild>
                                        <a href="#" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800  rounded-md">
                                            <span>{session.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}