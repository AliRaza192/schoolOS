"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Lock, Plus, Users, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import LinkParentDialog from "@/components/dashboard/parents/link-parent-dialog";

interface ParentLink {
  id: string;
  createdAt: string;
  parent: {
    id: string;
    name: string;
    email: string;
  };
  student: {
    id: string;
    name: string;
    phone: string | null;
    class: { name: string; section: string | null } | null;
  };
}

export default function ParentsPage() {
  const [links, setLinks] = useState<ParentLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function fetchLinks() {
    try {
      const res = await fetch("/api/parent/link");
      if (res.status === 403) {
        setIsLocked(true);
        return;
      }
      const data = await res.json();
      setLinks(data.links ?? []);
    } catch {
      toast.error("Data load nahi ho saka");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchLinks();
  }, []);

  const studentsWithParents = new Set(links.map((l) => l.student.id)).size;
  const totalStudentsApprox = links.length;

  // Lock Screen
  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 gap-6">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Parent Portal</h2>
          <p className="text-gray-500 max-w-sm">
            Parent Portal Pro plan mein available hai. Upgrade karo aur parents
            ko unke bachon ki progress se connect karo.
          </p>
        </div>

        {/* Blurred Preview */}
        <div className="relative w-full max-w-2xl">
          <div className="blur-sm pointer-events-none">
            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 bg-gray-200 rounded w-32" />
                    <div className="h-2 bg-gray-100 rounded w-24" />
                  </div>
                  <div className="h-6 bg-green-100 rounded w-20" />
                </div>
              ))}
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              onClick={() =>
                (window.location.href = "/dashboard/settings/billing")
              }
              className="shadow-lg"
            >
              Upgrade to Pro
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Parent Portal</h1>
          <p className="text-sm text-gray-400 mt-1">
            Parents ko students se link karo
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Parent Link Karo
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{links.length}</p>
            <p className="text-xs text-gray-400">Total Links</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{studentsWithParents}</p>
            <p className="text-xs text-gray-400">Students with Parents</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
            <UserX className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">—</p>
            <p className="text-xs text-gray-400">Without Parents</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : links.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Users className="w-10 h-10 text-gray-300" />
            <p className="text-gray-500">Abhi koi parent link nahi.</p>
            <p className="text-gray-400 text-sm">
              &apos;Parent Link Karo&apos; button se shuru karo.
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              Parent Link Karo
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parent Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Linked Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Linked Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((link) => (
                <TableRow key={link.id}>
                  <TableCell className="font-medium">
                    {link.parent.name}
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm">
                    {link.parent.email}
                  </TableCell>
                  <TableCell>{link.student.name}</TableCell>
                  <TableCell>
                    {link.student.class
                      ? `${link.student.class.name}${link.student.class.section ? ` (${link.student.class.section})` : ""}`
                      : "—"}
                  </TableCell>
                  <TableCell>{link.student.phone ?? "—"}</TableCell>
                  <TableCell className="text-sm text-gray-400">
                    {new Date(link.createdAt).toLocaleDateString("en-PK")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <LinkParentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchLinks}
      />
    </div>
  );
}