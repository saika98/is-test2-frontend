import { useEffect, useState } from "react";
import { api } from "./lib/api";
import type { User, Company } from "./types";

type NewUser = { userName: string; companyId: number | "" };
type EditUser = { id: number | ""; userName: string; companyId: number | "" };

type NewCompany = { companyName: string; companyAddress: string };
type EditCompany = { companyId: number | ""; companyName: string; companyAddress: string };

export default function App() {

  const [message, setMessage] = useState<string>("");
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
  const loadMessage = async() => {
    const res = await api.get<string>("/api/message");
    setMessage(res.data);
  }
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
    loadMessage(); 
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
  <div className="min-h-screen bg-gray-100 py-10">
    <div className="max-w-5xl mx-auto space-y-10">
      <h1 className="text-3xl font-bold text-center text-gray-800">
        Data Manager
      </h1>

      {/* メッセージ */}
      <section className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">
          バックエンド接続確認
        </h2>
        <p className="text-gray-600">{message || "未取得"}</p>
      </section>

      {/* Users セクション */}
      <section className="bg-white p-6 rounded-2xl shadow space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-800">ユーザーテーブル</h2>
          <button
            onClick={loadUsers}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
          >
            再読込
          </button>
        </div>

        {/* Create / Update フォーム */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Create User */}
          <div className="p-4 border rounded-xl bg-gray-50">
            <h3 className="font-semibold text-gray-700 mb-3">ユーザー作成</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600">ユーザー名</label>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  value={newUser.userName}
                  onChange={(e) =>
                    setNewUser((s) => ({ ...s, userName: e.target.value }))
                  }
                  placeholder="e.g. Alice"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">会社ID</label>
                <input
                  type="number"
                  className="w-full border rounded-lg px-3 py-2"
                  value={newUser.companyId}
                  onChange={(e) =>
                    setNewUser((s) => ({
                      ...s,
                      companyId: e.target.value === "" ? "" : Number(e.target.value),
                    }))
                  }
                  placeholder="e.g. 1"
                />
              </div>
              <button
                onClick={createUser}
                className="w-full px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600"
              >
                作成
              </button>
            </div>
          </div>

          {/* Update User */}
          <div className="p-4 border rounded-xl bg-gray-50">
            <h3 className="font-semibold text-gray-700 mb-3">ユーザー更新</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600">ID</label>
                <input
                  type="number"
                  className="w-full border rounded-lg px-3 py-2"
                  value={editUser.id}
                  onChange={(e) =>
                    setEditUser((s) => ({
                      ...s,
                      id: e.target.value === "" ? "" : Number(e.target.value),
                    }))
                  }
                  placeholder="編集対象のID"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">ユーザー名</label>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  value={editUser.userName}
                  onChange={(e) =>
                    setEditUser((s) => ({ ...s, userName: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">会社ID</label>
                <input
                  type="number"
                  className="w-full border rounded-lg px-3 py-2"
                  value={editUser.companyId}
                  onChange={(e) =>
                    setEditUser((s) => ({
                      ...s,
                      companyId: e.target.value === "" ? "" : Number(e.target.value),
                    }))
                  }
                />
              </div>
              <button
                onClick={updateUser}
                className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg shadow hover:bg-yellow-600"
              >
                更新
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto rounded-xl border">
          <table className="min-w-[640px] w-full border-collapse">
            <thead>
              <tr className="bg-gray-700 text-white">
                <th className="py-2 px-3">ID</th>
                <th className="py-2 px-3">UserName</th>
                <th className="py-2 px-3">CompanyID</th>
                <th className="py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr
                  key={u.id}
                  className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="py-2 px-3">{u.id}</td>
                  <td className="py-2 px-3">{u.userName}</td>
                  <td className="py-2 px-3">{u.companyId}</td>
                  <td className="py-2 px-3 flex gap-2">
                    <button
                      className="px-3 py-1 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                      onClick={() => pickUserForEdit(u)}
                    >
                      編集
                    </button>
                    <button
                      className="px-3 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600"
                      onClick={() => deleteUser(u.id)}
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td className="py-4 px-3 text-gray-500 text-center" colSpan={4}>
                    ユーザーはまだありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Companies セクションも同様に整える */}
      {/* Companies セクション */}
      <section className="bg-white p-6 rounded-2xl shadow space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-800">会社テーブル</h2>
          <button
            onClick={loadCompanies}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
          >
            再読込
          </button>
        </div>

        {/* Create / Update フォーム */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Create Company */}
          <div className="p-4 border rounded-xl bg-gray-50">
            <h3 className="font-semibold text-gray-700 mb-3">会社作成</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600">会社名</label>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  value={newCompany.companyName}
                  onChange={(e) => setNewCompany((s) => ({ ...s, companyName: e.target.value }))}
                  placeholder="株式会社IS"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">会社住所</label>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  value={newCompany.companyAddress}
                  onChange={(e) => setNewCompany((s) => ({ ...s, companyAddress: e.target.value }))}
                  placeholder="大阪府大阪市"
                />
              </div>
              <button
                onClick={createCompany}
                className="w-full px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600"
              >
                作成
              </button>
            </div>
          </div>

          {/* Update Company */}
          <div className="p-4 border rounded-xl bg-gray-50">
            <h3 className="font-semibold text-gray-700 mb-3">会社更新</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600">ID</label>
                <input
                  type="number"
                  className="w-full border rounded-lg px-3 py-2"
                  value={editCompany.companyId}
                  onChange={(e) =>
                    setEditCompany((s) => ({
                      ...s,
                      id: e.target.value === "" ? "" : Number(e.target.value),
                    }))
                  }
                  placeholder="編集対象のID"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">会社名</label>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  value={editCompany.companyName}
                  onChange={(e) => setEditCompany((s) => ({ ...s, companyName: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">会社住所</label>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  value={editCompany.companyAddress}
                  onChange={(e) => setEditCompany((s) => ({ ...s, companyAddress: e.target.value }))}
                />
              </div>
              <button
                onClick={updateCompany}
                className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg shadow hover:bg-yellow-600"
              >
                更新
              </button>
            </div>
          </div>
        </div>

        {/* Companies Table */}
        <div className="overflow-x-auto rounded-xl border">
          <table className="min-w-[640px] w-full border-collapse">
            <thead>
              <tr className="bg-gray-700 text-white">
                <th className="py-2 px-3">ID</th>
                <th className="py-2 px-3">CompanyName</th>
                <th className="py-2 px-3">CompanyAddress</th>
                <th className="py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c, i) => (
                <tr key={c.companyId} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="py-2 px-3">{c.companyId}</td>
                  <td className="py-2 px-3">{c.companyName}</td>
                  <td className="py-2 px-3">{c.companyAddress}</td>
                  <td className="py-2 px-3 flex gap-2">
                    <button
                      className="px-3 py-1 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                      onClick={() => pickCompanyForEdit(c)}
                    >
                      編集
                    </button>
                    <button
                      className="px-3 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600"
                      onClick={() => deleteCompany(c.companyId)}
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
              {companies.length === 0 && (
                <tr>
                  <td className="py-4 px-3 text-gray-500 text-center" colSpan={4}>
                    会社データはまだありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
);

}
