import { useNavigate } from "react-router-dom";
import { createUser } from "../services/user";
import { useState } from "react";
import type { CreateUserDTO } from "../types/user";
import { SignUpForm } from "../components/SignUp/SignUp";

/*
- use POST /users endpoint (to create a user from userName, userEmail, userContact?) (from services/user.ts)
- after signup, backend returns the created user
- redirect to LoginPage after (if success signup)
*/
/*
// create a form (name and email) TODO: password missing?
// get the input from the form (name, and email)
// put name and email into my createUser ft to send the input to backend to save
// redirect to login page
*/
function parseSignUpForm(formData: FormData) {
    const userName = String(formData.get("userName") ?? "").trim();
    const userEmail = String(formData.get("userEmail") ?? "").trim();
    // TODO: add userContact and/or password from object ??

    if (!userName) {
        throw new Error("Username is required.");
    }

    if (!/^[a-zA-Z0-9]+$/.test(userName)) {
        throw new Error("Username can only contain letters and numbers.");
    }

    if (!userEmail) {
        throw new Error("Email is required.");
    }

    // to require sth btw @ and .com (using a regular expression)
    const emailPattern = /^[^@\s]+@[^@\s]+\.com$/;
    if (!emailPattern.test(userEmail)) {
        throw new Error("Please enter a valid email address.");
    }

    // store in object CreateUserDTO
    const signUpInput: CreateUserDTO = {
        userName,
        userEmail,
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

    // create a form (name and email) TODO: password missing?
    async function handleSignUp(formData: FormData) {
        setError(null);
    
        try {
            const { signUpInput } = parseSignUpForm(formData);
            await createUser(signUpInput);
            navigate("/events"); // TODO: change to /login when that page exists
        } catch (submitError) { // catching all errors here from createUser ft (fetch, backend) & parsing
            setError(submitError instanceof Error ? submitError.message : "Something went wrong");
        }
    }

    // means: show signup form, and let it use this submit ft plus error state
    return (
        <SignUpForm handleSignUp={handleSignUp} error={error}/>
    )
}
