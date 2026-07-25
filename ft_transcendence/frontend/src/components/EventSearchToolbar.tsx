import { EVENT_TAGS } from "../types/api";

type Props = {
  query: string;
  tag: string;
  onQueryChange: (value: string) => void;
  onTagChange: (value: string) => void;
};

export function EventSearchToolbar({
  query,
  tag,
  onQueryChange,
  onTagChange,
}: Props) {
  return (
    <div className="discovery-toolbar">
      <input
        aria-label="Search events"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search events, places, ideas…"
      />
      <select
        aria-label="Filter by tag"
        value={tag}
        onChange={(event) => onTagChange(event.target.value)}
      >
        <option value="all">All tags</option>
        {EVENT_TAGS.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  );
}
