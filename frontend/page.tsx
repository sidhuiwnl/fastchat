import {BrowserRouter,Routes,Route} from "react-router";
import ChatLayout from "@/frontend/ChatLayout";
import Index from "@/frontend/routes/Index";
import Home from "@/frontend/routes/Home";
import Thread from "@/frontend/routes/Thread";

export  default function App(){
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Index/>} />
                <Route path="chat" element={<ChatLayout />} >
                    <Route index element={<Home />} />
                    <Route path=":id" element={<Thread />} />
                </Route>
                <Route path="*" element={<p> Not found </p>} />
            </Routes>
        </BrowserRouter>
    )
}