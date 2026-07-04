import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import type { InternalUserEntity } from "../types/user";

const STORAGE_KEY = "transcendence-test-user-id";

interface AuthContextValue {
    userId: string | null;
    userName: string | null;
    setUser: (user: InternalUserEntity) => void;
    clearUser: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUserId(): string | null {
    return localStorage.getItem(STORAGE_KEY);
}

function readStoredUserName(): string | null {
    return localStorage.getItem(`${STORAGE_KEY}-name`);
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [userId, setUserId] = useState<string | null>(readStoredUserId);
    const [userName, setUserName] = useState<string | null>(readStoredUserName);

    const setUser = useCallback((user: InternalUserEntity) => {
        localStorage.setItem(STORAGE_KEY, user.id);
        localStorage.setItem(`${STORAGE_KEY}-name`, user.userName);
        setUserId(user.id);
        setUserName(user.userName);
    }, []);

    const clearUser = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(`${STORAGE_KEY}-name`);
        setUserId(null);
        setUserName(null);
    }, []);

    const value = useMemo(
        () => ({ userId, userName, setUser, clearUser }),
        [userId, userName, setUser, clearUser]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return ctx;
}
