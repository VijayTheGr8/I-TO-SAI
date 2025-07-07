import { statements, type Answer, type DayResponse } from "@/App"
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface PastResponseProps {
  dayResponse: DayResponse
}

export const PastResponse:React.FC<PastResponseProps> = ({ dayResponse }) => {
  const didNots: Answer[] = dayResponse.answers.filter(ans => !ans.answer)

  return (
      <AccordionItem
        value={`day-${dayResponse.dayIndex}`}
        className="overflow-hidden"
      >
        <AccordionTrigger className="w-full px-4 py-3 text-right font-semibold text-gray-800 hover:bg-gray-100 transition">
          Day {dayResponse.dayIndex}
        </AccordionTrigger>

        <AccordionContent className="bg-gray-50 px-4 pt-2 pb-4">
          {didNots.length > 0 ? (
            <>
              <p className="text-gray-700 font-medium mb-2">Did not:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                {didNots.map(ans => (
                  <li key={ans.questionNumber} className="ml-auto">
                    {statements[ans.questionNumber]}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-green-600 font-medium">
              You did everything this day.
            </p>
          )}
        </AccordionContent>
      </AccordionItem>
  )
}
