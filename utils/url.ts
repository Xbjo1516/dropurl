// /utils/url.ts
export function normalizeUrl(raw: string): string {
  try {
    let s = raw.trim();
    if (!s) return "";
    if (!s.startsWith("http://") && !s.startsWith("https://")) {
      s = `https://${s}`;
    }

    const u = new URL(s);
    u.hostname = u.hostname.toLowerCase();

    if (
      (u.protocol === "http:" && u.port === "80") ||
      (u.protocol === "https:" && u.port === "443")
    ) {
      u.port = "";
    }

    let pathname = u.pathname || "/";
    if (pathname !== "/" && pathname.endsWith("/")) {
      pathname = pathname.replace(/\/+$/, "");
    }

    const searchParams = [...u.searchParams.entries()];
    searchParams.sort(
      (a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1])
    );

    const query = searchParams
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&");

    const protocol = u.protocol;
    const host = u.hostname + (u.port ? ":" + u.port : "");
    const search = query ? `?${query}` : "";

    return `${protocol}//${host}${pathname}${search}`;
  } catch (e) {
    return raw.trim();
  }
}
