import { useRef, useState, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";

type Props = {
  name: string;
  accept?: string;
};

export function FileInput({ name, accept }: Props) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
  }

  return (
    <div className="custom-file-input-wrapper">
      <input
        ref={inputRef}
        name={name}
        type="file"
        accept={accept}
        onChange={handleChange}
        style={{ display: "none" }}
      />
      <button
        type="button"
        className="file-input-box"
        onClick={() => inputRef.current?.click()}
      >
        <span className="file-input-badge">{t("file.choose")}</span>
        <span className="file-input-text">
          {selectedFile ? selectedFile.name : t("file.no_file")}
        </span>
      </button>
    </div>
  );
}
