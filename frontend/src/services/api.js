const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// helper: parse error message from response body if available
async function handleResponse(res) {
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // body wasn't JSON, use default message
    }
    throw new Error(message);
  }
  return res.json();
}

// GET /api/history — fetch all non-deleted history items
export async function getHistory() {
  const res = await fetch(`${API_BASE}/history`);
  return handleResponse(res);
}

// POST /api/history — save a new calculation result
export async function saveHistory(item) {
  const res = await fetch(`${API_BASE}/history`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
  return handleResponse(res);
}

// PATCH /api/history/:id/soft-delete — soft-delete an item by id
export async function softDeleteHistory(id) {
  const res = await fetch(`${API_BASE}/history/${id}/soft-delete`, {
    method: "PATCH",
  });
  return handleResponse(res);
}
