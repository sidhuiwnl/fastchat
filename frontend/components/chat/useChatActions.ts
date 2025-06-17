import { useState } from 'react';
import {AI_MODELS} from "@/lib/model";
import {toast} from "sonner";
import {updateMessage} from "@/frontend/dexie/queries";

export function useChatActions() {
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [selectedModel, setSelectedModel] = useState<string>(AI_MODELS[3]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  const handleEdit = (messageId: string, content: string) => {
    setEditingMessageId(messageId);
    setEditedContent(content);
  };

  const handleSaveEdit = async (userId: string | undefined, threadId: string, messageId: string) => {
    try {
      if (!editedContent.trim()) {
        toast.error("Message cannot be empty");
        return false;
      }

      await updateMessage(userId, threadId, messageId, editedContent);
      setEditingMessageId(null);
      setEditedContent("")
      toast.success("Message updated");
      return true;
    } catch (error) {
      console.error('Error updating message:', error);
      toast.error("Failed to update message");
      return false;
    }
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
    selectedModel,
    setSelectedModel,
  };
}