export function calculateGrade(percentage: number): string {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  return "F";
}

export function generateResultRemarks(
  studentName: string,
  percentage: number,
  grade: string
): string {
  if (grade === "A+" || grade === "A") {
    return `Excellent performance! Keep it up, ${studentName}.`;
  }
  if (grade === "B") {
    return `Good work, ${studentName}. Aim higher next time.`;
  }
  if (grade === "C") {
    return `Average performance. More effort needed, ${studentName}.`;
  }
  if (grade === "D") {
    return `Below average. Please focus on studies, ${studentName}.`;
  }
  return `Needs improvement. Please see teacher, ${studentName}.`;
}

interface ResultWithStudent {
  studentId: string;
  percentage: number;
  [key: string]: unknown;
}

export function calculatePositions<T extends ResultWithStudent>(
  results: T[]
): (T & { position: number })[] {
  const sorted = [...results].sort((a, b) => b.percentage - a.percentage);

  let position = 1;
  return sorted.map((result, index) => {
    if (index > 0 && result.percentage < sorted[index - 1].percentage) {
      position = index + 1;
    }
    return { ...result, position };
  });
}

export function getGradeColor(grade: string): string {
  switch (grade) {
    case "A+": return "bg-green-100 text-green-700";
    case "A": return "bg-blue-100 text-blue-700";
    case "B": return "bg-cyan-100 text-cyan-700";
    case "C": return "bg-amber-100 text-amber-700";
    case "D": return "bg-orange-100 text-orange-700";
    case "F": return "bg-red-100 text-red-700";
    default: return "bg-gray-100 text-gray-600";
  }
}

export function getPositionLabel(position: number): string {
  if (position === 1) return "🥇 1st";
  if (position === 2) return "🥈 2nd";
  if (position === 3) return "🥉 3rd";
  return `${position}th`;
}