import { useTranslation } from "react-i18next";
import { EVENT_TAGS } from "../types/api";
import { Input } from "./Input";
import { Select } from "./Select";
import { SearchIcon } from "./Icon";

type Props = {
  query: string;
  tag: string;
  sort: string;
  pageSize: number;
  onQueryChange: (value: string) => void;
  onTagChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onPageSizeChange: (value: number) => void;
};

export function EventSearchToolbar({
  query,
  tag,
  sort,
  pageSize,
  onQueryChange,
  onTagChange,
  onSortChange,
  onPageSizeChange,
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
      <Select
        aria-label={t("toolbar.aria_sort")}
        value={sort}
        onChange={(event) => onSortChange(event.target.value)}
      >
        <option value="startTime:asc">{t("toolbar.sort.start_time_asc")}</option>
        <option value="startTime:desc">{t("toolbar.sort.start_time_desc")}</option>
        <option value="eventName:asc">{t("toolbar.sort.event_name_asc")}</option>
        <option value="eventName:desc">{t("toolbar.sort.event_name_desc")}</option>
      </Select>
      <Select
        aria-label={t("toolbar.aria_page_size")}
        value={pageSize}
        onChange={(event) => onPageSizeChange(Number(event.target.value))}
      >
        <option value={6}>{t("toolbar.page_size", { count: 6 })}</option>
        <option value={10}>{t("toolbar.page_size", { count: 10 })}</option>
        <option value={20}>{t("toolbar.page_size", { count: 20 })}</option>
      </Select>
    </div>
  );
}
