import { useFormStatus } from "react-dom";

// TODO: this function appears a couple times in various components -> create as util once w string text as input (if time)
function SubmitButton() {
    const { pending } = useFormStatus(); // tells button the status of the form (whether the form is currently being submitted/done or not yet) (1, 0 bool)

    let buttonText;

    if (pending) {
        buttonText = "Creating account..."; // TODO: what to put here and will this even be used for the button showing
    } else {
        buttonText = "Login";
    }

    // return the button in either a pending form or ready form (will change the buttonText depending)
    return (
        <button type="submit" disabled={pending}>
            {buttonText}
        </button>
    );
}

type LoginFormProps = {
    handleLogin: (formData: FormData) => void; // the input of ft & the output (returns nth)
    error: string | null;
}

// type tells browser what kind of box it is (ex. for email, password, etc.)
export function LoginForm({ handleLogin, error }: LoginFormProps) {
    return (
        <section>
            <h1>Login</h1>

            <form action={handleLogin}>
                <label>
                    Email
                    <input type="email" name="email" required />
                </label>
                
                <label>
                    Password
                    <input type="password" name="password" required />
                </label>

                <SubmitButton />
            </form>

            {error ? <p>{error}</p> : null}
        </section>
    )
}
