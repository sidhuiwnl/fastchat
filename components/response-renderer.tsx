import { marked } from "marked"

export function MarkedRenderer({ content }: { content: string }) {
  const html = marked(content); 

  return (
    <div
      className="prose text-gray-300"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
