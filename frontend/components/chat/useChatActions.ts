import { useState } from 'react';

export function useChatActions() {
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // Optionally add a toast notification here
  };

  const handleEdit = (messageId: string, content: string) => {
    setEditingMessageId(messageId);
    setEditedContent(content);
  };

  const handleSaveEdit = (messageId: string) => {
    // Implement your edit save logic here
    console.log("Saved edit for message:", messageId, editedContent);
    setEditingMessageId(null);
    // Optionally update the message in your chat state here
  };

  return {
    hoveredMessageId,
    setHoveredMessageId,
    editingMessageId,
    setEditingMessageId,
    editedContent,
    setEditedContent,
    handleCopy,
    handleEdit,
    handleSaveEdit,
  };
} 