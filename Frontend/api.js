(() => {
  const configuredBase = window.FLYVORA_API_BASE;
  
  let defaultBase = "http://localhost:8000/api";
  if (typeof window !== "undefined" && window.location) {
    if (window.location.protocol.startsWith("http")) {
      if (window.location.port === "8000") {
        defaultBase = `${window.location.origin}/api`;
      } else {
        // When opened from VS Code Live Server (port 5500, 5501, 3000, etc.),
        // route API requests to the backend running on port 8000
        const hostname = window.location.hostname || "localhost";
        defaultBase = `http://${hostname}:8000/api`;
      }
    }
  }

  const baseUrl = (configuredBase || defaultBase).replace(/\/$/, "");

  async function get(path, query = {}) {
    const url = new URL(`${baseUrl}${path}`);
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, value);
    });

    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`API request failed (${response.status}): ${path}`);
    return response.json();
  }

  window.FlyvoraApi = { get };
})();
