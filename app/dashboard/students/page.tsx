"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Search, Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import StudentFormDialog from "@/components/dashboard/students/student-form-dialog";
import StudentDetailSheet from "@/components/dashboard/students/student-detail-sheet";
import type { Student, Class } from "@/db/schema";

interface StudentWithClass extends Student {
  class: Class | null;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentWithClass[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [viewingStudentId, setViewingStudentId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const totalPages = Math.ceil(total / 25);

  async function fetchClasses() {
    try {
      const res = await fetch("/api/classes");
      const data = await res.json();
      setClasses(data.classes ?? []);
    } catch {
      // ignore
    }
  }

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedClassId && selectedClassId !== "all")
        params.set("classId", selectedClassId);
      params.set("page", String(page));

      const res = await fetch(`/api/students?${params.toString()}`);
      const data = await res.json();
      setStudents(data.students ?? []);
      setTotal(data.total ?? 0);
    } catch {
      toast.error("Students load nahi ho sake");
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedClassId, page]);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchStudents, 300);
    return () => clearTimeout(timer);
  }, [fetchStudents]);

  async function handleDelete() {
    if (!deletingStudent) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/students/${deletingStudent.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete nahi ho saka");
      toast.success("Student delete ho gaya!");
      setDeletingStudent(null);
      fetchStudents();
    } catch {
      toast.error("Student delete nahi ho saka");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
        <Button
          onClick={() => {
            setEditingStudent(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Student Enroll Karo
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Naam se search karo..."
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          value={selectedClassId}
          onValueChange={(v) => {
            setSelectedClassId(v ?? "");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sab Classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Sab Classes</SelectItem>
            {classes.map((cls) => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.name} {cls.section ? `(${cls.section})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <p className="text-gray-500 font-medium">
              {search || selectedClassId
                ? "Koi student nahi mila"
                : "Abhi koi student nahi hai"}
            </p>
            {search && (
              <Button variant="outline" onClick={() => setSearch("")}>
                Search clear karo
              </Button>
            )}
            {!search && !selectedClassId && (
              <Button
                onClick={() => {
                  setEditingStudent(null);
                  setDialogOpen(true);
                }}
              >
                Pehla Student Enroll Karo
              </Button>
            )}
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Father Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.rollNo ?? "—"}</TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.fatherName ?? "—"}</TableCell>
                    <TableCell>
                      {student.class
                        ? `${student.class.name}${student.class.section ? ` (${student.class.section})` : ""}`
                        : "—"}
                    </TableCell>
                    <TableCell>{student.phone ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setViewingStudentId(student.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingStudent(student);
                            setDialogOpen(true);
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => setDeletingStudent(student)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Total: {total} students
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-500 flex items-center px-2">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Student Form Dialog */}
      <StudentFormDialog
        mode={editingStudent ? "edit" : "create"}
        initialData={editingStudent ?? undefined}
        classes={classes}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchStudents}
      />

      {/* Student Detail Sheet */}
      <StudentDetailSheet
        studentId={viewingStudentId}
        onClose={() => setViewingStudentId(null)}
      />

      {/* Delete Confirm */}
      <AlertDialog
        open={!!deletingStudent}
        onOpenChange={(open) => !open && setDeletingStudent(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Student delete karo?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deletingStudent?.name}</strong> ko delete karne se unka
              sara data remove ho jaega.
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