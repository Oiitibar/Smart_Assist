import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BookOpen,
  CheckCircle2,
  FileText,
  GraduationCap,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { plannerApi } from "../../service/plannerApi";
import { resolveAvatarUrl } from "../../utils/avatar";

const roleLabels = {
  student: "Student",
  admin: "Admin",
  super_admin: "Super admin",
};

const roleClasses = {
  student: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  admin: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  super_admin: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
};

const initials = (name) =>
  String(name || "User")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const formatDate = (value, fallback = "Not recorded") => {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

function Avatar({ user, large = false }) {
  const source = resolveAvatarUrl(user?.avatarUrl);
  const size = large ? "h-12 w-12 rounded-2xl" : "h-10 w-10 rounded-xl";

  if (source) {
    return <img className={`${size} shrink-0 object-cover`} src={source} alt={`${user?.name || "User"} avatar`} />;
  }

  return (
    <span className={`grid ${size} shrink-0 place-items-center bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-bold text-white`}>
      {initials(user?.name)}
    </span>
  );
}

export default function AdminPanel({ currentUser, onNotice, onError }) {
  const [payload, setPayload] = useState({ summary: {}, users: [], permissions: {} });
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const result = await plannerApi.getAdminOverview({ search, role });
      const next = result || { summary: {}, users: [], permissions: {} };
      setPayload(next);
      setSelectedId((current) =>
        next.users?.some((user) => user.id === current)
          ? current
          : next.users?.[0]?.id || "",
      );
    } catch (error) {
      onError?.(error, "Could not load admin information");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(load, 250);
    return () => window.clearTimeout(timer);
  }, [search, role]);

  const selectedUser = useMemo(
    () => payload.users?.find((user) => user.id === selectedId) || payload.users?.[0] || null,
    [payload.users, selectedId],
  );

  const changeRole = async (user) => {
    const nextRole = user.role === "admin" ? "student" : "admin";
    const action = nextRole === "admin" ? "grant admin access to" : "remove admin access from";
    if (!window.confirm(`Are you sure you want to ${action} ${user.name}?`)) return;

    setUpdatingId(user.id);
    try {
      await plannerApi.updateAdminRole(user.id, nextRole);
      onNotice?.(nextRole === "admin" ? "Admin access granted" : "Admin access removed");
      await load();
    } catch (error) {
      onError?.(error, "Could not update account role");
    } finally {
      setUpdatingId("");
    }
  };

  const deleteUserAccount = async (user) => {
    if (!payload.permissions?.canDeleteAccounts || !user?.deletion?.allowed) return;

    const confirmed = window.confirm(
      `Permanently delete ${user.name} (${user.email})?

` +
        "The user profile, materials, Cloudflare R2 files, previews, flashcards, quizzes, " +
        "timetable entries, tasks, progress records, and uploaded avatar will also be deleted. " +
        "This action cannot be undone.",
    );
    if (!confirmed) return;

    setDeletingId(user.id);
    try {
      await plannerApi.deleteUserAccount(user.id);
      onNotice?.("Account and its related study data were deleted");
      setSelectedId("");
      await load();
    } catch (error) {
      onError?.(error, "Could not delete account");
    } finally {
      setDeletingId("");
    }
  };

  const summaryCards = [
    { value: payload.summary?.totalAccounts || 0, label: "Total accounts", detail: "Registered Smart Assist users", icon: Users },
    { value: payload.summary?.activeToday || 0, label: "Active today", detail: "Accounts used since midnight", icon: Activity },
    { value: payload.summary?.normalAdmins || 0, label: "Normal admins", detail: "Assigned by a super admin", icon: ShieldCheck },
    { value: payload.summary?.totalMaterials || 0, label: "Study materials", detail: "Across every account", icon: FileText },
    { value: payload.summary?.deletableAccounts || 0, label: "Deletable accounts", detail: "Students and normal admins", icon: Trash2 },
  ];

  return (
    <div className="min-h-[calc(100vh-68px)] bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1440px]">
        <header className="mb-7 flex flex-wrap items-end justify-between gap-5">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
              <span className="h-px w-5 bg-indigo-500" /> Platform management
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">Admin control room</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Review account information and understand study activity across Smart Assist.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/80 px-4 py-3 dark:border-indigo-900 dark:bg-indigo-500/10">
            <Avatar user={currentUser} />
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-white">{currentUser?.name || "Administrator"}</p>
              <p className="text-[11px] font-medium text-indigo-700 dark:text-indigo-300">
                {roleLabels[currentUser?.role] || "Administrator"}
                {currentUser?.role === "super_admin" ? " · source assigned" : ""}
              </p>
            </div>
          </div>
        </header>

        <section className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
          {summaryCards.map(({ value, label, detail, icon: Icon }) => (
            <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                <Icon size={18} />
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
              <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</p>
              <p className="mt-1 text-xs text-slate-400">{detail}</p>
            </article>
          ))}
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.8fr)]">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-100 p-5 dark:border-slate-800">
              <div className="flex flex-wrap justify-between gap-4">
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white">Accounts directory</h2>
                  <p className="mt-1 text-xs text-slate-500">Select an account to inspect its study information.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <label className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search name or email"
                      className="w-52 rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950"
                    />
                  </label>
                  <select
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                  >
                    <option value="all">All roles</option>
                    <option value="student">Students</option>
                    <option value="admin">Admins</option>
                    <option value="super_admin">Super admins</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400 dark:bg-slate-950/60">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Account</th>
                    <th className="px-3 py-3 font-semibold">Profile</th>
                    <th className="px-3 py-3 font-semibold">Study activity</th>
                    <th className="px-3 py-3 font-semibold">Role</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    <tr><td colSpan="5" className="px-5 py-12 text-center text-sm text-slate-400">Loading accounts...</td></tr>
                  ) : payload.users?.length ? payload.users.map((user) => (
                    <tr
                      key={user.id}
                      onClick={() => setSelectedId(user.id)}
                      className={`cursor-pointer transition ${selectedUser?.id === user.id ? "bg-indigo-50/70 dark:bg-indigo-500/10" : "hover:bg-slate-50 dark:hover:bg-slate-800/60"}`}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar user={user} />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">{user.name}</p>
                            <p className="truncate text-[11px] text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-xs text-slate-700 dark:text-slate-200">{user.profile?.school || "School not added"}</p>
                        <p className="text-[11px] text-slate-400">{user.profile?.grade || "Grade not added"}</p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-200">{user.study.materials} materials · {user.study.quizAttempts} quiz attempts</p>
                        <p className="text-[11px] text-slate-400">{user.study.flashcards} flashcards · {user.study.quizAverage ?? "—"}% quiz average</p>
                        {user.inactivity?.inactiveForMonth && (
                          <span className="mt-1.5 inline-flex rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
                            Inactive {user.inactivity.inactiveDays} days
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${roleClasses[user.role]}`}>{roleLabels[user.role]}</span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {payload.permissions?.canManageAdmins && user.role !== "super_admin" && user.id !== currentUser?.id && (
                            <button
                              type="button"
                              disabled={updatingId === user.id || deletingId === user.id}
                              onClick={(event) => { event.stopPropagation(); changeRole(user); }}
                              className="whitespace-nowrap text-xs font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-50 dark:text-indigo-300"
                            >
                              {updatingId === user.id ? "Saving..." : user.role === "admin" ? "Remove admin" : "Make admin"}
                            </button>
                          )}
                          {payload.permissions?.canDeleteAccounts && user.deletion?.allowed && (
                            <button
                              type="button"
                              disabled={deletingId === user.id || updatingId === user.id}
                              onClick={(event) => { event.stopPropagation(); deleteUserAccount(user); }}
                              className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold text-rose-600 hover:text-rose-800 disabled:opacity-50 dark:text-rose-300"
                            >
                              <Trash2 size={13} />
                              {deletingId === user.id ? "Deleting..." : "Delete"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="5" className="px-5 py-12 text-center text-sm text-slate-400">No accounts match this filter.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="self-start overflow-hidden rounded-2xl bg-slate-950 text-white shadow-xl dark:border dark:border-slate-800">
            {selectedUser ? (
              <>
                <div className="border-b border-white/10 p-6">
                  <div className="flex items-center gap-3">
                    <Avatar user={selectedUser} large />
                    <div className="min-w-0">
                      <p className="truncate font-bold">{selectedUser.name}</p>
                      <p className="truncate text-xs text-slate-400">{selectedUser.email}</p>
                    </div>
                  </div>
                  <span className={`mt-4 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${selectedUser.role === "super_admin" ? "bg-amber-300 text-amber-950" : selectedUser.role === "admin" ? "bg-violet-300 text-violet-950" : "bg-white/10 text-slate-200"}`}>
                    {roleLabels[selectedUser.role]}
                  </span>
                </div>
                <div className="p-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Study snapshot</p>
                  <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5">
                    <div><p className="text-xl font-bold">{selectedUser.study.materials}</p><p className="text-[11px] text-slate-400">Materials</p></div>
                    <div><p className="text-xl font-bold">{selectedUser.study.flashcards}</p><p className="text-[11px] text-slate-400">Flashcards</p></div>
                    <div><p className="text-xl font-bold">{selectedUser.study.quizAttempts}</p><p className="text-[11px] text-slate-400">Quiz attempts</p></div>
                    <div><p className="text-xl font-bold">{selectedUser.study.quizAverage ?? "—"}%</p><p className="text-[11px] text-slate-400">Quiz average</p></div>
                  </div>

                  <div className="mt-6 space-y-3 border-t border-white/10 pt-5 text-xs">
                    <div className="flex justify-between gap-4"><span className="text-slate-400">Completed tasks</span><strong>{selectedUser.study.completedTasks}/{selectedUser.study.tasks}</strong></div>
                    <div className="flex justify-between gap-4"><span className="text-slate-400">Reviewed cards</span><strong>{selectedUser.study.reviewedFlashcards}</strong></div>
                    <div className="flex justify-between gap-4"><span className="text-slate-400">School</span><strong className="text-right">{selectedUser.profile?.school || "Not added"}</strong></div>
                    <div className="flex justify-between gap-4"><span className="text-slate-400">Grade</span><strong>{selectedUser.profile?.grade || "Not added"}</strong></div>
                  </div>

                  <div className="mt-6 rounded-xl bg-white/5 p-4">
                    <div className="mb-2 flex items-center gap-2"><Sparkles size={14} className="text-indigo-300" /><p className="text-[11px] font-semibold">Account activity</p></div>
                    <p className="text-[11px] text-slate-400">Last active</p>
                    <p className="mt-1 text-xs font-medium">{formatDate(selectedUser.lastActiveAt)}</p>
                    <p className="mt-3 text-[11px] text-slate-400">Activity reference</p>
                    <p className="mt-1 text-xs font-medium">{formatDate(selectedUser.inactivity?.referenceAt, "No activity recorded")}</p>
                    <p className="mt-3 text-[11px] text-slate-400">Member since</p>
                    <p className="mt-1 text-xs font-medium">{formatDate(selectedUser.createdAt)}</p>
                    <div className="mt-4 rounded-lg bg-indigo-500/15 px-3 py-2 text-[11px] font-semibold text-indigo-200">
                      {selectedUser.inactivity?.inactiveDays > 0
                        ? `Last recorded activity ${selectedUser.inactivity.inactiveDays} day${selectedUser.inactivity.inactiveDays === 1 ? "" : "s"} ago`
                        : "Active today"}
                    </div>
                  </div>

                  {payload.permissions?.canDeleteAccounts && selectedUser.deletion?.allowed && (
                    <button
                      type="button"
                      disabled={deletingId === selectedUser.id}
                      onClick={() => deleteUserAccount(selectedUser)}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-3 text-xs font-bold text-white transition hover:bg-rose-600 disabled:opacity-50"
                    >
                      <Trash2 size={15} />
                      {deletingId === selectedUser.id ? "Deleting account..." : "Delete account"}
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-sm text-slate-400">Select an account to view details.</div>
            )}
          </aside>
        </div>

        {/* <div className="mt-6 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-500/10 dark:text-amber-300">
          <CheckCircle2 className="mt-0.5 shrink-0" size={15} />
          <p>
            Super admins are controlled only by <code className="font-bold">backend/config/superAdmins.js</code>. Normal admins can view this panel, but only a super admin can manage roles or permanently delete a student or normal-admin account.
          </p>
        </div> */}
      </div>
    </div>
  );
}
