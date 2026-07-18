import { useEffect } from "react";
import { getUser } from "../services/user";

// MAIN
// TODO: current issue is that I need the userid from the login
//  -> can only be properly done when auth/session is done from backend & possibly returns me the login userid
export function CreateOwnProfilePage() {

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getUser(); // need userid as input
                setUser(data);
            }

        }
        fetchProfile();
    }, []);


    // use getUser ft fetch here


}

// TODO: the page will include an edit & delete button as well. 
// w edit it should show a new page of the profile but in edit version (so as a FORM to submit)
// this will then navigate to profile page back again
// therefore create EditProfilePage
