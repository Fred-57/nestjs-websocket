"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

interface WizzButtonProps {
  onWizzSend: () => void;
  disabled?: boolean;
}

export function WizzButton({ onWizzSend, disabled = false }: WizzButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleWizzClick = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    try {
      await onWizzSend();
    } finally {
      // Petit délai pour éviter le spam
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={`
        relative overflow-hidden transition-all duration-200 border-2
        ${
          isLoading
            ? "bg-yellow-100 border-yellow-400 text-yellow-700"
            : "hover:bg-yellow-50 hover:border-yellow-300 border-gray-300"
        }
      `}
      onClick={handleWizzClick}
      disabled={disabled || isLoading}
    >
      <Zap
        className={`h-4 w-4 mr-2 transition-transform duration-200 ${
          isLoading ? "animate-bounce text-yellow-600" : ""
        }`}
      />
      {isLoading ? "Wizz envoyé!" : "🪄 Wizz"}
    </Button>
  );
}
