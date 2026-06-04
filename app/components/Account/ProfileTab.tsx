import { User } from './types';

interface ProfileTabProps {
  user: User | null;
  form: { name: string; email: string };
  setForm: React.Dispatch<React.SetStateAction<{ name: string; email: string }>>;
  errors: { [key: string]: string };
  setErrors: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  isSaving: boolean;
  handleSave: () => void;
}

export default function ProfileTab({
  user,
  form,
  setForm,
  errors,
  setErrors,
  isEditing,
  setIsEditing,
  isSaving,
  handleSave,
}: ProfileTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-all"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsEditing(false);
                setErrors({});
              }}
              className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:shadow-md transition-all disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
          {isEditing ? (
            <>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </>
          ) : (
            <p className="px-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-900 border border-gray-200">
              {user?.name || '—'}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
          {isEditing ? (
            <>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${
                  errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </>
          ) : (
            <p className="px-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-900 border border-gray-200">
              {user?.email || '—'}
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100">
        <h3 className="text-sm font-bold text-red-600 mb-3">Danger Zone</h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">Delete Account</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Permanently delete your account and all data{' '}
              <span className="text-red-500 ml-1">(Feature in development)</span>
            </p>
          </div>
          <button
            disabled
            className="px-4 py-2 text-sm font-semibold text-red-400 border border-red-200 bg-white rounded-xl cursor-not-allowed whitespace-nowrap"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}