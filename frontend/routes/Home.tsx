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

    const hasRequiredKeys = useAPIKeyStore((state) => state.hasRequiredKeys());
    const isAPIKeysHydrated = useAPIKeyStore.persist?.hasHydrated();
    const isModelStoreHydrated = useModelStore.persist?.hasHydrated();

    useEffect(() => {
        if (!isLoaded) return;

        if (isSignedIn && user) {
            setUserId(user.id);

            localStorage.removeItem(GUEST_USER_ID_KEY);
        } else {

            let guestUserId = localStorage.getItem(GUEST_USER_ID_KEY);
            if (!guestUserId) {
                guestUserId = uuidv4();
                localStorage.setItem(GUEST_USER_ID_KEY, guestUserId);
            }
            setUserId(guestUserId);
        }
    }, [isLoaded, isSignedIn, user]);

    if (!isAPIKeysHydrated || !isModelStoreHydrated || !isLoaded || !userId) {
        return null;
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
                userId={userId}
                threadId={uuidv4()}
                initialMessages={[]}

            />
        </div>
    );
}