import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

const GUEST_CHAT_LIMIT = 5;
const GUEST_CHAT_COUNT_KEY = 'guestChatCount';

interface GuestChatLimit {
    guestChatCount: number;
    guestChatLimit: number;
    hasReachedLimit: boolean;
    incrementGuestChatCount: () => void;
    remainingMessages: number;
}

export function useGuestChatLimit(): GuestChatLimit {
    const { isSignedIn } = useUser();
    const [guestChatCount, setGuestChatCount] = useState(0);
    const [hasReachedLimit, setHasReachedLimit] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return; // Guard for SSR

        if (!isSignedIn) {
            const count = parseInt(localStorage.getItem(GUEST_CHAT_COUNT_KEY) || '0', 10);
            setGuestChatCount(count);
            setHasReachedLimit(count >= GUEST_CHAT_LIMIT);
        } else {
            // Clear guest chat count when user signs in
            localStorage.removeItem(GUEST_CHAT_COUNT_KEY);
            setGuestChatCount(0);
            setHasReachedLimit(false);
        }
    }, [isSignedIn, setGuestChatCount, setHasReachedLimit]);

    const incrementGuestChatCount = () => {
        if (isSignedIn) return;

        setGuestChatCount(prevCount => {
            const newCount = prevCount + 1;
            localStorage.setItem(GUEST_CHAT_COUNT_KEY, newCount.toString());

            if (newCount >= GUEST_CHAT_LIMIT) {
                setHasReachedLimit(true);
            }

            return newCount;
        });
    };

    return {
        guestChatCount,
        guestChatLimit: GUEST_CHAT_LIMIT,
        hasReachedLimit,
        incrementGuestChatCount,
        remainingMessages: Math.max(0, GUEST_CHAT_LIMIT - guestChatCount)
    };
}