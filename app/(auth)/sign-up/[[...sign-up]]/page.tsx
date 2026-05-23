import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">SchoolOS Pakistan</h1>
          <p className="text-gray-500 text-sm mt-1">Create your school account</p>
        </div>
        <SignUp />
      </div>
    </div>
  );
}