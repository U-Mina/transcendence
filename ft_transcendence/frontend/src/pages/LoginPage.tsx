import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/auth";
import { useState } from "react";
import type { LoginUserDTO } from "../types/user";
import { LoginForm } from "../components/LoginForm/Login";
import { saveAuthSession } from "../services/auth";

// does the entered email and pw match w an already registered / stored user in the backend/db?
// if yes, continue. if no, throw error (login failed: email does not exist, entered pw wrong, ...)
function parseLoginForm(formData: FormData) {
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    // TODO: check here if email & pw match w one of registered users in backend (else throw errors)


    const loginInput: LoginUserDTO = {
        email,
        password,
    }

    return {
        loginInput,
    }
}

// MAIN
export function LoginPage() {
    const navigate = useNavigate(); // to move to event page later, if login was success
    const [error, setError] = useState<string | null>(null);

     async function handleLogin(formData: FormData) {
        setError(null);

        try {
            const { loginInput } = parseLoginForm(formData);
            // result returns accesstoken, id, useremail in result
            const result = await loginUser(loginInput); 
            // localStorage (browser web storage api) stores token&userinfo in browser for refresh/reopening tab
            saveAuthSession(result.accessToken, result.user);
            navigate("/events");
        } catch (submitError) { // catching all errors here from loginUser ft (fetch, backend) & parsing
            setError(submitError instanceof Error ? submitError.message : "Something went wrong");
        }
    }

    return (
        <>
            <LoginForm handleLogin={handleLogin} error={error} />
        </>
    );
}
