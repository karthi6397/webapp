import Image from "next/image";
import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button";
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold mb-8">MagicUI</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Code Comparison</CardTitle>
            <CardDescription>Compare code snippets side by side.</CardDescription>
          </CardHeader>
          
        </Card>

        <Carousel className="w-full">
          <CarouselPrevious className="absolute left-0 top-1/2 transform -translate-y-1/2">
            Previous
          </CarouselPrevious>
          <CarouselNext className="absolute right-0 top-1/2 transform -translate-y-1/2">
            Next
          </CarouselNext>
          <CarouselContent>
            <CarouselItem>
              <Image src="/image1.jpg" alt="Image 1" width={500} height={300} />
            </CarouselItem>
            <CarouselItem>
              <Image src="/image2.jpg" alt="Image 2" width={500} height={300} />
            </CarouselItem>
          </CarouselContent>
        </Carousel>

        <Button>Click Me!</Button>
      </div>
    </main>
  );
}
