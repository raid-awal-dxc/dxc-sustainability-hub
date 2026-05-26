async function renderCertificate() {
  const params = new URLSearchParams(window.location.search);
  const hostname = window.location.hostname.toLowerCase();
  const isLocalHost =
    hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  const isLocalPreviewMode = isLocalHost && params.get("preview") === "1";

  let user = null;
  if (!isLocalPreviewMode) {
    user = await requireAuth();
  }

  const moduleId = params.get("module_id");
  const code = params.get("code") || "LOCAL-PREVIEW";
  const score = params.get("score") || "100";

  let moduleTitle = params.get("module_title") || "Completed Module";
  if (moduleId && !isLocalPreviewMode) {
    const { data: mod } = await supabaseClient
      .from("modules")
      .select("title")
      .eq("id", moduleId)
      .single();
    moduleTitle = mod?.title || moduleTitle;
  }

  const metadata = user?.user_metadata || {};
  const preferredName =
    params.get("name") ||
    metadata.full_name ||
    metadata.name ||
    [metadata.first_name, metadata.last_name].filter(Boolean).join(" ") ||
    [metadata.given_name, metadata.family_name].filter(Boolean).join(" ");
  const rawName = String(preferredName || "").trim();
  const displayName = rawName.includes(",")
    ? rawName
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .reverse()
        .join(" ")
        .replace(/\s+/g, " ")
    : rawName || user?.email || "Local Preview User";
  document.getElementById("cert-name").textContent = displayName;
  document.getElementById("cert-module").textContent = moduleTitle;
  document.getElementById("cert-date").textContent =
    new Date().toLocaleDateString();
  document.getElementById("cert-score").textContent = `${score}%`;
  document.getElementById("cert-code").textContent = code;
  document
    .getElementById("download-png")
    .addEventListener("click", async () => {
      const node = document.getElementById("certificate");
      const canvas = await html2canvas(node, { scale: 2 });
      const a = document.createElement("a");
      a.download = `SustainabilityHub_Certificate_${code}.png`;
      a.href = canvas.toDataURL();
      a.click();
    });
  document
    .getElementById("download-pdf")
    .addEventListener("click", async () => {
      const node = document.getElementById("certificate");
      const canvas = await html2canvas(node, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF("landscape", "pt", "a4");
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      const iw = pw - 80;
      const ih = (canvas.height * iw) / canvas.width;
      const y = (ph - ih) / 2;
      pdf.addImage(imgData, "PNG", 40, y, iw, ih);
      pdf.save(`SustainabilityHub_Certificate_${code}.pdf`);
    });
}
