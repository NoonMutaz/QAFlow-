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
        <h2 className="text-lg font-bold text-slate-100">Officer Information</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 text-sm font-medium text-emerald-400 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/10 transition-all"
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
              className="px-4 py-2 text-sm font-medium text-slate-400 border border-slate-700 rounded-xl hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-semibold text-slate-950 bg-emerald-500 rounded-xl hover:bg-emerald-400 transition-all disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1.5">Full Name</label>
          {isEditing ? (
            <>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={`w-full px-4 py-3 bg-slate-800 border rounded-xl text-sm text-slate-100 focus:border-emerald-500 focus:outline-none transition-all ${
                  errors.name ? 'border-rose-500 bg-rose-950/20' : 'border-slate-700'
                }`}
              />
              {errors.name && <p className="text-rose-400 text-xs mt-1">{errors.name}</p>}
            </>
          ) : (
            <p className="px-4 py-3 bg-slate-800/50 rounded-xl text-sm text-slate-200 border border-slate-800">
              {user?.name || '—'}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1.5">Corporate Email</label>
          {isEditing ? (
            <>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={`w-full px-4 py-3 bg-slate-800 border rounded-xl text-sm text-slate-100 focus:border-emerald-500 focus:outline-none transition-all ${
                  errors.email ? 'border-rose-500 bg-rose-950/20' : 'border-slate-700'
                }`}
              />
              {errors.email && <p className="text-rose-400 text-xs mt-1">{errors.email}</p>}
            </>
          ) : (
            <p className="px-4 py-3 bg-slate-800/50 rounded-xl text-sm text-slate-200 border border-slate-800">
              {user?.email || '—'}
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-800">
        <h3 className="text-sm font-bold text-rose-400 mb-3">Danger Zone</h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-rose-950/10 border border-rose-900/30 rounded-xl gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-200">Deactivate Organization Account</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Permanently delete this account and all associated compliance records.{' '}
              <span className="text-rose-400 ml-1">(Feature in development)</span>
            </p>
          </div>
          <button
            disabled
            className="px-4 py-2 text-sm font-semibold text-rose-400/50 border border-rose-900/30 bg-slate-900 rounded-xl cursor-not-allowed whitespace-nowrap"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}