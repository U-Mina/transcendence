import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthSession } from "../services/auth";
import { getUser, updateUser } from "../services/user";
import type { InternalUserEntity, UpdateUserDTO } from "../types/user";
import { EditProfileForm } from "../components/EditProfileForm/EditProfile";

// TODO: add avatar changing here too (once endpoint is implemented)
function parseEditProfileForm(formData: FormData) {
    const userName = String(formData.get("userName") ?? "").trim();
    const userContact = String(formData.get("userContact") ?? "").trim();

    if (!userName) {
        throw new Error("Username is required.");
    }

    if (!/^[a-zA-Z0-9]+$/.test(userName)) {
        throw new Error("Username can only contain letters and numbers.");
    }

    // TODO: add a check here for backend to make sure entered username is not taken by someone else yet


    if (userContact && !/^\d+$/.test(userContact)) {
        throw new Error("Phone number can only contain numbers.");
    }

    const updateInput: UpdateUserDTO = {
        userName,
        userContact: userContact || undefined,
    }

    return {
        updateInput,
    }
}

export function EditProfilePage() {
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<InternalUserEntity | null>(null); // bc getUser returns InternalUserEntity
    const navigate = useNavigate();

    const session = getAuthSession();
    const userId = session?.user.id;

    useEffect(() => {
        if (!userId) {
            setError("Please log in to edit your profile.");
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

    async function handleEditProfile(formData: FormData) {
        setError(null);

        if (!userId) {
            setError("Please log in to edit your profile.");
            return;
        }

        try {
            const { updateInput } = parseEditProfileForm(formData);
            await updateUser(userId, updateInput);
            navigate("/profile");
        }
        catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : "Something went wrong");
        }
    }

    if (error && !user) {
        return <p>{error}</p>;
    }

    if (!user) {
        return <p>Loading user...</p>;
    }

    return (
        <EditProfileForm user={user} handleEditProfile={handleEditProfile} error={error} />
    );
}