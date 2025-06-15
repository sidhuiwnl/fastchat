"use client";

import dynamic from "next/dynamic";
import { useUser,RedirectToSignIn } from "@clerk/nextjs";

const App = dynamic(() => import("@/frontend/page"),{
    ssr: false,
})

export  default function Home(){
    const { user } = useUser();
   
    if (!user) {
        return <RedirectToSignIn />;
    }
    return <App />;
}