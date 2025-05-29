"use client";

import { Button } from "@/components/ui/button";
import { Reaction } from "@/lib/api";

interface MessageReactionsProps {
  reactions: Reaction[];
  currentUserId: string;
  onAddReaction: (emoji: string) => void;
  onRemoveReaction: (emoji: string) => void;
}

export function MessageReactions({
  reactions,
  currentUserId,
  onAddReaction,
  onRemoveReaction,
}: MessageReactionsProps) {
  // Grouper les réactions par emoji
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = {
        emoji: reaction.emoji,
        count: 0,
        users: [],
        userHasReacted: false,
      };
    }
    acc[reaction.emoji].count++;
    acc[reaction.emoji].users.push(reaction.user);
    if (reaction.user.id === currentUserId) {
      acc[reaction.emoji].userHasReacted = true;
    }
    return acc;
  }, {} as Record<string, { emoji: string; count: number; users: any[]; userHasReacted: boolean }>);

  const reactionGroups = Object.values(groupedReactions);

  if (reactionGroups.length === 0) {
    return null;
  }

  const handleReactionClick = (emoji: string, userHasReacted: boolean) => {
    if (userHasReacted) {
      onRemoveReaction(emoji);
    } else {
      onAddReaction(emoji);
    }
  };

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {reactionGroups.map((group) => (
        <Button
          key={group.emoji}
          variant={group.userHasReacted ? "default" : "outline"}
          size="sm"
          className={`px-2 py-1 h-auto text-xs flex items-center space-x-1 ${
            group.userHasReacted
              ? "bg-blue-100 text-blue-700 border-blue-200"
              : "bg-gray-50 text-gray-700 border-gray-200"
          }`}
          onClick={() => handleReactionClick(group.emoji, group.userHasReacted)}
          title={`${group.users
            .map((u) => u.username)
            .join(", ")} ont réagi avec ${group.emoji}`}
        >
          <span>{group.emoji}</span>
          <span>{group.count}</span>
        </Button>
      ))}
    </div>
  );
}
