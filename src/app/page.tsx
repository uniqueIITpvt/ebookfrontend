
import MediaContent from "@/components/ui/media/MediaContent";
import About from "@/components/ui/sections/About";
import CTA from "@/components/ui/sections/CTA";
import Hero from "@/components/ui/sections/Hero";
import TrustedBy from "@/components/ui/sections/TrustedBy";
// import ChatbotFeatures from "@/components/ui/sections/ChatbotFeatures";

export default function Home() {
  return (
    <div className='min-h-screen'>
      <div id='hero'>
        <Hero/>
      </div>

      <div id='media-content'>
        <MediaContent/>
      </div>

      {/* <div id='chatbot-features'>
        <ChatbotFeatures />
      </div> */}
      <div id='trusted-by'>
        <TrustedBy />
      </div>
      <div id='about'>
        <About />
      </div>
      <div id='cta'>
        <CTA />
      </div>
      {/* <SectionToggle /> */}
    </div>
  );
}
