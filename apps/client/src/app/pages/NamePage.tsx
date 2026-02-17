import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { NameTrendChart } from "../components/NameTrendChart";
import {
  ArrowLeft,
  ArrowRight,
  Baby,
  Calendar,
  TrendingUp,
  Activity,
  Share2,
} from "lucide-react";
import { fetchNamePageData, type NamePageResponse } from "../data/nameApi";
import { toast } from "sonner";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { NameSearchBar } from "../components/NameSearchBar";

export function NamePage() {
  const { name } = useParams<{ name: string }>();
  const [pageData, setPageData] = useState<NamePageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const routeName = decodeURIComponent(name ?? "");
  const effectiveName = pageData?.name ?? routeName;

  const title = !name
    ? "Name Not Found | namearchive.org"
    : pageData
      ? `${pageData.name} name trend | namearchive.org`
      : isLoading
        ? `${routeName} | namearchive.org`
        : "Name Not Found | namearchive.org";

  const description = !name
    ? "We do not have records for this name yet. Explore other names in the archive."
    : pageData
      ? `Explore historical popularity trends for ${effectiveName} from 1900 to 2026 on namearchive.org.`
      : isLoading
        ? `Loading historical popularity trends for ${effectiveName} on namearchive.org.`
        : "We do not have records for this name yet. Explore other names in the archive.";

  useDocumentMeta(title, description);

  useEffect(() => {
    if (!name) {
      setPageData(null);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    fetchNamePageData(name)
      .then((payload) => {
        if (isMounted) {
          setPageData(payload);
        }
      })
      .catch(() => {
        if (isMounted) {
          setPageData(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [name]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-[#6b5d4f]" style={{ fontFamily: "Georgia, serif" }}>
          Loading name profile...
        </p>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center max-w-2xl bg-[#ebe4d1] border-2 border-[#d4b896] rounded-lg p-6 sm:p-10 shadow-lg">
          <h1
            className="text-2xl sm:text-4xl text-[#4a3f2f] mb-4"
            style={{ fontFamily: "Georgia, serif" }}
          >
            We don't have records for this name (yet...)
          </h1>
          <p
            className="text-[#6b5d4f] mb-6 leading-relaxed"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Some names appear in the archive only after we ingest new historical
            data. Try a nearby spelling, or browse the current collection while
            this one is waiting in line.
          </p>
          <Link
            to="/"
            className="inline-flex items-center rounded-md bg-[#8b6914] px-5 py-3 text-[#f5f1e8] hover:bg-[#755812] transition-colors"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Browse the Archive
          </Link>
        </div>
      </div>
    );
  }

  const currentData = pageData.data;
  const currentName = pageData.name;
  const previousName = pageData.previousName;
  const nextName = pageData.nextName;
  const peakData = currentData.reduce((max, item) =>
    item.count > max.count ? item : max,
  );
  const currentYear = currentData[currentData.length - 1];
  const startYear = currentData[0];

  async function copyCurrentLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Could not copy link");
    }
  }

  async function handleShare() {
    const shareTitle = `${currentName} name trend`;
    const shareText = `Explore historical popularity trends for ${currentName} on namearchive.org`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
      }
    }

    await copyCurrentLink();
  }

  return (
    <div>
      {/* Navigation */}
      <div className="border-b-2 border-[#d4b896] bg-[#ebe4d1]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#8b6914] hover:text-[#6b5914] transition-colors"
            style={{ fontFamily: "Georgia, serif" }}
          >
            <ArrowLeft className="size-5" />
            Back to Archives
          </Link>
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-2 rounded-md border border-[#c4a886] bg-[#f5f1e8] px-3 py-2 text-[#8b6914] hover:bg-[#e0d4bb] transition-colors"
            style={{ fontFamily: "Georgia, serif" }}
          >
            <Share2 className="size-4" />
            Share
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        {/* Name Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Baby className="size-8 sm:size-10 text-[#8b6914]" />
            <h1
              className="text-4xl sm:text-6xl break-words text-[#4a3f2f]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {currentName}
            </h1>
          </div>
          <p
            className="text-base sm:text-xl text-[#6b5d4f]"
            style={{ fontFamily: "Georgia, serif" }}
          >
            A historical popularity profile of babies named{" "}
            <strong>{currentName}</strong> from 1900 to 2026
          </p>
          <div className="mt-4 text-sm text-[#8b7355]">
            Peak year: {peakData.year} • Current level:{" "}
            {currentYear.percentage.toFixed(0)}% of peak
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#ebe4d1] border-2 border-[#d4b896] rounded-lg p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="size-6 text-[#8b6914]" />
              <h3
                className="text-lg text-[#6b5d4f]"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Highest Usage Year
              </h3>
            </div>
            <p
              className="text-4xl sm:text-5xl text-[#8b6914]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {peakData.year}
            </p>
            <p className="text-sm text-[#8b7355] mt-2">
              {peakData.count.toLocaleString()} babies
            </p>
          </div>

          <div className="bg-[#ebe4d1] border-2 border-[#d4b896] rounded-lg p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="size-6 text-[#8b6914]" />
              <h3
                className="text-lg text-[#6b5d4f]"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Current Level
              </h3>
            </div>
            <p
              className="text-4xl sm:text-5xl text-[#8b6914]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {currentYear.percentage.toFixed(0)}%
            </p>
            <p className="text-sm text-[#8b7355] mt-2">of peak popularity</p>
          </div>

          <div className="bg-[#ebe4d1] border-2 border-[#d4b896] rounded-lg p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <Activity className="size-6 text-[#8b6914]" />
              <h3
                className="text-lg text-[#6b5d4f]"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Net Change Since 1900
              </h3>
            </div>
            <p
              className="text-4xl sm:text-5xl text-[#8b6914]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {currentYear.percentage - startYear.percentage > 0 ? "+" : ""}
              {(currentYear.percentage - startYear.percentage).toFixed(0)}%
            </p>
            <p className="text-sm text-[#8b7355] mt-2">percentage points</p>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-[#ebe4d1] border-2 border-[#d4b896] rounded-lg p-8 shadow-lg">
          <h2
            className="text-2xl sm:text-3xl text-[#4a3f2f] mb-6 text-center"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Popularity Trend
          </h2>
          <div className="bg-[#f5f1e8] border border-[#d4b896] rounded-lg p-6">
            <NameTrendChart data={currentData} name={currentName} />
          </div>
          <p
            className="text-center text-[#8b7355] mt-6 text-sm"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Relative popularity shown as percentage of peak year • Data spans
            1900—2026
          </p>
        </div>

        {/* Interpretation */}
        <div className="mt-12 bg-[#e0d4bb] border-2 border-[#c4a886] rounded-lg p-8 shadow-lg">
          <h3
            className="text-xl sm:text-2xl text-[#4a3f2f] mb-4"
            style={{ fontFamily: "Georgia, serif" }}
          >
            How to Read This
          </h3>
          <p
            className="text-[#4a3f2f] leading-relaxed"
            style={{ fontFamily: "Georgia, serif" }}
          >
            This chart shows relative popularity for{" "}
            <span className="font-semibold">{currentName}</span> from 1900 to
            2026. The peak year ({peakData.year}) is set to 100%, and every
            other year is shown against that high point. That makes it easier to
            compare rise-and-fall patterns without population-size distortion.
          </p>
        </div>

        <div className="mt-10 mb-2 flex justify-center">
          <NameSearchBar />
        </div>

        {/* Adjacent Names Navigation */}
        <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {previousName ? (
            <Link
              to={`/n/${previousName}`}
              className="inline-flex w-full sm:w-auto justify-center items-center gap-2 rounded-lg border-2 border-[#d4b896] bg-[#ebe4d1] px-5 py-3 text-[#8b6914] hover:bg-[#e0d4bb] hover:border-[#c4a886] transition-all"
              style={{ fontFamily: "Georgia, serif" }}
            >
              <ArrowLeft className="size-4" />
              Back: {previousName}
            </Link>
          ) : (
            <div />
          )}

          {nextName ? (
            <Link
              to={`/n/${nextName}`}
              className="inline-flex w-full sm:w-auto justify-center items-center gap-2 rounded-lg border-2 border-[#d4b896] bg-[#ebe4d1] px-5 py-3 text-[#8b6914] hover:bg-[#e0d4bb] hover:border-[#c4a886] transition-all"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Next: {nextName}
              <ArrowRight className="size-4" />
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
}
