"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateTestCase({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [steps, setSteps] = useState([""]); // مصفوفة للخطوات
  const [expectedResult, setExpectedResult] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addStep = () => setSteps([...steps, ""]);
  
  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    // منطق الـ API الخاص بك هنا
    console.log({ title, steps, expectedResult, projectId });
    setIsSubmitting(false);
    router.push(`/projects/${projectId}/test-cases`);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold mb-6">Create New Test Case</h2>
      
      {/* Title */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2">Test Case Title</label>
        <input 
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 border rounded-xl"
          placeholder="e.g., Verify Login with valid credentials"
        />
      </div>

      {/* Dynamic Steps */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2">Steps</label>
        {steps.map((step, index) => (
          <input
            key={index}
            value={step}
            onChange={(e) => handleStepChange(index, e.target.value)}
            className="w-full p-2 mb-2 border rounded-lg text-sm"
            placeholder={`Step ${index + 1}`}
          />
        ))}
        <button 
          type="button" 
          onClick={addStep}
          className="text-blue-600 text-sm font-medium hover:underline"
        >
          + Add Step
        </button>
      </div>

      {/* Expected Result */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">Expected Result</label>
        <textarea 
          value={expectedResult}
          onChange={(e) => setExpectedResult(e.target.value)}
          className="w-full p-3 border rounded-xl"
          rows={3}
        />
      </div>

      <button 
        onClick={handleCreate}
        disabled={isSubmitting}
        className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
      >
        {isSubmitting ? "Creating..." : "Save Test Case"}
      </button>
    </div>
  );
}