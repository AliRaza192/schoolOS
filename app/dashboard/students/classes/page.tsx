"use client";

import { useEffect, useState } from "react";
import { BookOpen, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import ClassFormDialog from "@/components/dashboard/classes/class-form-dialog";
import type { Class } from "@/db/schema";

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [deletingClass, setDeletingClass] = useState<Class | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function fetchClasses() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/classes");
      const data = await res.json();
      setClasses(data.classes ?? []);
    } catch {
      toast.error("Classes load nahi ho saki");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchClasses();
  }, []);

  async function handleDelete() {
    if (!deletingClass) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/classes/${deletingClass.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Class delete ho gayi!");
      setDeletingClass(null);
      fetchClasses();
    } catch {
      toast.error("Class delete nahi ho saki");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
          <p className="text-sm text-gray-500 mt-1">
            School ki sab classes aur sections
          </p>
        </div>
        <Button onClick={() => { setEditingClass(null); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Class Banao
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : classes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-gray-500 font-medium">Abhi koi class nahi hai</p>
            <Button onClick={() => { setEditingClass(null); setDialogOpen(true); }}>
              Pehli Class Banao
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class Name</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Academic Year</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((cls) => (
                <TableRow key={cls.id}>
                  <TableCell className="font-medium">{cls.name}</TableCell>
                  <TableCell>{cls.section ?? "—"}</TableCell>
                  <TableCell>{cls.academicYear}</TableCell>
                  <TableCell>—</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setEditingClass(cls); setDialogOpen(true); }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => setDeletingClass(cls)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Form Dialog */}
      <ClassFormDialog
        mode={editingClass ? "edit" : "create"}
        initialData={editingClass ?? undefined}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchClasses}
      />

      {/* Delete Confirm */}
      <AlertDialog
        open={!!deletingClass}
        onOpenChange={(open) => !open && setDeletingClass(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Class delete karo?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deletingClass?.name}</strong> delete karne se us class ke
              sab students unassigned ho jayenge.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Delete ho raha hai..." : "Delete Karo"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}