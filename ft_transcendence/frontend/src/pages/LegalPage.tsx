import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

type LegalSection = {
  heading: string;
  paragraphs: string[];
};

type Props = {
  document: "privacy" | "terms";
};

export function LegalPage({ document }: Props) {
  const { t } = useTranslation();
  const base = `legal.${document}` as const;
  const sections = t(`${base}.sections`, {
    returnObjects: true,
  }) as LegalSection[];

  return (
    <section className="page narrow legal-page">
      <header className="legal-header">
        <p className="eyebrow">{t("legal.eyebrow")}</p>
        <h1>{t(`${base}.title`)}</h1>
        <p className="muted">{t("legal.last_updated")}</p>
      </header>

      <article className="legal-doc panel">
        <p>{t(`${base}.intro`)}</p>
        {Array.isArray(sections) &&
          sections.map((section) => (
            <section key={section.heading} className="legal-section">
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph, index) => (
                <p key={`${section.heading}-${index}`}>{paragraph}</p>
              ))}
            </section>
          ))}
      </article>

      <p className="legal-switch muted">
        {document === "privacy" ? (
          <>
            {t("legal.see_also")}{" "}
            <Link to="/terms">{t("legal.terms_label")}</Link>
          </>
        ) : (
          <>
            {t("legal.see_also")}{" "}
            <Link to="/privacy">{t("legal.privacy_label")}</Link>
          </>
        )}
      </p>
    </section>
  );
}
