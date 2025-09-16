import React, { useState } from "react";

// .env で VITE_API_BASE_URL=http://localhost:8080 を設定しておく
const API = (import.meta as any).env.VITE_API_BASE_URL || "http://localhost:8080";
type InitResp = { resumeId: string; s3Key: string; uploadUrl: string };

export default function ResumeUploader() {
  const [rows, setRows] = useState<InitResp[]>([]);
  const [busy, setBusy] = useState(false);

  // テスト用に固定。実際はフォームから入れる想定
  const candidateId = "11111111-1111-1111-1111-111111111111";
  const uploadedBy = "saika";

  const onSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const files = Array.from(e.target.files);
    console.log("files情報", files);
    setBusy(true);
    try {
      // 1) 初期化（プリサインURL発行 + DBにPENDING）
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
      const inits: InitResp[] = await initRes.json();

      // 2) 直接S3にPUT
      await Promise.all(
        inits.map((it, i) =>
          fetch(it.uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": files[i].type || "application/octet-stream" },
            body: files[i],
          }).then(r => {
            if (!r.ok) throw new Error(`upload failed: ${files[i].name}`);
          })
        )
      );

      // 3) 完了報告（DBをCOMPLETEDに & size/ETag確定）
      await fetch(`${API}/api/resumes/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeIds: inits.map(x => x.resumeId) }),
      });

      setRows(prev => [...inits, ...prev]);
      alert("アップロード完了");
    } catch (e: any) {
      alert(e?.message ?? "upload error");
    } finally {
      setBusy(false);
      e.target.value = ""; // 同じファイルの再選択を許可
    }
  };

  const download = async (resumeId: string) => {
    const r = await fetch(`${API}/api/resumes/${resumeId}/download-url`);
    const { url } = await r.json();
    window.open(url, "_blank");
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Resume Uploader</h2>
      <input type="file" multiple onChange={onSelect} disabled={busy} />
      <ul>
        {rows.map(r => (
          <li key={r.resumeId}>
            <code>{r.s3Key}</code>{" "}
            <button onClick={() => download(r.resumeId)}>ダウンロード</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
