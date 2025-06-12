"use client";

import dynamic from "next/dynamic";

const App = dynamic(() => import("@/frontend/page"),{
    ssr: false,
})

export  default function Home(){
    return <App />;
}