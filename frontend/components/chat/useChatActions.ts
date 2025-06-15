import { useState } from 'react';
import {AI_MODELS} from "@/lib/model";
import {toast} from "sonner";


export function useChatActions() {
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const[selectedModel, setSelectedModel] = useState<string>(AI_MODELS[3]);

  const handleCopy = (text: string) => {

    navigator.clipboard.writeText(text);
    toast.success("Copied!");
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
        selectedModel,
        setSelectedModel,
  };
} 