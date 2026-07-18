import { useFormStatus } from "react-dom";

// TODO: this function appears a couple times in various components -> create as util once w string text as input (if time)
function SubmitButton() {
    const { pending } = useFormStatus(); // tells button the status of the form (whether the form is currently being submitted/done or not yet) (1, 0 bool)

    let buttonText;

    if (pending) {
        buttonText = "Creating account...";
    } else {
        buttonText = "Sign Up";
    }

    // return the button in either a pending form or ready form (will change the buttonText depending)
    return (
        <button type="submit" disabled={pending}>
            {buttonText}
        </button>
    );
}

type SignUpFormProps = {
    handleSignUp: (formData: FormData) => void; // the input of ft & the output (returns nth)
    error: string | null;
}

export function SignUpForm({ handleSignUp, error }: SignUpFormProps) {
    return (
        <section>
            <h1>Sign Up</h1>

            <form action={handleSignUp}>
                <label>
                    Username
                    <input name="userName" required />
                </label>

                <label>
                    Email
                    <input type="email" name="userEmail" required />
                </label>

                <SubmitButton />
            </form>

            {error ? <p>{error}</p> : null}
        </section>
    )
}