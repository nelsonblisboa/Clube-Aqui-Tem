import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    blocked_until: string | null;
}

interface UseRateLimitReturn {
    checkRateLimit: (identifier: string, action: string) => Promise<RateLimitResult>;
    resetRateLimit: (identifier: string, action: string) => Promise<boolean>;
    isBlocked: boolean;
    remainingAttempts: number;
    blockedUntil: Date | null;
}

export const useRateLimit = (): UseRateLimitReturn => {
    const [isBlocked, setIsBlocked] = useState(false);
    const [remainingAttempts, setRemainingAttempts] = useState(5);
    const [blockedUntil, setBlockedUntil] = useState<Date | null>(null);

    const checkRateLimit = useCallback(async (
        identifier: string,
        action: string,
        maxAttempts: number = 5,
        windowMinutes: number = 15
    ): Promise<RateLimitResult> => {
        try {
            const { data, error } = await supabase.rpc('check_rate_limit', {
                p_identifier: identifier,
                p_action: action,
                p_max_attempts: maxAttempts,
                p_window_minutes: windowMinutes
            });

            if (error) {
                console.error('Rate limit check error:', error);
                // Em caso de erro, permitir (fail-open)
                return { allowed: true, remaining: maxAttempts, blocked_until: null };
            }

            const result = data as RateLimitResult;

            setIsBlocked(!result.allowed);
            setRemainingAttempts(result.remaining);
            setBlockedUntil(result.blocked_until ? new Date(result.blocked_until) : null);

            return result;
        } catch (error) {
            console.error('Rate limit error:', error);
            return { allowed: true, remaining: maxAttempts, blocked_until: null };
        }
    }, []);

    const resetRateLimit = useCallback(async (
        identifier: string,
        action: string
    ): Promise<boolean> => {
        try {
            const { data, error } = await supabase.rpc('reset_rate_limit', {
                p_identifier: identifier,
                p_action: action
            });

            if (error) {
                console.error('Rate limit reset error:', error);
                return false;
            }

            setIsBlocked(false);
            setRemainingAttempts(5);
            setBlockedUntil(null);

            return data as boolean;
        } catch (error) {
            console.error('Rate limit reset error:', error);
            return false;
        }
    }, []);

    return {
        checkRateLimit,
        resetRateLimit,
        isBlocked,
        remainingAttempts,
        blockedUntil
    };
};
