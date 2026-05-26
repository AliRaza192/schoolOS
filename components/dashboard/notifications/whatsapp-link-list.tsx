"use client";

import { useState } from "react";
import { ExternalLink, Copy, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface WhatsAppLink {
  studentName: string;
  parentPhone: string | null;
  link: string;
  message: string;
}

interface WhatsAppLinkListProps {
  links: WhatsAppLink[];
  onClose: () => void;
}

export default function WhatsAppLinkList({
  links,
  onClose,
}: WhatsAppLinkListProps) {
  const [opened, setOpened] = useState<Set<string>>(new Set());
  const [copiedAll, setCopiedAll] = useState(false);

  function handleOpen(link: WhatsAppLink) {
    window.open(link.link, "_blank");
    setOpened((prev) => new Set([...prev, link.studentName]));
  }

  function handleCopyAll() {
    const text = links
      .map((l) => `${l.studentName} (${l.parentPhone}):\n${l.link}`)
      .join("\n\n");
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    toast.success("Sab links copy ho gayi!");
    setTimeout(() => setCopiedAll(false), 2000);
  }

  function handleDownload() {
    const text = links
      .map((l) => `${l.studentName} (${l.parentPhone}):\n${l.link}\n`)
      .join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "whatsapp-links.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">
          <span className="font-semibold text-green-600">{opened.size}</span>/
          {links.length} links opened
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyAll}
            className="text-xs"
          >
            {copiedAll ? (
              <>
                <CheckCheck className="w-3 h-3 mr-1 text-green-600" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 mr-1" />
                Copy All
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="text-xs"
          >
            Download .txt
          </Button>
        </div>
      </div>

      {/* Links List */}
      <div className="max-h-96 overflow-y-auto space-y-2">
        {links.map((link) => {
          const isOpened = opened.has(link.studentName);
          return (
            <div
              key={link.studentName}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border transition-all",
                isOpened
                  ? "bg-green-50 border-green-200"
                  : "bg-white border-gray-200"
              )}
            >
              <div>
                <p className="font-medium text-sm text-gray-900">
                  {link.studentName}
                </p>
                <p className="text-xs text-gray-400">{link.parentPhone}</p>
              </div>
              <Button
                size="sm"
                className={cn(
                  "text-xs",
                  isOpened
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-[#25D366] hover:bg-[#20b858] text-white"
                )}
                onClick={() => handleOpen(link)}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                {isOpened ? "Opened ✓" : "Open WhatsApp"}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Tip */}
      <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
        💡 Tip: Har link manually click karke message bhejo. WhatsApp Business
        use karo faster messaging ke liye.
      </p>
    </div>
  );
}