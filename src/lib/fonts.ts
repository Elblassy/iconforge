const loadedFonts = new Set<string>();
const SYSTEM_FONTS = ["Arial", "Georgia", "Verdana", "Courier New", "Times New Roman"];

export async function loadGoogleFont(fontFamily: string): Promise<void> {
  if (loadedFonts.has(fontFamily) || SYSTEM_FONTS.includes(fontFamily)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@300;400;700;900&display=swap`;
  document.head.appendChild(link);
  await document.fonts.ready;
  loadedFonts.add(fontFamily);
}
