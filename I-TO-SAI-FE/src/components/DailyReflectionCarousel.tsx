import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { questions } from "@/App";
import type { Dispatch, SetStateAction } from "react";

interface DailyReflectionCarouselProps {
    onSlideChange: Dispatch<SetStateAction<number>>;
}
export const DailyReflectionCarousel:React.FC<DailyReflectionCarouselProps> = ({onSlideChange}) => {
  return (
    <Carousel onSlideChange={onSlideChange} className="w-full max-w-xl mx-auto" >
      <CarouselContent>
        {questions.map((question, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card className="h-40">
                <CardContent className="flex items-center justify-center p-5">
                    <span className="text-lg font-semibold">{question}</span>
                </CardContent>
              </Card>
            </div>

          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}
