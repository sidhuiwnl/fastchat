'use client';

import Chat from '@/components/chat';
import {SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/app-sidebar";

export default function Page() {
    return (
        <div className="w-screen h-screen">
            <SidebarProvider>
                <AppSidebar/>
                <SidebarTrigger />
                <main className="w-full h-full ">
                    <Chat />
                </main>

            </SidebarProvider>

        </div>
    );
}
