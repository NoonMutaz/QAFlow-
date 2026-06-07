"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateTestCase({ 
  projectId, 
  onSuccess,
  onCancel
}: { 
  projectId: string;
  onSuccess: () => void; 
  onCancel?: () => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [steps, setSteps] = useState([""]); 
  const [expectedResult, setExpectedResult] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addStep = () => setSteps([...steps, ""]);
  
  const removeStep = (indexToRemove: number) => {
    if (steps.length === 1) {
      setSteps([""]); // reset back to single clean row instead of erasing completely
    } else {
      setSteps(steps.filter((_, idx) => idx !== indexToRemove));
    }
  };

  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !expectedResult.trim()) {
      alert("Please fill out all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = document.cookie.match(/(^| )token=([^;]+)/)?.[2];
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/testcases`,
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: title.trim(),
            steps: steps.filter(s => s.trim() !== ""), // filter empty spacer fields safely
            expectedResult: expectedResult.trim(),
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.log("Validation Errors:", JSON.stringify(errorData, null, 2));
        alert(JSON.stringify(errorData.errors, null, 2));
        throw new Error(errorData.title || `Server returned ${response.status}`);
      }

      onSuccess();
    } catch (error: any) {
      console.error("Error saving test case:", error);
      alert("Save failed: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 bg-white">
      {/* Modal Form Top Row Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Create New Test Case</h2>
          <p className="text-xs text-gray-500 mt-0.5">Outline structural target goals and exact reproducer rulesets.</p>
        </div>
        {onCancel && (
          <button 
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      <form onSubmit={handleCreate} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">
            Test Case Title <span className="text-rose-500">*</span>
          </label>
          <input 
            required
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2.5 text-sm bg-white border border-gray-300 rounded-xl shadow-2xs placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-150"
            placeholder="e.g., Verify workspace login with valid credentials"
          />
        </div>

        {/* Dynamic Execution Steps */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">Execution Steps</label>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center gap-2 group">
                <span className="text-xs font-bold text-gray-400 w-5 select-none text-center">
                  {index + 1}
                </span>
                <input
                  value={step}
                  onChange={(e) => handleStepChange(index, e.target.value)}
                  className="flex-1 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all placeholder-gray-400"
                  placeholder={`Describe step entry detail...`}
                />
                <button
                  type="button"
                  onClick={() => removeStep(index)}
                  className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Delete step"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <button 
            type="button" 
            onClick={addStep}
            className="inline-flex items-center gap-1.5 text-blue-600 text-xs font-semibold mt-3 hover:text-blue-700 hover:underline px-1 py-0.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Next Step
          </button>
        </div>

        {/* Expected Result Target Assertion Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">
            Expected Result <span className="text-rose-500">*</span>
          </label>
          <textarea 
            required
            value={expectedResult}
            onChange={(e) => setExpectedResult(e.target.value)}
            className="w-full px-3 py-2.5 text-sm bg-white border border-gray-300 rounded-xl shadow-2xs placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-150 resize-none"
            placeholder="What should happen explicitly when all validation checkpoints clear?"
            rows={3}
          />
        </div>

        {/* Action Button Set Footer */}
        <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
          {onCancel && (
            <button 
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-semibold text-sm rounded-xl hover:bg-gray-50 transition active:scale-[0.99] disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button 
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-2.5 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-700 shadow-sm shadow-blue-600/10 transition active:scale-[0.99] disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving Changes...
              </>
            ) : "Save Test Case"}
          </button>
        </div>
      </form>
    </div>
  );
}