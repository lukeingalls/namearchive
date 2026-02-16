import { Link } from "react-router";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t-2 border-[#d4b896] bg-[#ebe4d1]">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p
          className="text-sm text-[#6b5d4f]"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Historical U.S. naming trends • namearchive.org
        </p>
        <div className="flex items-center gap-4 text-sm">
          <Link
            to="/"
            className="text-[#8b6914] hover:text-[#6b5914] transition-colors"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Home
          </Link>
          <Link
            to="/about"
            className="text-[#8b6914] hover:text-[#6b5914] transition-colors"
            style={{ fontFamily: "Georgia, serif" }}
          >
            About
          </Link>
        </div>
      </div>
    </footer>
  );
}
