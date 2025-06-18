import {LogOut, Plus, X,Loader2} from "lucide-react";
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
import { useNavigate, useLocation } from "react-router";
import { useCallback } from "react";
import type { Thread } from "@/frontend/dexie/db";
import { SignedIn, SignedOut, UserButton, useUser,SignInButton} from "@clerk/nextjs";
import {useChat} from "@ai-sdk/react";


export function AppSidebar() {
    const navigate = useNavigate();

    const location = useLocation();
    const { user,isLoaded } = useUser();
    const { status } = useChat();

    const userId = isLoaded && user ? user.id : undefined;

    const threads = useLiveQuery<Thread[]>(() => {
        if (!userId) return [];
        return getThreads(userId);
    }, [userId]);



    const currentThreadId = location.pathname.split('/chat/')[1];

    const groupThreadsByDate = useCallback(() => {
        if (!threads) return { today: [], yesterday: [], last30Days: [] };

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

        return {
            today: threads.filter(t => new Date(t.lastMessageAt) >= today),
            yesterday: threads.filter(t => {
                const date = new Date(t.lastMessageAt);
                return date >= yesterday && date < today;
            }),
            last30Days: threads.filter(t => {
                const date = new Date(t.lastMessageAt);
                return date >= last30Days && date < yesterday;
            })
        };
    }, [threads]);

    const handleDeleteThread = async (e: React.MouseEvent, threadId: string) => {
        e.stopPropagation();
        e.preventDefault();
        try {
            await deleteThread(userId as string, threadId);
            if (window.location.pathname.includes(threadId)) {
                navigate('/chat');
            }
        } catch (error) {
            console.error('Error deleting thread:', error);
        }
    };

    const renderThreadGroup = (threads: Thread[], title: string) => {
        if (threads.length === 0) return null;

        return (
            <>
                <SidebarGroupLabel>{title}</SidebarGroupLabel>
                <SidebarMenu className="flex flex-col space-y-2">
                    {threads.map((thread) => (
                        <SidebarMenuItem key={thread.id}>
                            <SidebarMenuButton
                                asChild
                                onClick={() => navigate(`/chat/${thread.id}`)}
                                className="w-full"
                            >
                                <div className={`group flex items-center justify-between gap-2 px-4 py-2 rounded-md w-full ${
                                    currentThreadId === thread.id
                                        ? "bg-gray-200 dark:bg-neutral-700"
                                        : "hover:bg-gray-100 dark:hover:bg-neutral-800"
                                }`}>
                                    <span className="truncate flex-1">{thread.title}</span>
                                    <button
                                        onClick={(e) => handleDeleteThread(e, thread.id)}
                                        className="transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 text-white p-1 rounded-sm hover:bg-neutral-600 dark:hover:bg-neutral-600 transition-all duration-200 ease-out"
                                        disabled={status === "streaming"}
                                    >
                                        {status === "streaming" ? (
                                            <Loader2 size={14} className="animate-spin h-4 w-4" />
                                        ) : (
                                            <X size={14} />
                                        )}
                                    </button>

                                </div>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </>
        );
    };

    const groupedThreads = groupThreadsByDate();

    return (
        <Sidebar>
            <SidebarContent className="p-2">
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
                        {renderThreadGroup(groupedThreads.today, "Today")}
                        {renderThreadGroup(groupedThreads.yesterday, "Yesterday")}
                        {renderThreadGroup(groupedThreads.last30Days, "Last 30 Days")}
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SignedIn>
                <div className="p-4 border-t flex items-center gap-3">
                    <UserButton />
                    <h1>{user?.fullName}</h1>
                </div>
            </SignedIn>
            <SignedOut >
                <div className="p-4 border-t flex justify-center  cursor-pointer  items-center gap-1">
                    <LogOut className="w-4 h-4" />
                    <SignInButton forceRedirectUrl={"/chat"}   />
                </div>
            </SignedOut>
        </Sidebar>
    );
}