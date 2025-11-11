import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AnimatedProductCard } from "@/components/AnimatedProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Index = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrolled = window.scrollY;
      const progress = scrolled / documentHeight;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fadeInVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <div className="relative min-h-[400vh] bg-background">
      <AnimatedProductCard scrollProgress={scrollProgress} />

      {/* Section 1: Hero Intro */}
      <section className="relative flex min-h-screen items-center justify-center px-6">
        <motion.div
          className="text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInVariants}
        >
          <h1 className="mb-6 text-6xl font-bold tracking-tight text-foreground md:text-8xl">
            Elevate Your Space
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground md:text-2xl">
            Experience the Future of Design.
          </p>
        </motion.div>
      </section>

      {/* Section 2: Feature Highlight */}
      <section className="relative flex min-h-screen items-center justify-end px-6 md:px-20">
        <motion.div
          className="max-w-xl text-right"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInVariants}
        >
          <h2 className="mb-4 text-5xl font-bold text-foreground md:text-6xl">
            Smart & Minimal Interface
          </h2>
          <p className="mb-6 text-lg text-muted-foreground md:text-xl">
            Every ornament is crafted with precision using advanced GRC technology,
            ensuring durability meets timeless beauty.
          </p>
          <div className="flex justify-end gap-3">
            <div className="inline-block rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground">
              Premium Quality
            </div>
            <div className="inline-block rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground">
              Lightweight
            </div>
          </div>
        </motion.div>
      </section>

      {/* Section 3: Deep Focus */}
      <section className="relative flex min-h-screen items-center justify-start px-6 md:px-20">
        <motion.div
          className="max-w-xl"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInVariants}
        >
          <h2 className="mb-4 text-5xl font-bold text-foreground md:text-6xl">
            Precision in Every Pixel
          </h2>
          <p className="mb-6 text-lg text-muted-foreground md:text-xl">
            From classical motifs to contemporary patterns, our GRC ornaments
            transform walls into architectural masterpieces.
          </p>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-center gap-3">
              <div className="h-1.5 w-1.5 rounded-full bg-accent"></div>
              <span>Weather-resistant & fire-proof</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="h-1.5 w-1.5 rounded-full bg-accent"></div>
              <span>Easy installation & maintenance</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="h-1.5 w-1.5 rounded-full bg-accent"></div>
              <span>Customizable designs & finishes</span>
            </li>
          </ul>
        </motion.div>
      </section>

      {/* Section 4: CTA */}
      <section className="relative flex min-h-screen items-center justify-center px-6">
        <motion.div
          className="text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInVariants}
        >
          <h2 className="mb-6 text-6xl font-bold text-foreground md:text-7xl">
            Join the Revolution
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-xl text-muted-foreground">
            Transform your space with premium GRC wall ornaments. Explore our
            collection and bring architectural elegance to your project.
          </p>
          <Button
            size="lg"
            className="group bg-gradient-to-r from-accent to-[hsl(42_70%_60%)] px-8 py-6 text-lg font-semibold text-accent-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          >
            Explore Collection
            <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </section>
    </div>
  );
};

export default Index;
