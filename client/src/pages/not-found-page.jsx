import { useGSAP } from "@gsap/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import gsap from "gsap";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const containerRef = useRef(null);
  const titleText = "404 - The path you seek has vanished.";
  const subtitleText = "This page drifts in the void, where no words unfold.";

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".title-word", {
        y: 20,
        opacity: 0,
        filter: "blur(10px)",
        duration: 0.8,
        stagger: 0.05,
      })
        .from(
          ".subtitle-word",
          {
            y: 10,
            opacity: 0,
            filter: "blur(5px)",
            duration: 0.6,
            stagger: 0.02,
          },
          "-=0.6"
        )
        .from(
          ".cta-button",
          {
            scale: 0.9,
            opacity: 0,
            duration: 0.8,
            ease: "elastic.out(1, 0.6)",
          },
          "-=0.4"
        );
    },
    { scope: containerRef }
  );

  return (
    <div
      className="flex min-h-screen w-full flex-col items-center justify-center bg-background px-4 text-center"
      ref={containerRef}
    >
      <div className="flex max-w-lg flex-col items-center gap-6">
        <h1 className="flex flex-wrap justify-center gap-[0.25em] font-semibold text-2xl text-foreground tracking-tight sm:text-3xl">
          {titleText.split(" ").map((word, i) => (
            <span
              className="title-word inline-block will-change-transform"
              // biome-ignore lint/suspicious/noArrayIndexKey: Static text
              key={`${word}-${i}`}
            >
              {word}
            </span>
          ))}
        </h1>

        <div className="flex flex-wrap justify-center gap-[0.2em] text-muted-foreground text-sm sm:text-base">
          {subtitleText.split(" ").map((word, i) => (
            <span
              className="subtitle-word inline-block will-change-transform"
              // biome-ignore lint/suspicious/noArrayIndexKey: Static text
              key={`${word}-${i}`}
            >
              {word}
            </span>
          ))}
        </div>

        <div className="cta-button">
          <Button asChild className="rounded-full" size="sm" variant="outline">
            <Link to="/">
              <HugeiconsIcon
                className="mr-2"
                icon={ArrowLeft01Icon}
                size={16}
                strokeWidth={2}
              />
              Back to home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
