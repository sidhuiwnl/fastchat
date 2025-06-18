import APIKeyManager from '@/frontend/components/APIKeyForm';
import Chat from "@/frontend/components/chat";
import { v4 as uuidv4 } from 'uuid';
import { useAPIKeyStore } from '../stores/APIKeyStore';
import { useModelStore } from "@/frontend/stores/ModelStore";
import { useUser } from "@clerk/nextjs";
import HomeTemplate from "@/frontend/components/HomeTemplate";
import { useEffect, useState } from 'react';

const GUEST_USER_ID_KEY = 'guestUserId';

export default function Home() {
    const { isLoaded, isSignedIn, user } = useUser();
    const [userId, setUserId] = useState<string | null>(null);
    const [isHydrated, setIsHydrated] = useState(false);

    const hasRequiredKeys = useAPIKeyStore((state) => state.hasRequiredKeys());
    const isAPIKeysHydrated = useAPIKeyStore.persist?.hasHydrated();
    const isModelStoreHydrated = useModelStore.persist?.hasHydrated();


    useEffect(() => {
        if (!isLoaded) return;

        let id: string;
        if (isSignedIn && user) {
            id = user.id;
            localStorage.removeItem(GUEST_USER_ID_KEY);
        } else {
            id = localStorage.getItem(GUEST_USER_ID_KEY) || uuidv4();
            localStorage.setItem(GUEST_USER_ID_KEY, id);
        }

        setUserId(id);
    }, [isLoaded, isSignedIn, user]);


    useEffect(() => {
        if (isAPIKeysHydrated && isModelStoreHydrated && isLoaded) {
            setIsHydrated(true);
        }
    }, [isAPIKeysHydrated, isModelStoreHydrated, isLoaded]);

    if (!isHydrated) {

        return <div className="flex items-center justify-center w-full h-full">Loading...</div>;
    }

    if (!hasRequiredKeys) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-full max-w-3xl pt-10 pb-44 mx-auto">
                <APIKeyManager />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center w-full h-full">
            <HomeTemplate/>
            <Chat
                userId={userId!}
                threadId={uuidv4()}
                initialMessages={[]}
            />
        </div>
    );
}