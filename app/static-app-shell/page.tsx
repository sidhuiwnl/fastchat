"use client";

import dynamic from "next/dynamic";
import { useUser, RedirectToSignIn } from "@clerk/nextjs";
import { Card } from "@/frontend/components/ui/card";

const App = dynamic(() => import("@/frontend/page"), {
    ssr: false,
});


function LoadingCard() {
    return (
        <Card className="w-screen h-screen flex items-center justify-center p-6">
            <div className="flex items-center gap-3">

                <div className="animate-spin rounded-full h-12 w-12 border-t-4 " />


                <span>Redirecting to Chat...</span>
            </div>
        </Card>
    );
}

export default function HomePage() {
    const { isLoaded, isSignedIn } = useUser();

    if (!isLoaded) {
        return <LoadingCard />;
    }

    if (!isSignedIn) {
        return <RedirectToSignIn />;
    }

    return <App />;
}
