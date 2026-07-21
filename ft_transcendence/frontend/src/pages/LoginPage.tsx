import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/auth";
import { useState } from "react";
import type { LoginUserDTO } from "../types/user";
import { LoginForm } from "../components/LoginForm/Login";

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
            
            // get accessToken, and user from result (user info needed to build ownprofilepage & knowing which user is currentuser & to show delete/edit buttons)
            // store token in localStorage (if want user to stay logged in after refresh/reopen until token expires)
            //  or store token in sessionStorage (if want to disappear when browser closes) (no)
            // TODO: put the two lines below in a saveAuthSession ft in auth.ts?
            localStorage.setItem("accessToken", result.accessToken);
            localStorage.setItem("user", JSON.stringify(result.user));

            navigate("/events");
        } catch (submitError) { // catching all errors here from loginUser ft (fetch, backend) & parsing
            setError(submitError instanceof Error ? submitError.message : "Something went wrong");
        }
    }

    // TODO: create component LoginForm
    return (
        <>
            <LoginForm handleLogin={handleLogin} error={error} />
        </>
    );
}
