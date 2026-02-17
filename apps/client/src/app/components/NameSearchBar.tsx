import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";
import { Search } from "lucide-react";
import { fetchNames } from "../data/nameApi";

function canonicalMatch(names: string[], query: string): string | null {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  return names.find((name) => name.toLowerCase() === normalized) ?? null;
}

export function NameSearchBar() {
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [names, setNames] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    let isMounted = true;
    fetchNames()
      .then((fetchedNames) => {
        if (isMounted) {
          setNames(fetchedNames);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const options = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return names.slice(0, 8);
    }

    return names
      .filter((name) => name.toLowerCase().includes(normalized))
      .slice(0, 8);
  }, [names, query]);

  useEffect(() => {
    if (!isFocused || !rootRef.current) {
      return;
    }

    function updateMenuPosition() {
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }

      const viewportPadding = 12;
      const preferredMenuHeight = 280;
      const spaceBelow = window.innerHeight - rect.bottom - viewportPadding;
      const spaceAbove = rect.top - viewportPadding;
      const openAbove = spaceBelow < 180 && spaceAbove > spaceBelow;
      const maxHeight = Math.max(
        120,
        Math.min(preferredMenuHeight, openAbove ? spaceAbove - 8 : spaceBelow - 8),
      );

      setMenuStyle({
        position: "fixed",
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        zIndex: 60,
        maxHeight: `${maxHeight}px`,
        top: openAbove ? `${rect.top - 8}px` : `${rect.bottom + 8}px`,
        transform: openAbove ? "translateY(-100%)" : undefined,
      });
    }

    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [isFocused, query, options.length]);

  function goToName(value: string) {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }

    const exactName = canonicalMatch(names, trimmed);
    const target = exactName ?? trimmed;
    navigate(`/n/${encodeURIComponent(target)}`);
    setIsFocused(false);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    goToName(query);
  }

  return (
    <div ref={rootRef} className="relative w-full max-w-lg">
      <form onSubmit={onSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8b7355]" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setTimeout(() => setIsFocused(false), 120);
          }}
          placeholder="Search names..."
          className="w-full rounded-md border-2 border-[#d4b896] bg-[#ebe4d1] pl-10 pr-3 py-2 text-[#4a3f2f] outline-none focus:border-[#8b6914]"
          style={{ fontFamily: "Georgia, serif" }}
        />
      </form>

      {isFocused &&
        options.length > 0 &&
        createPortal(
          <div
            className="rounded-md border-2 border-[#d4b896] bg-[#f5f1e8] shadow-lg overflow-auto"
            style={menuStyle}
          >
            {options.map((name) => (
              <button
                key={name}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  setQuery(name);
                  goToName(name);
                }}
                className="block w-full text-left px-3 py-2 text-[#4a3f2f] hover:bg-[#e8ddc4] transition-colors"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {name}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
