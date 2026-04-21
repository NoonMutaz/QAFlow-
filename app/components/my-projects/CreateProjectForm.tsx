'use client';

import React from 'react';
//  Import Project from context — no local redefinition
import { type Project } from '../../context/ProjectContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProjectForm {
  name: string;
  description: string;
  type: string;
}

interface CreateProjectFormProps {
  handleUpdateProject: () => void | Promise<void>;
  projectTypes: string[];
  isProjectSubmitting: boolean;
  projectErrors: Record<string, string>;
  settingsModalProjectId?: number | null;
  currentProject: Project | undefined;
  isOwner: (role: string) => boolean;
  projectForm: ProjectForm;
  setProjectForm: (form: ProjectForm) => void;
  setSettingsModalProjectId: (id: number | null) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateProjectForm({
  handleUpdateProject,
  projectTypes,
  isProjectSubmitting,
  projectErrors,
  settingsModalProjectId,
  currentProject,
  isOwner,
  projectForm,
  setProjectForm,
  setSettingsModalProjectId,
}: CreateProjectFormProps) {
  // role is optional in ProjectContext.Project — default to '' so isOwner returns false
  if (
    settingsModalProjectId == null ||
    !currentProject ||
    !isOwner(currentProject.role ?? '')
  ) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Edit Project</h2>
            <p className="text-sm text-gray-500 mt-0.5">{currentProject.name}</p>
          </div>
          <button
            onClick={() => setSettingsModalProjectId(null)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Project Name *
            </label>
            <input
              type="text"
              value={projectForm.name}
              onChange={(e) =>
                setProjectForm({ ...projectForm, name: e.target.value })
              }
              className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${
                projectErrors.name
                  ? 'border-red-300 bg-red-50 ring-2 ring-red-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              placeholder="Enter project name"
            />
            {projectErrors.name && (
              <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {projectErrors.name}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              value={projectForm.description}
              maxLength={100}
              onChange={(e) =>
                setProjectForm({ ...projectForm, description: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none hover:border-gray-300 transition-all"
              placeholder="Brief project description (optional)"
            />
            <p className="text-xs text-gray-400 text-right mt-1">
              {projectForm.description.length}/100
            </p>
            {projectErrors.description && (
              <p className="text-red-500 text-xs mt-1">{projectErrors.description}</p>
            )}
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Project Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {projectTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setProjectForm({ ...projectForm, type })}
                  className={`px-3 py-2.5 rounded-xl border-2 text-xs font-medium transition-all hover:shadow-sm ${
                    projectForm.type === type
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md scale-[1.02]'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:scale-[1.02]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Error */}
          {projectErrors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-red-800 text-sm">{projectErrors.submit}</p>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setSettingsModalProjectId(null)}
              disabled={isProjectSubmitting}
              className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 hover:shadow-sm transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateProject}
              disabled={isProjectSubmitting}
              className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProjectSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}