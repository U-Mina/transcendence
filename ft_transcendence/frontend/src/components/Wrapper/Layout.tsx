/*
add a shared page wrapper here for the website
(tab header, tab navigation)
- basically the same "frame" around each page (Event Page, Profile Page, Home Page)
*/

import "./Layout.css";
// import type { ReactNode } from "react";
import { Outlet } from "react-router-dom"; // outlet is a placeholder where react router renders matching child page

// TODO: when increasing/decreasing chrome site, the events don't move or barely do (after adding layout) -> if 3, the the third one should be on right, not middle
// TODO: when making website fullscreen, the layout should also adjust by going to the most far left/right side (not in middle still looking like a small website)
// TODO: move create button up a bit
// TODO: make one event from one side to the other side (instead of two events next to each other)
// TODO: research <NavLink> and implement for the sidebar buttons (instead of <button>)
export function Layout() {
	return (
		<div className="layout">
			<aside className="layout__sidebar">
				<div className="layout__brand">OurSiteName</div>

				<nav className="layout__nav" aria-label="Primary">
					<button className="layout__nav-item layout__nav-item--active" type="button">
						Home
					</button>
					<button className="layout__nav-item" type="button">
						Saved
					</button>
					<button className="layout__nav-item" type="button">
						Profile
					</button>
					<button className="layout__nav-item" type="button">
						Settings
					</button>
				</nav>

				<button className="layout__create-button" type="button">
					+ Create Event
				</button>
			</aside>

			<div className="layout__main">
				<header className="layout__topbar">
					<div className="layout__search-wrap">
						<input
							className="layout__search"
							type="search"
							placeholder="Search events..."
							aria-label="Search events"
						/>
					</div>
				</header>

				<main className="layout__content">
					<Outlet /> 
				</main>
			</div>
		</div>
	);
}