import { useFormStatus } from "react-dom";
import type { InternalUserEntity } from "../../types/user";

function SubmitButton() {
    const { pending } = useFormStatus();

    let buttonText;

    if (pending) {
        buttonText = "Saving changes...";
    } else {
        buttonText = "Save changes";
    }

    return (
        <button type="submit" disabled={pending}>
            {buttonText}
        </button>
    );
}

type EditProfileFormProps = {
    user: InternalUserEntity;
    handleEditProfile: (formData: FormData) => void;
    error: string | null;
}

// TODO: add avatar here 
export function EditProfileForm({ user, handleEditProfile, error }: EditProfileFormProps) {
    return (
        <section>
            <h1>Edit Profile</h1>

            <form action={handleEditProfile}>
                <label>
                    Username
                    <input name="userName" defaultValue={user.userName} required />
                </label>

                <label>
                    Contact
                    <input name="userContact" defaultValue={user.userContact ?? ""} />
                </label>

                <SubmitButton />
            </form>

            {error ? <p>{error}</p> : null}
        </section>
    );
}
