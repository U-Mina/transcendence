import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createEvent } from "../services/events";
import type { CreateEventDTO } from "../types/event";
import { CreateEventForm } from "../components/CreateEventForm/CreateEvent";

function parseCreateEventForm(formData: FormData) {
    // get the value of each form field by reading from formData
    const eventName = String(formData.get("eventName") ?? "").trim();
    const startTimeValue = String(formData.get("startTime") ?? "");
    const endTimeValue = String(formData.get("endTime") ?? "");
    const category = String(formData.get("category") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const location = String(formData.get("location") ?? "").trim();
    const minParticipantValue = String(formData.get("minPaticipant") ?? "").trim();

    if (!eventName || !startTimeValue || !endTimeValue) {
        throw new Error("Creator ID, event name, start time, and end time are required.");
    }

    const startTime = new Date(startTimeValue); // TODO: again, write conversion ft helper
    const endTime = new Date(endTimeValue);

    if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
        throw new Error("Please enter valid start and end times.");
    }

    if (endTime <= startTime) {
        throw new Error("End time must be after start time.");
    }

    // undefined since field can be left empty by user
    const eventInput: CreateEventDTO = {
        eventName,
        startTime,
        endTime,
        category: category || undefined,
        description: description || undefined,
        location: location || undefined,
        minPaticipant: minParticipantValue ? Number(minParticipantValue) : undefined,
    };

    if (minParticipantValue && Number.isNaN(eventInput.minPaticipant ?? Number.NaN)) {
        throw new Error("Minimum participants must be a number.");
    }

    return {
        eventInput,
    }
}


// MAIN 
// https://react.dev/reference/react-dom/components/form
// TODO: when entering sth wrong in the form and pressing publish, entire form is cleared -> shouldnt be!
//      -> possibly change the form submitting thru a normal handler w a local pending state instead of react form-action 
export function CreateEventPage() {
    const navigate = useNavigate(); // lets page move to another route after success (form filled out) -> /events (EventsPage)
    const [error, setError] = useState<string | null>(null); // for parsing when entering information in form

    async function handleCreateEvent(formData: FormData) { // w formData React gives me the form data directly
        setError(null);

        try {
            const { eventInput } = parseCreateEventForm(formData);
            await createEvent(eventInput); // send event to backend w fetch ft createEvent
            navigate("/events");
        } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : "Something went wrong");
        }
    }

    // returns a description of what the page should look like (only responsible for what the user sees)
    // passing two inputs into component CreateEventForm
    // means: show createevent form, and let it use this submit ft plus error state
    return (
        <CreateEventForm handleCreateEvent={handleCreateEvent} error={error}/>
    );
}

// TODO: file upload for a pic needs to be added in all those (coming from backend first)
