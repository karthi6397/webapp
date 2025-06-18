import Image from "next/image";
import { CodeComparison } from "@/components/magicui/code-comparison";
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
    <>
    
    <div>
      <Button>Click me</Button>
    </div>
    <div className="flex items-center justify-center h-screen">
      <Image
        src="/logo.png"
        alt="Logo"
        width={150}
        height={150}
      />
    <Card className="max-w-sm">
  <CardHeader> 
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card Description</CardDescription>
    <CardAction>Card Action</CardAction>
  </CardHeader>
  <CardContent>
    <p>Card Content</p>
  </CardContent>
  <CardFooter>
    <p>Card Footer</p>
  </CardFooter>
</Card>
    
    </>
  );
}
