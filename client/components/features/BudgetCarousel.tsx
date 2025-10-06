"use client";

import { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";

import { BudgetCard } from "./BudgetCard";

import { Budget } from "@/hooks/useBudgets";

interface BudgetCarouselProps {
  budgets: Budget[];
  onBudgetClick: (budget: Budget) => void;
}

export function BudgetCarousel({
  budgets,
  onBudgetClick,
}: BudgetCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const cardWidth = 320; // 320px = w-80 + gap
  const maxIndex = Math.max(0, budgets.length - 1);

  const scrollToIndex = (index: number) => {
    if (!containerRef.current) return;

    const targetIndex = Math.max(0, Math.min(index, maxIndex));
    const scrollPosition = targetIndex * cardWidth;

    containerRef.current.scrollTo({
      left: scrollPosition,
      behavior: "smooth",
    });

    setCurrentIndex(targetIndex);
  };

  // Update current index based on which card is visible
  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const cards = Array.from(container.children);
            const index = cards.indexOf(entry.target);

            if (index !== -1) {
              setCurrentIndex(index);
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.5,
      },
    );

    Array.from(container.children).forEach((child) => {
      observer.observe(child);
    });

    return () => {
      observer.disconnect();
    };
  }, [budgets]);

  if (budgets.length === 0) {
    return (
      <div className="text-center py-8">
        <Icon
          className="mx-auto text-default-300 mb-3"
          icon="heroicons:document-text"
          width={48}
        />
        <p className="text-default-500">No hay presupuestos activos</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Carousel Container */}
      <div
        ref={containerRef}
        aria-label="Budget carousel"
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth"
        role="region"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {budgets.map((budget, _index) => (
          <div key={budget.id} className="flex-shrink-0 snap-start">
            <BudgetCard budget={budget} onClick={() => onBudgetClick(budget)} />
          </div>
        ))}
      </div>

      {/* Indicators */}
      {budgets.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {budgets.map((_, index) => (
            <button
              key={index}
              aria-label={`Go to budget ${index + 1}`}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? "bg-primary" : "bg-default-300"
              }`}
              type="button"
              onClick={() => scrollToIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
