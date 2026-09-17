import Hero from "@/components/home/Hero";
import YlaJourney from "@/components/home/YlaJourney";
import Pillars from "@/components/home/Pillars";
import ReadinessQuizBanner from "@/components/home/ReadinessQuizBanner";
import WhoWeServe from "@/components/home/WhoWeServe";
import FeaturedPrograms from "@/components/home/FeaturedPrograms";
import EventsPreview from "@/components/home/EventsPreview";
import Testimonials from "@/components/home/Testimonials";
import Partners from "@/components/home/Partners";

export default function Home() {
  return (
    <>
      <Hero />
      <Pillars />
      <ReadinessQuizBanner />
      <WhoWeServe />
      <YlaJourney />
      <FeaturedPrograms />
      <EventsPreview />
      <Testimonials />
      <Partners />
    </>
  );
}
