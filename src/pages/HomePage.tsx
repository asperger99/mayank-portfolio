import { Hero } from "../components/sections/Hero";
import { Metrics } from "../components/sections/Metrics";
import { Experience } from "../components/sections/Experience";
import { Projects } from "../components/sections/Projects";
import { SystemDesign } from "../components/sections/SystemDesign";
import { Skills } from "../components/sections/Skills";
import { Achievements } from "../components/sections/Achievements";
import { Contact } from "../components/sections/Contact";

export function HomePage() {
  return (
    <>
      <Hero />
      <Metrics />
      <Experience />
      <Projects />
      {/* <SystemDesign /> */}
      <Skills />
      <Achievements />
      <Contact />
    </>
  );
}
