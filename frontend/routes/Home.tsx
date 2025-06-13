import { useNavigate } from 'react-router';
import APIKeyManager from '@/frontend/components/APIKeyForm';
import Chat from "@/frontend/components/chat";
import { v4 as uuidv4 } from 'uuid';
import { useAPIKeyStore } from '../stores/APIKeyStore';
import {useModelStore} from "@/frontend/stores/ModelStore";
import { useEffect } from 'react';


export default function Home() {
    const navigate = useNavigate();
    const hasRequiredKeys = useAPIKeyStore((state) => state.hasRequiredKeys());
    const isAPIKeysHydrated = useAPIKeyStore.persist?.hasHydrated();
    const isModelStoreHydrated = useModelStore.persist?.hasHydrated();

    // Generate a thread ID when the component mounts
    const threadId = uuidv4();

    // Navigate to the new thread when we have required keys
    useEffect(() => {
        if (hasRequiredKeys) {
            navigate(`/chat/${threadId}`);
        }
    }, [hasRequiredKeys, navigate, threadId]);

    if (!isAPIKeysHydrated || !isModelStoreHydrated) return null;

    if (!hasRequiredKeys)
        return (
            <div className="flex flex-col items-center justify-center w-full h-full max-w-3xl pt-10 pb-44 mx-auto">
                <APIKeyManager />
            </div>
        );

    return <Chat threadId={threadId} initialMessages={[]} />;
}