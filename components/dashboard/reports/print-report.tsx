interface ReportData {
  studentId: string;
  studentName: string;
  fatherName: string | null;
  rollNo: string | null;
  attendancePercentage: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  totalDays: number;
  feeStatus: string;
  paidFees: boolean;
  aiComment: string;
  month: number;
  year: number;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface PrintReportProps {
  reports: ReportData[];
  schoolName: string;
  className: string;
}

export default function PrintReport({
  reports,
  schoolName,
  className,
}: PrintReportProps) {
  return (
    <div className="hidden print:block">
      {reports.map((report, index) => (
        <div
          key={report.studentId}
          style={{ pageBreakAfter: index < reports.length - 1 ? "always" : "auto" }}
          className="p-8 bg-white"
        >
          {/* Header */}
          <div className="text-center border-b-2 border-gray-800 pb-4 mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{schoolName}</h1>
            <h2 className="text-lg font-semibold text-gray-700 mt-1">
              Monthly Progress Report
            </h2>
            <p className="text-gray-500 mt-1">
              {MONTHS[report.month - 1]} {report.year}
            </p>
          </div>

          {/* Student Info */}
          <div className="grid grid-cols-2 gap-2 text-sm border-b border-gray-300 pb-4 mb-4">
            <div>
              <span className="text-gray-500">Student: </span>
              <span className="font-semibold">{report.studentName}</span>
            </div>
            <div>
              <span className="text-gray-500">Roll No: </span>
              <span className="font-semibold">{report.rollNo ?? "—"}</span>
            </div>
            <div>
              <span className="text-gray-500">Class: </span>
              <span className="font-semibold">{className}</span>
            </div>
            <div>
              <span className="text-gray-500">Father: </span>
              <span className="font-semibold">{report.fatherName ?? "—"}</span>
            </div>
            <div>
              <span className="text-gray-500">Fee Status: </span>
              <span className="font-semibold">
                {report.paidFees ? "Paid ✓" : "Pending"}
              </span>
            </div>
          </div>

          {/* Attendance */}
          <div className="border-b border-gray-300 pb-4 mb-4">
            <h3 className="text-center font-bold text-gray-800 mb-3 uppercase text-sm">
              Attendance
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center text-sm mb-3">
              <div>
                <p className="text-2xl font-bold text-green-600">{report.presentDays}</p>
                <p className="text-gray-500">Present</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{report.absentDays}</p>
                <p className="text-gray-500">Absent</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{report.leaveDays}</p>
                <p className="text-gray-500">Leave</p>
              </div>
            </div>
            <p className="text-center font-semibold text-gray-700 text-sm mb-2">
              Attendance Percentage: {report.attendancePercentage}%
            </p>
            {/* Visual Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 rounded-full bg-gray-800"
                style={{ width: `${report.attendancePercentage}%` }}
              />
            </div>
          </div>

          {/* Teacher Remarks */}
          <div className="border-b border-gray-300 pb-4 mb-6">
            <h3 className="text-center font-bold text-gray-800 mb-3 uppercase text-sm">
              Teacher&apos;s Remarks
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed text-center italic">
              &ldquo;{report.aiComment}&rdquo;
            </p>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-8 text-sm text-gray-600">
            <div className="text-center">
              <div className="border-t border-gray-400 pt-2 mt-8">
                Class Teacher
              </div>
            </div>
            <div className="text-center">
              <div className="border-t border-gray-400 pt-2 mt-8">
                Principal
              </div>
            </div>
            <div className="text-center">
              <p className="mb-8">
                Date:{" "}
                {new Date().toLocaleDateString("en-PK", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
              <div className="border-t border-gray-400 pt-2">
                Parent&apos;s Signature
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}