'use client';


import {SidebarProvider,SidebarTrigger} from "./components/ui/sidebar";
import {AppSidebar} from "./components/app-sidebar";
import {Outlet} from "react-router";
import {Toaster} from "@/frontend/components/ui/sonner";

export default function ChatLayout() {
    return (
        <div className="w-screen h-screen  flex overflow-hidden">
            <SidebarProvider>
                <AppSidebar />
                <div className="flex-1 h-full flex flex-col">
                    <SidebarTrigger />
                    <main className="flex-1 h-full overflow-hidden">
                        <Outlet />
                    </main>
                </div>
            </SidebarProvider>
            <Toaster />
        </div>
    );
}
