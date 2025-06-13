import { Plus, Trash2 } from "lucide-react";
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
import { getThreads, deleteThread } from "@/frontend/dexie/queries";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate } from "react-router";
import { useCallback } from "react";
import type {Thread} from "@/frontend/dexie/db";

export function AppSidebar() {
    const threads  = useLiveQuery<Thread[]>(() => getThreads());
    const navigate = useNavigate();

    const groupThreadsByDate = useCallback(() => {
        if (!threads) return { today: [], yesterday: [], last30Days: [] };

        const now = new Date();
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const last30Days = new Date(today);
        last30Days.setDate(last30Days.getDate() - 30);

        return {
            today: threads.filter(thread =>
                new Date(thread.lastMessageAt) >= today
            ),
            yesterday: threads.filter(thread =>
                new Date(thread.lastMessageAt) >= yesterday &&
                new Date(thread.lastMessageAt) < today
            ),
            last30Days: threads.filter(thread =>
                new Date(thread.lastMessageAt) >= last30Days &&
                new Date(thread.lastMessageAt) < yesterday
            )
        };
    }, [threads]);

    const groupedThreads = groupThreadsByDate();

    const handleDeleteThread = async (e: React.MouseEvent, threadId: string) => {
        e.stopPropagation();
        e.preventDefault();
        try {
            await deleteThread(threadId);
            // If currently viewing this thread, navigate away
            if (window.location.pathname.includes(threadId)) {
                navigate('/chat');
            }
        } catch (error) {
            console.error('Error deleting thread:', error);
        }
    };

    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>FashChat</SidebarGroupLabel>

                    <SidebarMenuButton
                        className="w-full mb-4 mt-5 border"
                        onClick={() => navigate('/chat')}
                    >
                        <div className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-md cursor-pointer text-white transition-colors">
                            <Plus size={16} />
                            <span>New Chat</span>
                        </div>
                    </SidebarMenuButton>

                    <SidebarGroupContent>
                        {groupedThreads.today.length > 0 && (
                            <>
                                <SidebarGroupLabel>Today</SidebarGroupLabel>
                                <SidebarMenu>
                                    {groupedThreads.today.map((thread) => (
                                        <SidebarMenuItem key={thread.id}>
                                            <SidebarMenuButton
                                                asChild
                                                onClick={() => navigate(`/chat/${thread.id}`)}
                                            >
                                                <div className="flex items-center justify-between gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md w-full">
                                                    <span className="truncate flex-1">{thread.title}</span>
                                                    <button
                                                        onClick={(e) => handleDeleteThread(e, thread.id)}
                                                        className="text-gray-500 hover:text-red-500 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-700"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </>
                        )}

                        {groupedThreads.yesterday.length > 0 && (
                            <>
                                <SidebarGroupLabel>Yesterday</SidebarGroupLabel>
                                <SidebarMenu>
                                    {groupedThreads.yesterday.map((thread) => (
                                        <SidebarMenuItem key={thread.id}>
                                            <SidebarMenuButton
                                                asChild
                                                onClick={() => navigate(`/chat/${thread.id}`)}
                                            >
                                                <div className="flex items-center justify-between gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md w-full">
                                                    <span className="truncate flex-1">{thread.title}</span>
                                                    <button
                                                        onClick={(e) => handleDeleteThread(e, thread.id)}
                                                        className="text-gray-500 hover:text-red-500 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-700"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </>
                        )}

                        {groupedThreads.last30Days.length > 0 && (
                            <>
                                <SidebarGroupLabel>Last 30 Days</SidebarGroupLabel>
                                <SidebarMenu>
                                    {groupedThreads.last30Days.map((thread) => (
                                        <SidebarMenuItem key={thread.id}>
                                            <SidebarMenuButton
                                                asChild
                                                onClick={() => navigate(`/chat/${thread.id}`)}
                                            >
                                                <div className="flex items-center justify-between gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md w-full">
                                                    <span className="truncate flex-1">{thread.title}</span>
                                                    <button
                                                        onClick={(e) => handleDeleteThread(e, thread.id)}
                                                        className="text-gray-500 hover:text-red-500 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-700"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </>
                        )}
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}