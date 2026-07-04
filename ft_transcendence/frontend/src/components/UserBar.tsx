import { useAuth } from "../context/AuthContext";

interface UserBarProps {
    onOpenLogin: () => void;
}

export function UserBar({ onOpenLogin }: UserBarProps) {
    const { userId, userName, clearUser } = useAuth();

    return (
        <div className="user-bar">
            {userId ? (
                <>
                    <span>
                        Signed in as <strong>{userName ?? userId}</strong>
                        <code className="user-bar__id">x-user: {userId}</code>
                    </span>
                    <button type="button" className="secondary" onClick={onOpenLogin}>
                        Switch user
                    </button>
                    <button type="button" className="ghost" onClick={clearUser}>
                        Sign out
                    </button>
                </>
            ) : (
                <>
                    <span className="user-bar__warning">
                        No user selected — mutating requests need an x-user header
                    </span>
                    <button type="button" onClick={onOpenLogin}>
                        Select / register user
                    </button>
                </>
            )}
        </div>
    );
}
