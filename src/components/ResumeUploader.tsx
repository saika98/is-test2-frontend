import React, { useEffect, useState } from "react";
// クラウドの場合
// const DEFAULT_API_BASE_URL = "http://is-test-backend-java-env.eba-jz65xr2a.ap-northeast-3.elasticbeanstalk.com";
// ローカルの場合
const DEFAULT_API_BASE_URL = "http://localhost:8080";

const API = (import.meta as any).env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;

// 既存のアップロード返却 + 一覧返却のどちらでも扱えるようにする
type Row = {
  resumeId: string;
  s3Key: string;
  uploadUrl?: string;      // init-uploads時のみ
  originalName?: string;   // 一覧APIで付与
  status?: string;         // 一覧APIで付与
  fileSizeBytes?: number;  // 一覧APIで付与
  etag?: string;           // 一覧APIで付与
  updatedAt?: string;      // 一覧APIで付与
};

export default function ResumeUploader() {
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);

  const candidateId = "11111111-1111-1111-1111-111111111111";
  const uploadedBy = "saika";

  // ★ 初期表示で一覧取得
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API}/api/resumes?candidateId=${candidateId}`);
        if (!r.ok) throw new Error("list failed");
        const data: Row[] = await r.json();
        setRows(data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const onSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const files = Array.from(e.target.files);
    setBusy(true);
    try {
      // 1) 初期化
      const payload = {
        candidateId,
        uploadedBy,
        files: files.map(f => ({ name: f.name, contentType: f.type || "application/octet-stream" })),
      };
      const initRes = await fetch(`${API}/api/resumes/init-uploads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!initRes.ok) throw new Error("init-uploads failed");
      const inits: Row[] = await initRes.json();

      // 2) S3にPUT
      await Promise.all(
        inits.map((it, i) =>
          fetch(it.uploadUrl!, {
            method: "PUT",
            headers: { "Content-Type": files[i].type || "application/octet-stream" },
            body: files[i],
          }).then(r => {
            if (!r.ok) throw new Error(`upload failed: ${files[i].name}`);
          })
        )
      );

      // 3) 完了報告
      await fetch(`${API}/api/resumes/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeIds: inits.map(x => x.resumeId) }),
      });

      // 4) 画面更新：アップロード直後の行を先頭に追加（originalName等は未設定でもOK）
      setRows(prev => [...inits, ...prev]);

      alert("アップロード完了");
    } catch (e: any) {
      alert(e?.message ?? "upload error");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  const download = async (resumeId: string) => {
    const r = await fetch(`${API}/api/resumes/${resumeId}/download-url`);
    const { url } = await r.json();
    window.open(url, "_blank");
  };

  // ★ 削除ハンドラ（1件）
  const removeOne = async (resumeId: string) => {
    if (!confirm("このファイルを削除しますか？")) return;
    // 楽観的更新
    const prev = rows;
    setRows(prev => prev.filter(r => r.resumeId !== resumeId));
    try {
      const res = await fetch(`${API}/api/resumes/${resumeId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("delete failed");
      // 204 No Content を想定。OKなら何もしない
    } catch (e) {
      alert("削除に失敗しました。リストを戻します。");
      setRows(prev); // ロールバック
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Resume Uploader</h2>

      <div style={{ marginBottom: 12 }}>
        <button
          disabled={busy}
          onClick={async () => {
            // 手動リロードボタン（任意）
            const r = await fetch(`${API}/api/resumes?candidateId=${candidateId}`);
            const data: Row[] = await r.json();
            setRows(data);
          }}
        >
          一覧を再読込
        </button>
      </div>

      <input type="file" multiple onChange={onSelect} disabled={busy} />
      <ul>
        {rows.map(r => (
          <li key={r.resumeId}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <code title={r.s3Key}>{r.originalName ?? r.s3Key}</code>
              {typeof r.fileSizeBytes === "number" && <span>({r.fileSizeBytes} bytes)</span>}
              {r.status && <span>status: {r.status}</span>}
              <button onClick={() => download(r.resumeId)}>ダウンロード</button>
              <button onClick={() => removeOne(r.resumeId)}>削除</button> 
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
