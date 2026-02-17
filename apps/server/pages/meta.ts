import { CURRENT_OG_IMAGE_VERSION, resolveName } from "../og-images";

export interface PageMeta {
  title: string;
  description: string;
  ogImage: string | null;
}

function getRawNameFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/n\/([^/]+)\/?$/);
  if (!match) {
    return null;
  }

  return decodeURIComponent(match[1]);
}

export function getNameFromPath(pathname: string): string | null {
  const rawName = getRawNameFromPath(pathname);
  if (!rawName) {
    return null;
  }

  return resolveName(rawName);
}

export function isUnknownNamePath(pathname: string): boolean {
  const rawName = getRawNameFromPath(pathname);
  if (!rawName) {
    return false;
  }

  return resolveName(rawName) === null;
}

export function getPageMeta(pathname: string, origin: string): PageMeta {
  const canonicalName = getNameFromPath(pathname);

  if (canonicalName) {
    return {
      title: `${canonicalName} name trend | name archive`,
      description: `Explore historical popularity trends for ${canonicalName} from 1900 to 2026 on namearchive.org.`,
      ogImage: `${origin}/og/name/${encodeURIComponent(canonicalName)}.png?v=${CURRENT_OG_IMAGE_VERSION}`,
    };
  }

  if (isUnknownNamePath(pathname)) {
    return {
      title: "Name Not Found | name archive",
      description:
        "We do not have records for this name yet. Explore other names in the archive.",
      ogImage: null,
    };
  }

  if (pathname === "/about") {
    return {
      title: "About name archive",
      description:
        "Learn about name archive and its mission to make naming history easy to explore.",
      ogImage: null,
    };
  }

  return {
    title: "name archive",
    description:
      "Explore historical U.S. baby naming trends from 1900 to 2026 on namearchive.org.",
    ogImage: null,
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function renderHeadTags(
  pathname: string,
  origin: string,
  meta: PageMeta,
): string {
  const canonicalUrl = `${origin}${pathname}`;

  const tags = [
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:site_name" content="name archive" />`,
    '<meta property="og:type" content="website" />',
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
  ];

  if (meta.ogImage) {
    tags.push(`<meta property="og:image" content="${escapeHtml(meta.ogImage)}" />`);
    tags.push('<meta property="og:image:width" content="1200" />');
    tags.push('<meta property="og:image:height" content="630" />');
    tags.push(`<meta name="twitter:image" content="${escapeHtml(meta.ogImage)}" />`);
  }

  return tags.join("\n    ");
}
