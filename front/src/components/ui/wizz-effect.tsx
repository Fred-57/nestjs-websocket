"use client";

import { useEffect, useState } from "react";

interface WizzEffectProps {
  isWizzing: boolean;
  children: React.ReactNode;
}

export function WizzEffect({ isWizzing, children }: WizzEffectProps) {
  const [animationClass, setAnimationClass] = useState("");

  useEffect(() => {
    if (isWizzing) {
      setAnimationClass("animate-wizz");

      // Arrêter l'animation après 2 secondes
      const timer = setTimeout(() => {
        setAnimationClass("");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isWizzing]);

  return (
    <div
      className={`${animationClass}`}
      style={{
        animation: isWizzing ? "wizz 0.1s ease-in-out infinite" : "none",
      }}
    >
      {children}

      {/* Styles CSS pour l'animation wizz */}
      <style jsx>{`
        @keyframes wizz {
          0% {
            transform: translateX(0px) translateY(0px);
          }
          10% {
            transform: translateX(-2px) translateY(-1px);
          }
          20% {
            transform: translateX(2px) translateY(1px);
          }
          30% {
            transform: translateX(-1px) translateY(-2px);
          }
          40% {
            transform: translateX(1px) translateY(2px);
          }
          50% {
            transform: translateX(-1px) translateY(-1px);
          }
          60% {
            transform: translateX(2px) translateY(-1px);
          }
          70% {
            transform: translateX(-2px) translateY(1px);
          }
          80% {
            transform: translateX(1px) translateY(-2px);
          }
          90% {
            transform: translateX(-1px) translateY(2px);
          }
          100% {
            transform: translateX(0px) translateY(0px);
          }
        }

        .animate-wizz {
          animation: wizz 0.1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
