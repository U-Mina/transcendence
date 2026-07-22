/*
add a shared page wrapper here for the website
(tab header, tab navigation)
- basically the same "frame" around each page (Event Page, Profile Page, Home Page)
*/

import "./Layout.css";
// import type { ReactNode } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom"; // outlet is a placeholder where react router renders matching child page
import { clearAuthSession, getAuthSession } from "../../services/auth";

// TODO: when increasing/decreasing chrome site, the events don't move or barely do (after adding layout) -> if 3, the the third one should be on right, not middle
// TODO: when making website fullscreen, the layout should also adjust by going to the most far left/right side (not in middle still looking like a small website)
// TODO: move create button up a bit
// TODO: make one event from one side to the other side (instead of two events next to each other)
// TODO: research <NavLink> and implement for the sidebar buttons (instead of <button>)
// TODO: change placeholder links for most of nav bar to their actual sites when they are created
export function Layout() {
	const authSession = getAuthSession();
	const user = authSession?.user;
	const navigate = useNavigate();

	function handleLogout() {
		clearAuthSession();
		navigate("/login", { replace: true });
	}

	return (
		<div className="layout">
			<aside className="layout__sidebar">
				<div className="layout__brand">OurSiteName</div>

				<nav className="layout__nav" aria-label="Primary">
					<Link className="layout__nav-item" to="/events">
						Home
					</Link>
					<Link className="layout__nav-item" to="/events">
						Joined
					</Link>
					<Link className="layout__nav-item" to="/events">
						Saved
					</Link>
					<Link className="layout__nav-item" to="/events">
						Created
					</Link>
					<Link className="layout__nav-item" to="/profile">
						Profile
					</Link>
				</nav>

				<Link className="layout__create-button" to="/create">
					+ Create Event
				</Link>
			</aside>

			<div className="layout__main">
				<header className="layout__topbar" style={{ display: "flex", justifyContent: "flex-end" }}>
					{user ? (
						<div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
							<button type="button" onClick={handleLogout}>Log out</button>
							<Link
								to="/profile"
								aria-label="View your profile"
								style={{ display: "block", width: "40px", height: "40px", borderRadius: "50%", background: "#4f46e5" }}
							/>
						</div>
					) : (
						<div style={{ display: "flex", gap: "10px" }}>
							<Link to="/signup">Sign Up</Link>
							<Link to="/login">Log In</Link>
						</div>
					)}
				</header>

				<main className="layout__content">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
