import { useState } from "react";
import { api } from "./lib/api";
import type { User, Company } from "./types";

type Row = User | Company;

function isUser(r: Row): r is User {
  return (r as User).userName !== undefined && (r as User).companyId !== undefined;
}

export default function App() {
  const [rows, setRows] = useState<Row[]>([]);
  const [title, setTitle] = useState<string>("");

  const loadUsers = async () => {
    setTitle("Users");
    const res = await api.get<User[]>("/api/users");
    setRows(res.data);
  };

  const loadCompanies = async () => {
    setTitle("Companies");
    const res = await api.get<Company[]>("/api/companies");
    setRows(res.data);
  };

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">Data Viewer</h1>

      <div className="flex gap-3 mb-6">
        <button onClick={loadUsers} className="px-4 py-2 rounded-2xl shadow border">Users</button>
        <button onClick={loadCompanies} className="px-4 py-2 rounded-2xl shadow border">Companies</button>
      </div>

      <h2 className="text-xl font-semibold mb-2">{title}</h2>

      <div className="overflow-x-auto">
        <table className="min-w-[480px] table-auto border-collapse">
          <thead>
            <tr className="text-left border-b">
              {title === "Users" ? (
                <>
                  <th className="py-2 pr-4">ID</th>
                  <th className="py-2 pr-4">UserName</th>
                  <th className="py-2 pr-4">CompanyID</th>
                </>
              ) : (
                <>
                  <th className="py-2 pr-4">CompanyID</th>
                  <th className="py-2 pr-4">CompanyName</th>
                  <th className="py-2 pr-4">CompanyAddress</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b">
                {isUser(r) ? (
                  <>
                    <td className="py-2 pr-4">{r.id}</td>
                    <td className="py-2 pr-4">{r.userName}</td>
                    <td className="py-2 pr-4">{r.companyId}</td>
                  </>
                ) : (
                  <>
                    <td className="py-2 pr-4">{(r as Company).companyId}</td>
                    <td className="py-2 pr-4">{(r as Company).companyName}</td>
                    <td className="py-2 pr-4">{(r as Company).companyAddress}</td>
                  </>
                )}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="py-4 text-gray-500" colSpan={3}>
                  ボタンを押してデータを取得してください
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
