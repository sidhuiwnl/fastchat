import APIKeyForm from "@/frontend/components/APIKeyForm";

export default function APIKeysPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <h1 className="text-2xl font-bold mb-6">Manage API Keys</h1>
      <APIKeyForm />
    </div>
  );
} 