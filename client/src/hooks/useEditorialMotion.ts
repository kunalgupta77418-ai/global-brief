import { useEffect, useState } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useEditorialMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [activeSection, setActiveSection] = useState(1);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setReducedMotion(media.matches);
    syncPreference();
    media.addEventListener("change", syncPreference);
    return () => media.removeEventListener("change", syncPreference);
  }, []);

  useEffect(() => {
    const progress = document.querySelector<HTMLElement>("[data-scroll-progress]");
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-section-index]"));
    const context = gsap.context(() => {
      const triggers: ScrollTrigger[] = [];
      if (progress) {
        triggers.push(ScrollTrigger.create({
          trigger: "#landing-page",
          start: "top top",
          end: "bottom bottom",
          onUpdate: self => gsap.set(progress, { scaleX: self.progress }),
        }));
      }
      const updateSectionIndex = () => {
        const threshold = window.innerHeight * .46;
        const scrollPosition = window.scrollY + threshold;
        let current = 1;
        sections.forEach((section, index) => {
          const top = section.getBoundingClientRect().top + window.scrollY;
          if (scrollPosition >= top) current = index + 1;
        });
        setActiveSection(current);
      };
      if (sections.length) {
        triggers.push(ScrollTrigger.create({
          trigger: "#landing-page",
          start: "top top",
          end: "bottom bottom",
          onUpdate: updateSectionIndex,
        }));
      }
      if (!reducedMotion) {
        gsap.utils.toArray<HTMLElement>("[data-context-card]").forEach((card, index) => {
          const direction = index % 2 === 0 ? -1 : 1;
          gsap.fromTo(card,
            { opacity: 0, x: direction * 80, y: index % 3 === 0 ? 36 : -20, rotate: direction * 2 },
            {
              opacity: 1,
              x: 0,
              y: 0,
              rotate: 0,
              ease: "none",
              scrollTrigger: { trigger: card.closest("[data-section-index]"), start: "top 68%", end: "top 22%", scrub: 1 },
            },
          );
        });
      } else if (progress) {
        gsap.set(progress, { scaleX: 1 });
      }
      ScrollTrigger.refresh();
      updateSectionIndex();
      return () => triggers.forEach(trigger => trigger.kill());
    });
    return () => context.revert();
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;
    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      syncTouch: false,
      autoRaf: false,
    });
    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);
    const magneticButtons = Array.from(document.querySelectorAll<HTMLElement>("[data-magnetic]"));
    const cleanups = magneticButtons.map(button => {
      const move = (event: PointerEvent) => {
        const rect = button.getBoundingClientRect();
        const x = Math.max(-6, Math.min(6, (event.clientX - (rect.left + rect.width / 2)) * 0.16));
        const y = Math.max(-6, Math.min(6, (event.clientY - (rect.top + rect.height / 2)) * 0.16));
        gsap.to(button, { x, y, duration: 0.28, ease: "power3.out", overwrite: true });
      };
      const reset = () => gsap.to(button, { x: 0, y: 0, duration: 0.42, ease: "power3.out", overwrite: true });
      button.addEventListener("pointermove", move);
      button.addEventListener("pointerleave", reset);
      return () => {
        button.removeEventListener("pointermove", move);
        button.removeEventListener("pointerleave", reset);
        gsap.set(button, { clearProps: "transform" });
      };
    });
    return () => {
      cleanups.forEach(cleanup => cleanup());
      gsap.ticker.remove(onTick);
      lenis.destroy();
    };
  }, [reducedMotion]);

  return { reducedMotion, activeSection };
}
