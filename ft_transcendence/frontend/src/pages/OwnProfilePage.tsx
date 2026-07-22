import { useEffect, useState } from "react";
import { deleteUser, getUser } from "../services/user";
import { clearAuthSession, getAuthSession } from "../services/auth";
import type { InternalUserEntity } from "../types/user";
import { DisplayProfile } from "../components/DisplayProfile/DisplayProfile";
import { useNavigate } from "react-router-dom";

// MAIN
// same as OtherProfilePage basically but with an edit button and delete acc function & button
// TODO: create EditProfilePage w Form
export function OwnProfilePage() {
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<InternalUserEntity | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const navigate = useNavigate();

    // get id of current logged-in user
    const session = getAuthSession();
    const userId = session?.user.id;

    // get all account information of logged-in user
    useEffect(() => {
        if (!userId) {
            setError("Error: need to be logged in");
            return;
        }

        const fetchUser = async () => {
            try {
                const data = await getUser(userId);
                setUser(data);
            }
            catch (error) {
                console.error("Error:", error);
                setError(error instanceof Error ? error.message : "Something went wrong");
            }
        }

        fetchUser();
    }, [userId]);

    // page includes 'delete' button for logged-in user
    async function handleDeleteAccount() {
        if (!userId || !window.confirm("Are you sure you want to delete your account? This cannot be undone.")) {
            return;
        }

        try {
            setIsDeleting(true);
            await deleteUser(userId); // my fetch ft
            clearAuthSession(); // logout user
            navigate("/signup", { replace: true });
        }
        catch (error) {
            console.error("Error:", error);
            setError(error instanceof Error ? error.message : "Something went wrong");
            setIsDeleting(false);
        }
    }

    if (error) {
        return <p>{error}</p>;
    }

    if (!user) {
        return <p>Loading user...</p>;
    }

    // edit button is added here and just navigates to edit profile page
    return (
        <div>
            <DisplayProfile user={user} />
            <div>
                <button type="button" onClick={() => navigate("/profile/edit")}>Edit account</button>
                <button type="button" onClick={handleDeleteAccount} disabled={isDeleting}>
                    {isDeleting ? "Deleting account..." : "Delete account"}
                </button>
            </div>
        </div>
    );
}