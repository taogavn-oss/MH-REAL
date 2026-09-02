import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function SurveySuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-xl text-center border-t-4 border-green-500">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
        <h2 className="mt-6 text-2xl font-bold text-gray-900">Application Submitted!</h2>
        <p className="mt-2 text-gray-600">
          Thank you for completing the survey. Your responses have been securely recorded. Our recruitment team will review your application and contact you shortly.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
