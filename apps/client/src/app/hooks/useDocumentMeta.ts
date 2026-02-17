import { useEffect } from "react";

function ensureDescriptionMetaTag(): HTMLMetaElement {
  let meta = document.querySelector(
    'meta[name="description"]',
  ) as HTMLMetaElement | null;

  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "description";
    document.head.appendChild(meta);
  }

  return meta;
}

export function useDocumentMeta(title: string, description: string) {
  useEffect(() => {
    document.title = title;
    ensureDescriptionMetaTag().content = description;
  }, [title, description]);
}
