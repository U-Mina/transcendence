import { useFormStatus } from "react-dom"; // displays a pending state during form submission

function SubmitButton() {
    const { pending } = useFormStatus(); // tells button the status of the form (whether the form is currently being submitted/done or not yet) (1, 0 bool)

    let buttonText;

    if (pending) {
        buttonText = "Creating...";
    } else {
        buttonText = "Publish Event";
    }

    // return the button in either a pending form or ready form (will change the buttonText depending)
    return (
        <button type="submit" disabled={pending}>
            {buttonText}
        </button>
    );
}

// the data that CreateEventForm will receive (ft that runs when form submitted & error msg if there) // ...
type CreateEventFormProps = {
    handleCreateEvent: (formData: FormData) => void; // the input of ft & the output (returns nth)
    error: string | null;
};

// component for UI that builds the form w its fields
// form action tells browser what should happen when the form is submitted (call handleCreateEvent ft in CreateEventPage.tsx)
// TODO: creatorid later replaced from authentication (acting as manual standin for logged in user)
export function CreateEventForm({ handleCreateEvent, error }: CreateEventFormProps) {
    return (
        <section>
            <h1>Create Event</h1>

            <form action={handleCreateEvent}>

                <label>
                    Event name
                    <input name="eventName" required />
                </label>

                <label>
                    Start time
                    <input type="datetime-local" name="startTime" required />
                </label>

                <label>
                    End time
                    <input type="datetime-local" name="endTime" required />
                </label>

                <label>
                    Category
                    <input name="category" />
                </label>

                <label>
                    Description
                    <textarea name="description" />
                </label>

                <label>
                    Location
                    <input name="location" />
                </label>

                <label>
                    Minimum participants
                    <input type="number" name="minPaticipant" min="0" />
                </label>

                <SubmitButton />
            </form>

            {error ? <p>{error}</p> : null}
        </section>
    );
}
