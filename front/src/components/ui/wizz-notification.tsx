"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";

interface WizzNotificationProps {
  senderUsername: string;
  show: boolean;
  onComplete: () => void;
}

export function WizzNotification({
  senderUsername,
  show,
  onComplete,
}: WizzNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);

      // Faire disparaître la notification après 3 secondes
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onComplete, 300); // Attendre la fin de l'animation de sortie
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show && !isVisible) return null;

  return (
    <div
      className={`
        fixed top-4 left-1/2 transform -translate-x-1/2 z-50
        bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 shadow-lg
        flex items-center space-x-3 transition-all duration-300
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}
      `}
    >
      <Zap className="h-6 w-6 text-yellow-600 animate-bounce" />
      <div className="text-yellow-800 font-medium">
        <span className="font-bold">{senderUsername}</span> vous a envoyé un
        Wizz! ⚡
      </div>
    </div>
  );
}
