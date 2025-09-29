"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@heroui/button";
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
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const scrollLeftRef = useRef<number>(0);

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

  const handlePrevious = () => {
    if (currentIndex > 0) {
      scrollToIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < maxIndex) {
      scrollToIndex(currentIndex + 1);
    }
  };

  // Touch/Mouse handlers for swipe functionality
  const handleStart = (clientX: number) => {
    setIsScrolling(true);
    startXRef.current = clientX;
    scrollLeftRef.current = containerRef.current?.scrollLeft || 0;
  };

  const handleMove = (clientX: number) => {
    if (!isScrolling || !containerRef.current) return;

    const x = clientX;
    const walk = (startXRef.current - x) * 2; // Multiply for faster scroll
    containerRef.current.scrollLeft = scrollLeftRef.current + walk;
  };

  const handleEnd = () => {
    if (!isScrolling || !containerRef.current) return;

    setIsScrolling(false);

    // Snap to nearest card
    const scrollLeft = containerRef.current.scrollLeft;
    const newIndex = Math.round(scrollLeft / cardWidth);
    scrollToIndex(newIndex);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Update current index on scroll (for manual scrolling)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (isScrolling) return; // Don't update during programmatic scrolling

      const scrollLeft = container.scrollLeft;
      const newIndex = Math.round(scrollLeft / cardWidth);
      setCurrentIndex(newIndex);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [cardWidth, isScrolling]);

  if (budgets.length === 0) {
    return (
      <div className="text-center py-8">
        <Icon
          icon="heroicons:document-text"
          className="mx-auto text-default-300 mb-3"
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
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {budgets.map((budget, index) => (
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
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? "bg-primary" : "bg-default-300"
              }`}
              onClick={() => scrollToIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
