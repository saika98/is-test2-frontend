import { useEffect, useState } from "react";
import { api } from "./lib/api";
import type { User, Company } from "./types";

type NewUser = { userName: string; companyId: number | "" };
type EditUser = { id: number | ""; userName: string; companyId: number | "" };

type NewCompany = { companyName: string; companyAddress: string };
type EditCompany = { companyId: number | ""; companyName: string; companyAddress: string };

export default function App() {
  // データ
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);

  // ユーザー用フォーム
  const [newUser, setNewUser] = useState<NewUser>({ userName: "", companyId: "" });
  const [editUser, setEditUser] = useState<EditUser>({ id: "", userName: "", companyId: "" });

  // 会社用フォーム
  const [newCompany, setNewCompany] = useState<NewCompany>({ companyName: "", companyAddress: "" });
  const [editCompany, setEditCompany] = useState<EditCompany>({ companyId: "", companyName: "", companyAddress: "" });

  // 初期ロード & 操作後に再取得
  const loadUsers = async () => {
    const res = await api.get<User[]>("/api/users");
    setUsers(res.data);
  };
  const loadCompanies = async () => {
    const res = await api.get<Company[]>("/api/companies");
    setCompanies(res.data);
  };

  useEffect(() => {
    // 画面表示時に両方ロード
    loadUsers();
    loadCompanies();
  }, []);

  // ---------- Users: CRUD ----------
  const createUser = async () => {
    if (!newUser.userName || newUser.companyId === "") return alert("UserName と CompanyID を入力してください");
    await api.post("/api/users", {
      userName: newUser.userName,
      companyId: Number(newUser.companyId),
    });
    setNewUser({ userName: "", companyId: "" });
    await loadUsers();
  };

  const updateUser = async () => {
    if (editUser.id === "" || !editUser.userName || editUser.companyId === "") {
      return alert("ID / UserName / CompanyID を入力してください");
    }
    await api.put(`/api/users/${editUser.id}`, {
      userName: editUser.userName,
      companyId: Number(editUser.companyId),
    });
    setEditUser({ id: "", userName: "", companyId: "" });
    await loadUsers();
  };

  const deleteUser = async (id: number) => {
    if (!confirm(`User(ID: ${id}) を削除しますか？`)) return;
    await api.delete(`/api/users/${id}`);
    await loadUsers();
  };

  const pickUserForEdit = (u: User) => {
    setEditUser({ id: u.id, userName: u.userName, companyId: u.companyId });
  };

  // ---------- Companies: CRUD ----------
  const createCompany = async () => {
    if (!newCompany.companyName) return alert("CompanyName を入力してください");
    await api.post("/api/companies", {
      companyName: newCompany.companyName,
      companyAddress: newCompany.companyAddress,
    });
    setNewCompany({ companyName: "", companyAddress: "" });
    await loadCompanies();
  };

  const updateCompany = async () => {
    if (editCompany.companyId === "" || !editCompany.companyName) {
      return alert("CompanyID / CompanyName を入力してください");
    }
    await api.put(`/api/companies/${editCompany.companyId}`, {
      companyName: editCompany.companyName,
      companyAddress: editCompany.companyAddress,
    });
    setEditCompany({ companyId: "", companyName: "", companyAddress: "" });
    await loadCompanies();
  };

  const deleteCompany = async (companyId: number) => {
    if (!confirm(`Company(ID: ${companyId}) を削除しますか？`)) return;
    await api.delete(`/api/companies/${companyId}`);
    await loadCompanies();
  };

  const pickCompanyForEdit = (c: Company) => {
    setEditCompany({
      companyId: c.companyId,
      companyName: c.companyName,
      companyAddress: c.companyAddress ?? "",
    });
  };

  return (
    <div className="min-h-screen p-6 space-y-10">
      <h1 className="text-2xl font-bold">Data Manager</h1>

      {/* Users セクション */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Users</h2>
          <div className="flex gap-2">
            <button onClick={loadUsers} className="px-3 py-2 rounded-2xl shadow border">再読込</button>
          </div>
        </div>

        {/* Create / Update フォーム（横並び） */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Create User */}
          <div className="rounded-2xl border p-4 shadow-sm">
            <h3 className="font-semibold mb-3">Create User</h3>
            <div className="grid grid-cols-3 gap-3 items-center">
              <label className="text-sm text-gray-600 col-span-1">UserName</label>
              <input
                className="col-span-2 border rounded-lg px-3 py-2"
                value={newUser.userName}
                onChange={(e) => setNewUser((s) => ({ ...s, userName: e.target.value }))}
                placeholder="e.g. Alice"
              />
              <label className="text-sm text-gray-600 col-span-1">CompanyID</label>
              <input
                className="col-span-2 border rounded-lg px-3 py-2"
                type="number"
                value={newUser.companyId}
                onChange={(e) => setNewUser((s) => ({ ...s, companyId: e.target.value === "" ? "" : Number(e.target.value) }))}
                placeholder="e.g. 1"
              />
            </div>
            <div className="mt-3">
              <button onClick={createUser} className="px-4 py-2 rounded-2xl shadow border">作成</button>
            </div>
          </div>

          {/* Update User */}
          <div className="rounded-2xl border p-4 shadow-sm">
            <h3 className="font-semibold mb-3">Update User</h3>
            <div className="grid grid-cols-3 gap-3 items-center">
              <label className="text-sm text-gray-600 col-span-1">ID</label>
              <input
                className="col-span-2 border rounded-lg px-3 py-2"
                type="number"
                value={editUser.id}
                onChange={(e) => setEditUser((s) => ({ ...s, id: e.target.value === "" ? "" : Number(e.target.value) }))}
                placeholder="編集対象のID"
              />
              <label className="text-sm text-gray-600 col-span-1">UserName</label>
              <input
                className="col-span-2 border rounded-lg px-3 py-2"
                value={editUser.userName}
                onChange={(e) => setEditUser((s) => ({ ...s, userName: e.target.value }))}
              />
              <label className="text-sm text-gray-600 col-span-1">CompanyID</label>
              <input
                className="col-span-2 border rounded-lg px-3 py-2"
                type="number"
                value={editUser.companyId}
                onChange={(e) => setEditUser((s) => ({ ...s, companyId: e.target.value === "" ? "" : Number(e.target.value) }))}
              />
            </div>
            <div className="mt-3">
              <button onClick={updateUser} className="px-4 py-2 rounded-2xl shadow border">更新</button>
            </div>
            <p className="text-xs text-gray-500 mt-2">※ テーブルの「編集」ボタンで入力欄に転記できます</p>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto rounded-2xl border">
          <table className="min-w-[640px] table-auto border-collapse">
            <thead>
              <tr className="text-left border-b bg-gray-50">
                <th className="py-2 px-3">ID</th>
                <th className="py-2 px-3">UserName</th>
                <th className="py-2 px-3">CompanyID</th>
                <th className="py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b">
                  <td className="py-2 px-3">{u.id}</td>
                  <td className="py-2 px-3">{u.userName}</td>
                  <td className="py-2 px-3">{u.companyId}</td>
                  <td className="py-2 px-3">
                    <div className="flex gap-2">
                      <button className="px-3 py-1 rounded-xl border shadow-sm" onClick={() => pickUserForEdit(u)}>編集</button>
                      <button className="px-3 py-1 rounded-xl border shadow-sm" onClick={() => deleteUser(u.id)}>削除</button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td className="py-4 px-3 text-gray-500" colSpan={4}>ユーザーはまだありません</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Companies セクション */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Companies</h2>
          <div className="flex gap-2">
            <button onClick={loadCompanies} className="px-3 py-2 rounded-2xl shadow border">再読込</button>
          </div>
        </div>

        {/* Create / Update フォーム（横並び） */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Create Company */}
          <div className="rounded-2xl border p-4 shadow-sm">
            <h3 className="font-semibold mb-3">Create Company</h3>
            <div className="grid grid-cols-3 gap-3 items-center">
              <label className="text-sm text-gray-600 col-span-1">CompanyName</label>
              <input
                className="col-span-2 border rounded-lg px-3 py-2"
                value={newCompany.companyName}
                onChange={(e) => setNewCompany((s) => ({ ...s, companyName: e.target.value }))}
                placeholder="e.g. ACME Inc."
              />
              <label className="text-sm text-gray-600 col-span-1">CompanyAddress</label>
              <input
                className="col-span-2 border rounded-lg px-3 py-2"
                value={newCompany.companyAddress}
                onChange={(e) => setNewCompany((s) => ({ ...s, companyAddress: e.target.value }))}
                placeholder="住所（任意）"
              />
            </div>
            <div className="mt-3">
              <button onClick={createCompany} className="px-4 py-2 rounded-2xl shadow border">作成</button>
            </div>
          </div>

          {/* Update Company */}
          <div className="rounded-2xl border p-4 shadow-sm">
            <h3 className="font-semibold mb-3">Update Company</h3>
            <div className="grid grid-cols-3 gap-3 items-center">
              <label className="text-sm text-gray-600 col-span-1">CompanyID</label>
              <input
                className="col-span-2 border rounded-lg px-3 py-2"
                type="number"
                value={editCompany.companyId}
                onChange={(e) => setEditCompany((s) => ({ ...s, companyId: e.target.value === "" ? "" : Number(e.target.value) }))}
                placeholder="編集対象のID"
              />
              <label className="text-sm text-gray-600 col-span-1">CompanyName</label>
              <input
                className="col-span-2 border rounded-lg px-3 py-2"
                value={editCompany.companyName}
                onChange={(e) => setEditCompany((s) => ({ ...s, companyName: e.target.value }))}
              />
              <label className="text-sm text-gray-600 col-span-1">CompanyAddress</label>
              <input
                className="col-span-2 border rounded-lg px-3 py-2"
                value={editCompany.companyAddress}
                onChange={(e) => setEditCompany((s) => ({ ...s, companyAddress: e.target.value }))}
              />
            </div>
            <div className="mt-3">
              <button onClick={updateCompany} className="px-4 py-2 rounded-2xl shadow border">更新</button>
            </div>
            <p className="text-xs text-gray-500 mt-2">※ テーブルの「編集」ボタンで入力欄に転記できます</p>
          </div>
        </div>

        {/* Companies Table */}
        <div className="overflow-x-auto rounded-2xl border">
          <table className="min-w-[720px] table-auto border-collapse">
            <thead>
              <tr className="text-left border-b bg-gray-50">
                <th className="py-2 px-3">CompanyID</th>
                <th className="py-2 px-3">CompanyName</th>
                <th className="py-2 px-3">CompanyAddress</th>
                <th className="py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.companyId} className="border-b">
                  <td className="py-2 px-3">{c.companyId}</td>
                  <td className="py-2 px-3">{c.companyName}</td>
                  <td className="py-2 px-3">{c.companyAddress}</td>
                  <td className="py-2 px-3">
                    <div className="flex gap-2">
                      <button className="px-3 py-1 rounded-xl border shadow-sm" onClick={() => pickCompanyForEdit(c)}>編集</button>
                      <button className="px-3 py-1 rounded-xl border shadow-sm" onClick={() => deleteCompany(c.companyId)}>削除</button>
                    </div>
                  </td>
                </tr>
              ))}
              {companies.length === 0 && (
                <tr>
                  <td className="py-4 px-3 text-gray-500" colSpan={4}>会社はまだありません</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
