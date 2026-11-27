"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded border border-gray-600 px-2.5 py-1 text-xs font-medium text-gray-200 hover:bg-gray-800"
    >
      {copied ? "Copied!" : "Copy Reply"}
    </button>
  );
}