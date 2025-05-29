"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Smile } from "lucide-react";

interface ReactionPickerProps {
  onReactionSelect: (emoji: string) => void;
  onClose: () => void;
  position?: "top" | "bottom";
}

const AVAILABLE_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "😡"];

export function ReactionPicker({
  onReactionSelect,
  onClose,
  position = "top",
}: ReactionPickerProps) {
  const handleReactionClick = (emoji: string) => {
    onReactionSelect(emoji);
    onClose();
  };

  return (
    <div
      className={`absolute z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex space-x-1 ${
        position === "top" ? "bottom-full mb-2" : "top-full mt-2"
      } transform -translate-x-1/2 left-1/2`}
    >
      {AVAILABLE_REACTIONS.map((emoji) => (
        <Button
          key={emoji}
          variant="ghost"
          size="sm"
          className="p-2 hover:bg-gray-100 text-lg transition-transform hover:scale-110"
          onClick={() => handleReactionClick(emoji)}
        >
          {emoji}
        </Button>
      ))}
    </div>
  );
}

interface ReactionButtonProps {
  onReactionSelect: (emoji: string) => void;
  position?: "top" | "bottom";
}

export function ReactionButton({
  onReactionSelect,
  position = "top",
}: ReactionButtonProps) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="p-1 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-gray-100 rounded-full"
        onClick={() => setShowPicker(!showPicker)}
      >
        <Smile className="h-4 w-4 text-gray-500" />
      </Button>

      {showPicker && (
        <>
          <div
            className="fixed inset-0 z-5"
            onClick={() => setShowPicker(false)}
          />
          <ReactionPicker
            onReactionSelect={onReactionSelect}
            onClose={() => setShowPicker(false)}
            position={position}
          />
        </>
      )}
    </div>
  );
}
