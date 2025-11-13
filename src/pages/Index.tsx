import { useLayoutEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { AnimatedProductCard } from "@/components/AnimatedProductCard";
import { AnimatedText } from "@/components/AnimatedText";
import { PuzzleSlot } from "@/components/PuzzleSlot";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Shield } from "lucide-react";

const Index = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Refs to puzzle slots
  const slot1Ref = useRef<HTMLDivElement>(null);
  const slot2Ref = useRef<HTMLDivElement>(null);
  const slot3Ref = useRef<HTMLDivElement>(null);
  const slot4Ref = useRef<HTMLDivElement>(null);

  // Measure centers relative to viewport center
  const [targets, setTargets] = useState<{ x: number; y: number }[]>([
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ]);
  const [measured, setMeasured] = useState(false);

  useLayoutEffect(() => {
    const measure = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const center = (el: HTMLElement | null) => {
        if (!el) return { x: 0, y: 0 };
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2 - vw / 2, y: r.top + r.height / 2 - vh / 2 };
      };
      setTargets([
        center(slot1Ref.current),
        center(slot2Ref.current),
        center(slot3Ref.current),
        center(slot4Ref.current),
      ]);
      setMeasured(true);
    };
    requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Section backgrounds based on scroll
  const section1Opacity = useTransform(scrollYProgress, [0, 0.15, 0.25], [1, 1, 0]);
  const section2Opacity = useTransform(scrollYProgress, [0.15, 0.25, 0.4, 0.5], [0, 1, 1, 0]);
  const section3Opacity = useTransform(scrollYProgress, [0.4, 0.5, 0.65, 0.75], [0, 1, 1, 0]);
  const section4Opacity = useTransform(scrollYProgress, [0.65, 0.75, 1], [0, 1, 1]);

  return (
    <div ref={containerRef} className="relative min-h-[400vh]">
      {/* Animated Product Card */}
        {measured && (
          <AnimatedProductCard scrollProgress={scrollYProgress} targets={targets} />
        )}

      {/* Background layers for each section */}
      <motion.div
        className="fixed inset-0 bg-section1-bg"
        style={{ opacity: section1Opacity }}
      />
      <motion.div
        className="fixed inset-0 bg-section2-bg"
        style={{ opacity: section2Opacity }}
      />
      <motion.div
        className="fixed inset-0 bg-section3-bg"
        style={{ opacity: section3Opacity }}
      />
      <motion.div
        className="fixed inset-0 bg-section4-bg"
        style={{ opacity: section4Opacity }}
      />

      {/* Section 1: Hero Intro */}
      <section className="relative flex min-h-screen items-center justify-center px-6">
        <div className="container relative z-10 mx-auto">
          <AnimatedText
            scrollProgress={scrollYProgress}
            startProgress={0}
            endProgress={0.25}
            direction="up"
            className="mb-12 text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <h1 className="mb-6 bg-gradient-to-r from-section1-text to-neutral-600 bg-clip-text text-6xl font-bold tracking-tight text-transparent md:text-8xl">
                Elevate Your Space
              </h1>
              <p className="mx-auto max-w-2xl text-xl text-section1-text/80 md:text-2xl">
                Experience the Future of Design.
              </p>
            </motion.div>
          </AnimatedText>

          <div className="flex justify-center">
            <motion.div ref={slot1Ref}
              style={{
                opacity: useTransform(scrollYProgress, [0, 0.08, 0.2, 0.25], [0.3, 1, 1, 0]),
              }}
            >
              <PuzzleSlot
                isActive={true}
                accentColor="hsl(38 65% 55%)"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 2: Feature Highlight */}
      <section className="relative flex min-h-screen items-center px-6 md:px-20">
        <div className="container relative z-10 mx-auto">
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            <div className="order-2 flex justify-center md:order-1">
              <motion.div ref={slot2Ref}
                style={{
                  opacity: useTransform(scrollYProgress, [0.2, 0.25, 0.45, 0.5], [0, 1, 1, 0]),
                }}
              >
                <PuzzleSlot
                  isActive={true}
                  accentColor="hsl(217 91% 60%)"
                />
              </motion.div>
            </div>

            <AnimatedText
              scrollProgress={scrollYProgress}
              startProgress={0.25}
              endProgress={0.5}
              direction="right"
              className="order-1 md:order-2"
            >
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-section2-accent/10 px-4 py-2">
                  <Sparkles className="h-5 w-5 text-section2-accent" />
                  <span className="text-sm font-medium text-section2-accent">
                    Smart Technology
                  </span>
                </div>
                <h2 className="text-5xl font-bold text-section2-text md:text-6xl">
                  Smart & Minimal Interface
                </h2>
                <p className="text-lg text-section2-text/70 md:text-xl">
                  Every ornament is crafted with precision using advanced GRC
                  technology, ensuring durability meets timeless beauty.
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="inline-block rounded-full bg-section2-text/10 px-4 py-2 text-sm font-medium text-section2-text">
                    Premium Quality
                  </div>
                  <div className="inline-block rounded-full bg-section2-text/10 px-4 py-2 text-sm font-medium text-section2-text">
                    Lightweight Design
                  </div>
                  <div className="inline-block rounded-full bg-section2-text/10 px-4 py-2 text-sm font-medium text-section2-text">
                    Eco-Friendly
                  </div>
                </div>
              </div>
            </AnimatedText>
          </div>
        </div>
      </section>

      {/* Section 3: Deep Focus */}
      <section className="relative flex min-h-screen items-center px-6 md:px-20">
        <div className="container relative z-10 mx-auto">
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            <AnimatedText
              scrollProgress={scrollYProgress}
              startProgress={0.5}
              endProgress={0.75}
              direction="left"
            >
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-section3-accent/20 px-4 py-2">
                  <Zap className="h-5 w-5 text-section3-accent" />
                  <span className="text-sm font-medium text-section3-accent">
                    Precision Crafted
                  </span>
                </div>
                <h2 className="text-5xl font-bold text-section3-text md:text-6xl">
                  Precision in Every Pixel
                </h2>
                <p className="text-lg text-section3-text/80 md:text-xl">
                  From classical motifs to contemporary patterns, our GRC ornaments
                  transform walls into architectural masterpieces.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <Shield className="mt-1 h-5 w-5 flex-shrink-0 text-section3-accent" />
                    <div>
                      <div className="font-semibold text-section3-text">
                        Weather-resistant & Fire-proof
                      </div>
                      <div className="text-sm text-section3-text/70">
                        Built to last in any environment
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Shield className="mt-1 h-5 w-5 flex-shrink-0 text-section3-accent" />
                    <div>
                      <div className="font-semibold text-section3-text">
                        Easy Installation
                      </div>
                      <div className="text-sm text-section3-text/70">
                        Quick setup with minimal maintenance
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Shield className="mt-1 h-5 w-5 flex-shrink-0 text-section3-accent" />
                    <div>
                      <div className="font-semibold text-section3-text">
                        Customizable Designs
                      </div>
                      <div className="text-sm text-section3-text/70">
                        Tailored to your unique vision
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </AnimatedText>

            <div className="flex justify-center">
              <motion.div ref={slot3Ref}
                style={{
                  opacity: useTransform(scrollYProgress, [0.45, 0.5, 0.7, 0.75], [0, 1, 1, 0]),
                }}
              >
                <PuzzleSlot
                  isActive={true}
                  accentColor="hsl(280 60% 60%)"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: CTA */}
      <section className="relative flex min-h-screen items-center justify-center px-6">
        <div className="container relative z-10 mx-auto">
          <AnimatedText
            scrollProgress={scrollYProgress}
            startProgress={0.75}
            endProgress={1}
            direction="up"
            className="text-center"
          >
            <div className="space-y-8">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: false }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <h2 className="mb-6 text-6xl font-bold text-section4-text md:text-7xl">
                  Join the Revolution
                </h2>
                <p className="mx-auto mb-10 max-w-2xl text-xl text-section4-text/80">
                  Transform your space with premium GRC wall ornaments. Explore our
                  collection and bring architectural elegance to your project.
                </p>
              </motion.div>

              <div className="flex justify-center">
                <motion.div ref={slot4Ref}
                  style={{
                    opacity: useTransform(scrollYProgress, [0.7, 0.75, 0.9, 1.0], [0, 1, 1, 0]),
                  }}
                >
                  <PuzzleSlot
                    isActive={true}
                    accentColor="hsl(160 70% 55%)"
                  />
                </motion.div>
              </div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: false }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
              >
                <Button
                  size="lg"
                  className="group bg-section4-accent px-8 py-6 text-lg font-semibold text-section4-bg shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                >
                  Explore Collection
                  <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-section4-text/30 px-8 py-6 text-lg font-semibold text-section4-text hover:bg-section4-text/10"
                >
                  Contact Us
                </Button>
              </motion.div>
            </div>
          </AnimatedText>
        </div>
      </section>
    </div>
  );
};

export default Index;
