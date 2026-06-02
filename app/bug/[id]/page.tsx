'use client';

export default function DemoPage() {
  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">QAFlow Demo</h1>
        <p className="text-gray-500 mt-2">
          Example of a bug lifecycle from reporting to resolution.
        </p>
      </div>

      <div className="bg-white border rounded-xl p-6">
        <div className="flex justify-between">
          <h2 className="font-bold text-lg">BUG-1024</h2>
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
            Fixed
          </span>
        </div>

        <div className="mt-4 space-y-2">
          <p>
            <strong>Reporter:</strong> Sarah (QA)
          </p>
          <p>
            <strong>Assigned To:</strong> Ahmed (Developer)
          </p>
          <p>
            <strong>Priority:</strong> High
          </p>
          <p>
            <strong>URL:</strong> /login
          </p>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold">Expected Result</h3>
          <p className="text-gray-600">
            User should be redirected to dashboard after login.
          </p>
        </div>

        <div className="mt-4">
          <h3 className="font-semibold">Actual Result</h3>
          <p className="text-gray-600">
            Clicking Login does nothing.
          </p>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold">Description</h3>
          <p className="text-gray-600">
            Login button becomes disabled and no API request is sent.
          </p>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-bold mb-4">Discussion</h2>

        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4">
            <p className="font-semibold">Sarah (QA)</p>
            <p className="text-sm text-gray-500">
              02 Jun 2026 - 10:30 AM
            </p>
            <p className="mt-1">
              Issue reproduced on Chrome and Edge.
            </p>
          </div>

          <div className="border-l-4 border-purple-500 pl-4">
            <p className="font-semibold">Ahmed (Developer)</p>
            <p className="text-sm text-gray-500">
              02 Jun 2026 - 11:10 AM
            </p>
            <p className="mt-1">
              Root cause found. Authentication callback was not firing.
            </p>
          </div>

          <div className="border-l-4 border-purple-500 pl-4">
            <p className="font-semibold">Ahmed (Developer)</p>
            <p className="text-sm text-gray-500">
              02 Jun 2026 - 12:00 PM
            </p>
            <p className="mt-1">
              Fixed and deployed to testing environment.
            </p>
          </div>

          <div className="border-l-4 border-green-500 pl-4">
            <p className="font-semibold">Sarah (QA)</p>
            <p className="text-sm text-gray-500">
              02 Jun 2026 - 01:15 PM
            </p>
            <p className="mt-1">
              Verified successfully. Closing issue.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-bold mb-4">Activity Timeline</h2>

        <ul className="space-y-3">
          <li>📝 Bug reported</li>
          <li>👨‍💻 Assigned to developer</li>
          <li>🔄 Status changed to In Progress</li>
          <li>✅ Status changed to Fixed</li>
          <li>✔️ QA verified fix</li>
          <li>🎉 Bug closed</li>
        </ul>
      </div>
    </div>
  );
}