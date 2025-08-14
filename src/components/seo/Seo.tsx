import { Helmet } from "react-helmet-async";

interface SeoProps {
  title: string;
  description?: string;
  canonical?: string;
}

const Seo = ({ title, description, canonical }: SeoProps) => {
  const siteTitle = title.length > 60 ? `${title.slice(0, 57)}...` : title;
  const desc = description ? description.slice(0, 160) : undefined;
  const canonicalUrl = canonical
    ? canonical.startsWith("http")
      ? canonical
      : typeof window !== "undefined"
        ? `${window.location.origin}${canonical}`
        : canonical
    : undefined;

  return (
    <Helmet>
      <title>{siteTitle}</title>
      {desc && <meta name="description" content={desc} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      <meta property="og:title" content={siteTitle} />
      {desc && <meta property="og:description" content={desc} />}
      <meta property="og:type" content="website" />
    </Helmet>
  );
};

export default Seo;
