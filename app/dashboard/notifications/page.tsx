"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Lock, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import WhatsAppLinkList from "@/components/dashboard/notifications/whatsapp-link-list";
import type { Class } from "@/db/schema";

interface WhatsAppLink {
  studentName: string;
  parentPhone: string | null;
  link: string;
  message: string;
}

interface NotificationHistory {
  id: string;
  title: string;
  message: string;
  type: string;
  sentVia: string;
  sentAt: string;
}

export default function NotificationsPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [whatsappLinks, setWhatsappLinks] = useState<WhatsAppLink[]>([]);
  const [linksDialogOpen, setLinksDialogOpen] = useState(false);
  const [history, setHistory] = useState<NotificationHistory[]>([]);

  const [form, setForm] = useState({
    title: "",
    message: "",
    targetType: "all" as "all" | "class" | "student",
    classId: "",
    studentId: "",
    sendVia: "whatsapp" as "whatsapp" | "email" | "both",
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [classRes, historyRes] = await Promise.all([
          fetch("/api/classes"),
          fetch("/api/notifications"),
        ]);

        if (historyRes.status === 403) {
          setIsLocked(true);
          return;
        }

        const classData = await classRes.json();
        const historyData = await historyRes.json();
        setClasses(classData.classes ?? []);
        setHistory(historyData.notifications ?? []);
      } catch {
        toast.error("Data load nahi ho saka");
      }
    }
    fetchData();
  }, []);

  async function handleGenerate() {
    if (!form.title || !form.message) {
      toast.error("Title aur message required hain");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          message: form.message,
          targetType: form.targetType,
          classId: form.classId || undefined,
          studentId: form.studentId || undefined,
          sendVia: form.sendVia,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error");

      setWhatsappLinks(data.whatsappLinks ?? []);
      setLinksDialogOpen(true);
      toast.success(
        `${data.totalTargeted} students targeted, ${data.whatsappLinks.length} WhatsApp links generated!`
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error");
    } finally {
      setIsGenerating(false);
    }
  }

  // Lock Screen
  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 gap-6">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            Notifications & WhatsApp Alerts
          </h2>
          <p className="text-gray-500 max-w-sm">
            Yeh feature Pro plan mein available hai.
          </p>
          <Button
            onClick={() =>
              (window.location.href = "/dashboard/settings/billing")
            }
          >
            Upgrade to Pro
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Notifications & WhatsApp Alerts
        </h1>
        <p className="text-sm text-gray-400 mt-1">Parents ko updates bhejo</p>
      </div>

      {/* Send Notification Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Notification Bhejo</h2>

        {/* Title */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Title*</label>
          <Input
            placeholder="Jaise: Fee Reminder - January"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
        </div>

        {/* Message */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Message*</label>
          <textarea
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={4}
            maxLength={1000}
            placeholder="Jaise: Dear Parents, January ki fee pending hai. Please jald payment karein."
            value={form.message}
            onChange={(e) =>
              setForm((f) => ({ ...f, message: e.target.value }))
            }
          />
          <p className="text-xs text-gray-400 text-right">
            {form.message.length}/1000
          </p>
        </div>

        {/* Target */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Target</label>
          <div className="flex gap-3 flex-wrap">
            {(["all", "class", "student"] as const).map((t) => (
              <button
                key={t}
                onClick={() =>
                  setForm((f) => ({ ...f, targetType: t }))
                }
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all capitalize ${
                  form.targetType === t
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {t === "all"
                  ? "All Students"
                  : t === "class"
                  ? "Specific Class"
                  : "Specific Student"}
              </button>
            ))}
          </div>

          {form.targetType === "class" && (
            <Select
              value={form.classId}
              onValueChange={(v) => setForm((f) => ({ ...f, classId: v }))}
            >
              <SelectTrigger className="w-52">
                <SelectValue placeholder="Class select karo" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name} {cls.section ? `(${cls.section})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Send Via */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Send Via</label>
          <Select
            value={form.sendVia}
            onValueChange={(v) =>
              setForm((f) => ({ ...f, sendVia: v as "whatsapp" | "email" | "both" }))
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="whatsapp">WhatsApp Links</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="both">Both</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="bg-[#25D366] hover:bg-[#20b858] text-white"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generate ho raha hai...
            </>
          ) : (
            <>
              <MessageSquare className="w-4 h-4 mr-2" />
              Generate WhatsApp Links
            </>
          )}
        </Button>
      </div>

      {/* Notification History */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Notification History</h2>
        </div>
        {history.length === 0 ? (
          <div className="flex items-center justify-center py-10 text-gray-400 text-sm">
            Koi notification nahi bheja gaya
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Sent Via</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((n) => (
                <TableRow key={n.id}>
                  <TableCell className="text-sm text-gray-400">
                    {new Date(n.sentAt).toLocaleDateString("en-PK")}
                  </TableCell>
                  <TableCell className="font-medium">{n.title}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        n.sentVia === "whatsapp"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }
                    >
                      {n.sentVia}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* WhatsApp Links Dialog */}
      <Dialog open={linksDialogOpen} onOpenChange={setLinksDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              WhatsApp Links ({whatsappLinks.length})
            </DialogTitle>
          </DialogHeader>
          <WhatsAppLinkList
            links={whatsappLinks}
            onClose={() => setLinksDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}