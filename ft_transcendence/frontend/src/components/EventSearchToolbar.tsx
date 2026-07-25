import { useTranslation } from "react-i18next";
import { EVENT_TAGS } from "../types/api";
import { Input } from "./Input";
import { Select } from "./Select";
import { SearchIcon } from "./Icon";

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
      <Input
        aria-label={t("toolbar.aria_search")}
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder={t("toolbar.search_placeholder")}
        prefixIcon={<SearchIcon size={16} />}
      />
      <Select
        aria-label={t("toolbar.aria_filter_tag")}
        value={tag}
        onChange={(event) => onTagChange(event.target.value)}
      >
        <option value="all">{t("toolbar.all_tags")}</option>
        {EVENT_TAGS.map((item) => (
          <option key={item} value={item}>
            {t(`tags.${item}`)}
          </option>
        ))}
      </Select>
    </div>
  );
}
