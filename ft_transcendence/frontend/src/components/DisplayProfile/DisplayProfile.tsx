import "./DisplayProfile.css";
import type { PublicUserProfile } from "../../types/user.ts";

// define what component below receives as input (the props)
interface DisplayProfileProps
{
    user: PublicUserProfile;
}

export function DisplayProfile({ user }: DisplayProfileProps) {
    return (
        <section className="profile-page" aria-label="User profile">
            <header className="profile-page__hero">
                <div className="profile-page__avatar" aria-hidden="true">
                    U
                </div>

                <div className="profile-page__hero-content">
                    <p className="profile-page__eyebrow">Profile</p>
                    <h1 className="profile-page__name">{user.userName}</h1>
                    <p className="profile-page__email">{user.userEmail}</p>
                </div>
            </header>

            <div className="profile-page__grid">
                <section className="profile-page__panel">
                    <h2 className="profile-page__panel-title">About</h2>

                    <p className="profile-page__body"><strong>Email:</strong> {user.userEmail}</p>
                    <p className="profile-page__body"><strong>Contact:</strong> {user.userContact ?? "Not shared"}</p>
                    <p className="profile-page__body"><strong>Intra name:</strong> {user.intraName ?? "Not added"}</p>
                    <p className="profile-page__body">
                        <strong>Intra URL:</strong>{" "}
                        {user.intraUrl ? (
                            <a href={user.intraUrl} target="_blank" rel="noreferrer">
                                {user.intraUrl}
                            </a>
                        ) : (
                            "Not added"
                        )}
                    </p>
                </section>

            </div>
        </section>
    );

}