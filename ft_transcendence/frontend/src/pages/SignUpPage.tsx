import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/auth";
import { useState } from "react";
import type { RegisterUserDTO } from "../types/user";
import { SignUpForm } from "../components/SignUpForm/SignUp";

/*
- use POST /users endpoint (to create a user from userName, email, userContact?) (from services/user.ts)
- after signup, backend returns the created user
- redirect to LoginPage after (if success signup)
*/
/*
// create a form (name, email, pw)
// get the input from the form (name, and email)
// put name and email into my createUser ft to send the input to backend to save
// redirect to login page
*/
function parseSignUpForm(formData: FormData) {
    const userName = String(formData.get("userName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    // parsing username // TODO: add a check for backend to make sure username doesnt exist yet
    if (!userName) {
        throw new Error("Username is required.");
    }

    if (!/^[a-zA-Z0-9]+$/.test(userName)) {
        throw new Error("Username can only contain letters and numbers.");
    }

    // parsing email
    if (!email) {
        throw new Error("Email is required.");
    }

    // to require sth btw @ and .com (using a regular expression)
    const emailPattern = /^[^@\s]+@[^@\s]+\.com$/;
    if (!emailPattern.test(email)) {
        throw new Error("Please enter a valid email address.");
    }

    // parsing password (according to backend)
    if (!password) {
        throw new Error("Password is required.");
    }

    if (password.length < 8) {
        throw new Error("Password must be at least 8 characters long.");
    }

    if (password.length > 72) {
        throw new Error("Password must be 72 characters or fewer.");
    }

    // store in object signUpInput w shape RegisterUserDTO
    const signUpInput: RegisterUserDTO = {
        userName,
        email,
        password,
    }

    // return object
    return {
        signUpInput,
    }
}

// MAIN
export function SignUpPage() {
    const navigate = useNavigate(); // to move to login page later, if signup was success
    const [error, setError] = useState<string | null>(null);

    // create a form (name and email)
    async function handleSignUp(formData: FormData) {
        setError(null);
    
        try {
            const { signUpInput } = parseSignUpForm(formData);
            await registerUser(signUpInput);
            navigate("/login");
        } catch (submitError) { // catching all errors here from registerUser ft (fetch, backend) & parsing
            setError(submitError instanceof Error ? submitError.message : "Something went wrong");
        }
    }

    // means: show signup form, and let it use this submit ft plus error state
    // and show any submission error
    return (
        <SignUpForm handleSignUp={handleSignUp} error={error} />
    );
}
