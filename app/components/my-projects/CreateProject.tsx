"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useProjects } from "../../context/ProjectContext";

// Explicit Interface
interface FormErrors {
  projectName?: string;
  description?: string;
  submit?: string;
}

export default function CreateProject() {
  const router = useRouter();
  const { addProject } = useProjects();

  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [projectType, setProjectType] = useState("QA Dashboard");

  const [isSubmitting, setIsSubmitting] = useState(false);
  // Now using the interface instead of 'any'
  const [errors, setErrors] = useState<FormErrors>({});

  const [isNameAvailable, setIsNameAvailable] = useState<boolean | null>(null);
  const [isCheckingName, setIsCheckingName] = useState(false);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!projectName.trim()) {
      newErrors.projectName = "Project name is required";
    } else if (projectName.trim().length < 3) {
      newErrors.projectName = "Project name must be at least 3 characters";
    }

    if (description.length > 100) {
      newErrors.description = "Description must be less than 100 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const name = projectName.trim();

    if (!name) {
      setIsNameAvailable(null);
      setErrors((p) => {
        const { projectName, ...rest } = p;
        return rest;
      });
      return;
    }

    if (name.length < 3) {
      setIsNameAvailable(null);
      setErrors((p) => ({ ...p, projectName: "Project name must be at least 3 characters" }));
      return;
    }

    setIsNameAvailable(null);
    setIsCheckingName(true);
    setErrors((p) => {
      const { projectName, ...rest } = p;
      return rest;
    });

    debounceRef.current = setTimeout(async () => {
      try {
        const token = document.cookie.match(/(^| )token=([^;]+)/)?.[2];
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/projects/check-name?name=${encodeURIComponent(name)}`,
          { headers: { Authorization: token ? `Bearer ${token}` : "" } }
        );

        const data = await res.json();
        const nameExists = data?.exists === true || data?.data?.exists === true;

        if (nameExists) {
          setIsNameAvailable(false);
          setErrors((p) => ({ ...p, projectName: "A project with this name already exists" }));
        } else {
          setIsNameAvailable(true);
        }
      } catch (err) {
        setIsNameAvailable(null);
      } finally {
        setIsCheckingName(false);
      }
    }, 500);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [projectName]);

  const canSubmit = useMemo(() => 
    !isSubmitting && !isCheckingName && isNameAvailable === true && !errors.projectName
  , [isSubmitting, isCheckingName, isNameAvailable, errors.projectName]);

  const handleCreate = async () => {
    if (!validateForm()) return;
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      const token = document.cookie.match(/(^| )token=([^;]+)/)?.[2];
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: token ? `Bearer ${token}` : "" 
        },
        body: JSON.stringify({ name: projectName.trim(), description, type: projectType }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to create project");

      addProject(data);
      router.push("/my-projects");
    } catch (err: unknown) {
      // handle errors in TS
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      setErrors({ submit: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const name = projectName.trim();

    // 1. Reset everything to clean slate immediately on empty
    if (!name) {
      setIsNameAvailable(null);
      setErrors((p) => {
        const { projectName, ...rest } = p;
        return rest;
      });
      return;
    }

    // 2. Clear out marks and show length error immediately
    if (name.length < 3) {
      setIsNameAvailable(null);
      setErrors((p) => ({ ...p, projectName: "Project name must be at least 3 characters" }));
      return;
    }

    // 3. CRITICAL: While typing, clear any old state flags completely so no icons show up falsely
    setIsNameAvailable(null);
    setIsCheckingName(true);
    setErrors((p) => {
      const { projectName, ...rest } = p;
      return rest;
    });

    debounceRef.current = setTimeout(async () => {
      try {
        const token = document.cookie.match(/(^| )token=([^;]+)/)?.[2];

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/projects/check-name?name=${encodeURIComponent(name)}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );

        const data = await res.json();

        // Hardened check: Checks for data.exists or nested data.data.exists as boolean or string
        const nameExists = 
          data?.exists === true || 
          data?.exists === "true" || 
          data?.data?.exists === true || 
          data?.data?.exists === "true";

        if (nameExists) {
          // Explicitly turn off the green mark and force false state
          setIsNameAvailable(false); 
          setErrors((p) => ({
            ...p,
            projectName: "A project with this name already exists",
          }));
        } else {
          // Explicitly turn on the green mark only when name is completely unique
          setIsNameAvailable(true);
          setErrors((p) => {
            const { projectName, ...rest } = p;
            return rest;
          });
        }
      } catch (err) {
        console.error("Validation error:", err);
        setIsNameAvailable(null);
      } finally {
        setIsCheckingName(false);
      }
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [projectName]);

//   const canSubmit = useMemo(() => {
//     return (
//       !isSubmitting &&
//       !isCheckingName &&
//       isNameAvailable === true &&
//       !errors.projectName
//     );
//   }, [isSubmitting, isCheckingName, isNameAvailable, errors.projectName]);

//   const handleCreate = async () => {
//     if (!validateForm()) return;
//     if (!canSubmit) return;

//     setIsSubmitting(true);

//     try {
//       const token = document.cookie.match(/(^| )token=([^;]+)/)?.[2];

//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_API_URL}/api/projects`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: token ? `Bearer ${token}` : "",
//           },
//           body: JSON.stringify({
//             name: projectName.trim(),
//             description,
//             type: projectType,
//           }),
//         }
//       );

//       const data = await res.json();

//       if (!res.ok) throw new Error(data?.message || "Failed to create project");

//       addProject(data);
//       router.push("/my-projects");
//     } catch (err: unknown) {
//      if (err instanceof Error) {
//     setErrors({ submit: err.message });
//   } else {
//     setErrors({ submit: 'An unexpected error occurred' });
//   }
// } finally {
//   setIsSubmitting(false);
// }};

  const handleCancel = () => {
    router.push("/my-projects");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
      </div>

      <div className="relative w-full max-w-2xl">
        <div className="bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl p-8 md:p-10 border border-gray-100">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Create New Project
            </h1>
            <p className="text-gray-600">
              Set up your QA project with all the details
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreate();
            }}
            className="space-y-6"
          >
            {/* Project Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Project Name <span className="text-red-500">*</span>
                </span>
              </label>
              
              <div className="relative">
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value.replace(/[^a-zA-Z0-9 ]/g, ""))}
                  placeholder="e.g., Mobile App Testing"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-all pr-10 ${
                    errors.projectName || isNameAvailable === false
                      ? "border-red-300 bg-red-50 focus:ring-red-400"
                      : isNameAvailable === true
                      ? "border-green-300 bg-green-50/20 focus:ring-green-400"
                      : "border-gray-200 hover:border-gray-300 focus:ring-blue-500"
                  }`}
                />
                
                {/* Status Indicator Overlays */}
                {isCheckingName && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg className="animate-spin h-4 w-4 text-gray-400" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                )}
                
                {/* Green check icon: ONLY visible if explicitly valid, not loading, and error text is cleared */}
                {!isCheckingName && isNameAvailable === true && !errors.projectName && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                {/* Red warning icon: ONLY visible when name is explicitly taken */}
                {!isCheckingName && isNameAvailable === false && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )}
              </div>
              
              {errors.projectName && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.projectName}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Description
                </span>
              </label>
              <textarea
                value={description}
                maxLength={100}
                onChange={(e) => {
                  setDescription(e.target.value.replace(/[^a-zA-Z0-9 ]/g, ""));
                  if (errors.description) {
                    setErrors((p) => {
                      const { description, ...rest } = p;
                      return rest;
                    });
                  }
                }}
                placeholder="Briefly describe your project (optional)"
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 hover:border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all resize-none"
              />
              <div className="flex justify-end items-center mt-1">
                <span className={`text-xs ${description.length > 80 ? "text-orange-500" : "text-gray-400"}`}>
                  {description.length}/100 characters
                </span>
              </div>
            </div>

            {/* Project Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Project Type
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {["QA Dashboard", "Bug Tracking", "Test Management", "Performance Testing"].map((type) => (
                  <button
                    key={type}
                    disabled={type === "Performance Testing" || type === "Test Management"}
                    type="button"
                    onClick={() => setProjectType(type)}
                    className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      type === "Performance Testing" || type === "Test Management"
                        ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60 shadow-none"
                        : projectType === type
                        ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600 cursor-pointer"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Error Block */}
            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.submit}
                </p>
              </div>
            )}

            {/* Actions Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={!canSubmit}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Create Project
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Footer Info */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              By creating a project, you agree to our{" "}
              <a href="/privacy" className="text-blue-600 hover:underline">
                Terms of Service
              </a>
            </p>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={handleCancel}
          className="mt-6 flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Projects
        </button>
      </div>
    </div>
  );
}