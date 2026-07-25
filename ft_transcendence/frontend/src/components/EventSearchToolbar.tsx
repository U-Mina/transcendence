import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  return (
    <div className="discovery-toolbar">
      <input
        aria-label="Search events"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder={t("toolbar.search_placeholder")}
      />
      <select
        aria-label="Filter by tag"
        value={tag}
        onChange={(event) => onTagChange(event.target.value)}
      >
        <option value="all">{t("toolbar.all_tags")}</option>
        {EVENT_TAGS.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  );
}
