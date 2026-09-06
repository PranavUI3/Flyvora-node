(() => {
  const configuredBase = window.FLYVORA_API_BASE;
  const baseUrl = (configuredBase || "http://localhost:8000/api").replace(/\/$/, "");

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
