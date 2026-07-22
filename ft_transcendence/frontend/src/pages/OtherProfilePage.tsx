import { useEffect, useState } from "react";
import { getUser } from "../services/user";
import { DisplayProfile } from "../components/DisplayProfile/DisplayProfile";
import type { InternalUserEntity } from "../types/user";
import { useParams } from "react-router-dom";

// this page will be opened when clickin on the user who created an eventcard
export function OtherProfilePage() {
    const { userId } = useParams(); // use useParam to get this profile's userid from the URL to fetch then all the data in getUser
    const [user, setUser] = useState<InternalUserEntity | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // only implemented for getUser input to work in case userId does not exist
        if (!userId) {
            setError("User ID does not exist");
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
        };

        fetchUser();
    }, [userId]);

    if (error) {
        return <p>{error}</p>;
    }

    if (!user) {
        return <p>Loading user...</p>;
    }

    return (
        <div>
            <DisplayProfile user={user} />
        </div>
    );
}
