import { Link } from "react-router";
import { Baby, BookOpen, Database, LineChart } from "lucide-react";

export function AboutPage() {
  return (
    <div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="text-center mb-12">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-4">
            <Baby className="size-8 sm:size-10 text-[#8b6914]" />
            <h1
              className="text-3xl sm:text-5xl leading-tight break-words text-[#4a3f2f]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              About namearchive.org
            </h1>
          </div>
          <p
            className="text-base sm:text-lg text-[#6b5d4f]"
            style={{ fontFamily: "Georgia, serif" }}
          >
            A public record of how names rise, fall, and return across
            generations.
          </p>
        </div>

        <div className="bg-[#ebe4d1] border-2 border-[#d4b896] rounded-lg p-6 sm:p-8 shadow-lg mb-8">
          <h2
            className="text-xl sm:text-2xl text-[#4a3f2f] mb-4"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Mission
          </h2>
          <p
            className="text-[#4a3f2f] leading-relaxed mb-4"
            style={{ fontFamily: "Georgia, serif" }}
          >
            namearchive.org exists to make naming history easy to explore. Names
            reflect culture, migration, media, family traditions, and broader
            social change. This project helps people compare those shifts over
            time using clear visuals and simple historical context.
          </p>
          <p
            className="text-[#4a3f2f] leading-relaxed"
            style={{ fontFamily: "Georgia, serif" }}
          >
            The site is designed for parents, researchers, writers, and anyone
            curious about long-term naming patterns in the United States.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#ebe4d1] border-2 border-[#d4b896] rounded-lg p-6 shadow-lg">
            <BookOpen className="size-6 text-[#8b6914] mb-3" />
            <h3
              className="text-lg sm:text-xl text-[#4a3f2f] mb-2"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Historical Lens
            </h3>
            <p
              className="text-[#6b5d4f]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Browse naming trends across more than a century to see when names
              first surged and when they declined.
            </p>
          </div>
          <div className="bg-[#ebe4d1] border-2 border-[#d4b896] rounded-lg p-6 shadow-lg">
            <LineChart className="size-6 text-[#8b6914] mb-3" />
            <h3
              className="text-lg sm:text-xl text-[#4a3f2f] mb-2"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Relative Trends
            </h3>
            <p
              className="text-[#6b5d4f]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Charts are normalized to each name's peak year so the trajectory
              is easy to compare over time.
            </p>
          </div>
          <div className="bg-[#ebe4d1] border-2 border-[#d4b896] rounded-lg p-6 shadow-lg">
            <Database className="size-6 text-[#8b6914] mb-3" />
            <h3
              className="text-lg sm:text-xl text-[#4a3f2f] mb-2"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Data Access
            </h3>
            <p
              className="text-[#6b5d4f]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              name archive focuses on transparent, readable trend data so
              visitors can understand patterns quickly.
            </p>
          </div>
        </div>

        <div className="bg-[#e0d4bb] border-2 border-[#c4a886] rounded-lg p-6 sm:p-8 shadow-lg">
          <h2
            className="text-xl sm:text-2xl text-[#4a3f2f] mb-4"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Explore the Archive
          </h2>
          <p
            className="text-[#4a3f2f] leading-relaxed mb-6"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Start with the homepage to browse names and open any record for a
            detailed trend view.
          </p>
          <Link
            to="/"
            className="inline-flex items-center rounded-md bg-[#8b6914] px-5 py-3 text-[#f5f1e8] hover:bg-[#755812] transition-colors"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
