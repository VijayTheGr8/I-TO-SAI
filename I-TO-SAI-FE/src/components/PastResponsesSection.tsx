import { useState } from "react";
import { Accordion } from "@radix-ui/react-accordion";
import { ChartColumnBig } from "lucide-react";
import type { DayResponse } from "@/App";
import { PastResponse } from "./PastResponse";

interface Props {
  pastResponses: DayResponse[];
}

export const PastResponsesSection = ({ pastResponses }: Props) => {
  const [visibleCount, setVisibleCount] = useState(10);

  const visibleResponses = pastResponses.slice(0, visibleCount);

  const handleShowMore = () => {
    setVisibleCount((c) => Math.min(c + 10, pastResponses.length));
  };

  const handleShowLess = () => {
    setVisibleCount(10);
  };

  return (
    <div className={`w-1/2 ${pastResponses.length === 0 ? "mr-40" : "mr-20"}`}>
      {pastResponses.length === 0 ? (
        <div className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-2xl shadow-lg p-8 mt-5 space-y-4 min-w-75">
          <ChartColumnBig className="h-12 w-12 text-yellow-500" />
          <h3 className="text-xl font-semibold text-gray-800">
            No Reflections Yet
          </h3>
          <p className="text-gray-600 text-center max-w-xs">
            Once you submit your first daily reflection, it’ll show up here.  
            Let’s get started!
          </p>
        </div>
      ) : (
        <>
          <Accordion
            type="single"
            collapsible
            className="w-full max-w-md min-w-55 [@media(min-width:1200px)]:mx-auto my-2 bg-white border border-gray-200 rounded-xl shadow font-sans"
          >
            {visibleResponses.map((dr) => (
              <PastResponse key={dr.dayIndex} dayResponse={dr} />
            ))}
          </Accordion>

          <div className="flex justify-center space-x-4 mt-4">
            {visibleCount < pastResponses.length && (
              <button
                onClick={handleShowMore}
                className="
                  px-4 py-2 font-semibold text-white rounded-xl 
                  bg-gradient-to-r from-yellow-400 to-yellow-500 
                  hover:from-yellow-500 hover:to-yellow-600 
                  transition-shadow shadow-md
                "
              >
                Show more
              </button>
            )}
            {visibleCount > 10 && (
              <button
                onClick={handleShowLess}
                className="
                  px-4 py-2 font-semibold text-white rounded-xl 
                  bg-gradient-to-r from-orange-400 to-orange-500 
                  hover:from-orange-500 hover:to-orange-600 
                  transition-shadow shadow-md
                "
              >
                Show less
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};
