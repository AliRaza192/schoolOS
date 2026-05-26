interface SubjectResult {
  subject: string;
  marks: number;
  totalMarks: number;
  grade: string;
}

interface ResultSlipData {
  studentName: string;
  fatherName: string | null;
  rollNo: string | null;
  className: string;
  examName: string;
  examDate: string;
  subjectResults: SubjectResult[];
  totalObtained: number;
  totalPossible: number;
  percentage: number;
  grade: string;
  position: number | null;
  remarks: string | null;
}

interface ResultSlipProps {
  results: ResultSlipData[];
  schoolName: string;
}

function getPositionLabel(pos: number | null): string {
  if (!pos) return "—";
  if (pos === 1) return "1st";
  if (pos === 2) return "2nd";
  if (pos === 3) return "3rd";
  return `${pos}th`;
}

export default function ResultSlip({ results, schoolName }: ResultSlipProps) {
  return (
    <div className="hidden print:block">
      {results.map((result, index) => (
        <div
          key={index}
          style={{
            pageBreakAfter: index < results.length - 1 ? "always" : "auto",
            padding: "24px",
            fontFamily: "Arial, sans-serif",
            fontSize: "12px",
          }}
        >
          {/* Header */}
          <div
            style={{
              textAlign: "center",
              borderBottom: "2px solid #000",
              paddingBottom: "12px",
              marginBottom: "12px",
            }}
          >
            <h1 style={{ fontSize: "20px", fontWeight: "bold", margin: "0 0 4px" }}>
              {schoolName}
            </h1>
            <h2 style={{ fontSize: "16px", margin: "0 0 4px" }}>RESULT CARD</h2>
            <p style={{ margin: 0, color: "#555" }}>
              {result.examName} — {result.examDate}
            </p>
          </div>

          {/* Student Info */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
              borderBottom: "1px solid #ccc",
              paddingBottom: "12px",
              marginBottom: "12px",
            }}
          >
            <div>
              <span style={{ color: "#555" }}>Student: </span>
              <strong>{result.studentName}</strong>
            </div>
            <div>
              <span style={{ color: "#555" }}>Roll No: </span>
              <strong>{result.rollNo ?? "—"}</strong>
            </div>
            <div>
              <span style={{ color: "#555" }}>Class: </span>
              <strong>{result.className}</strong>
            </div>
            <div>
              <span style={{ color: "#555" }}>Father: </span>
              <strong>{result.fatherName ?? "—"}</strong>
            </div>
          </div>

          {/* Subject Results */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "12px" }}>
            <thead>
              <tr style={{ background: "#f3f4f6" }}>
                <th style={{ border: "1px solid #ccc", padding: "6px 8px", textAlign: "left" }}>
                  Subject
                </th>
                <th style={{ border: "1px solid #ccc", padding: "6px 8px", textAlign: "center" }}>
                  Marks
                </th>
                <th style={{ border: "1px solid #ccc", padding: "6px 8px", textAlign: "center" }}>
                  Total
                </th>
                <th style={{ border: "1px solid #ccc", padding: "6px 8px", textAlign: "center" }}>
                  Grade
                </th>
              </tr>
            </thead>
            <tbody>
              {result.subjectResults.map((sr, i) => (
                <tr key={i}>
                  <td style={{ border: "1px solid #ccc", padding: "5px 8px" }}>
                    {sr.subject}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "5px 8px", textAlign: "center" }}>
                    {sr.marks}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "5px 8px", textAlign: "center" }}>
                    {sr.totalMarks}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "5px 8px", textAlign: "center", fontWeight: "bold" }}>
                    {sr.grade}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary */}
          <div
            style={{
              background: "#f9fafb",
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "12px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              gap: "8px",
              textAlign: "center",
            }}
          >
            <div>
              <div style={{ fontSize: "18px", fontWeight: "bold" }}>
                {result.totalObtained}/{result.totalPossible}
              </div>
              <div style={{ color: "#555", fontSize: "11px" }}>Total</div>
            </div>
            <div>
              <div style={{ fontSize: "18px", fontWeight: "bold" }}>
                {result.percentage}%
              </div>
              <div style={{ color: "#555", fontSize: "11px" }}>Percentage</div>
            </div>
            <div>
              <div style={{ fontSize: "18px", fontWeight: "bold" }}>
                {result.grade}
              </div>
              <div style={{ color: "#555", fontSize: "11px" }}>Grade</div>
            </div>
            <div>
              <div style={{ fontSize: "18px", fontWeight: "bold" }}>
                {getPositionLabel(result.position)}
              </div>
              <div style={{ color: "#555", fontSize: "11px" }}>Position</div>
            </div>
          </div>

          {/* Remarks */}
          {result.remarks && (
            <div
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "10px",
                marginBottom: "16px",
              }}
            >
              <strong>Remarks: </strong>
              <span style={{ color: "#555" }}>{result.remarks}</span>
            </div>
          )}

          {/* Signatures */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
              marginTop: "24px",
            }}
          >
            <div style={{ borderTop: "1px solid #000", paddingTop: "8px", textAlign: "center" }}>
              Class Teacher
            </div>
            <div style={{ borderTop: "1px solid #000", paddingTop: "8px", textAlign: "center" }}>
              Principal
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}