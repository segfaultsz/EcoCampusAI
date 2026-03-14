const API_URL = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8000';

export async function fetchPredictions(buildingId) {
  try {
    const res = await fetch(`${API_URL}/predict/energy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ building_id: buildingId, days: 7 }),
    });
    if (!res.ok) throw new Error('Failed to fetch predictions');
    return await res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function simulateScenario(buildingId, scenario) {
  try {
    const res = await fetch(`${API_URL}/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ building_id: buildingId, ...scenario }),
    });
    if (!res.ok) throw new Error('Failed to run simulation');
    return await res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_URL}/`);
    return await res.json();
  } catch (error) {
    return { status: 'error', message: 'Backend unreachable' };
  }
}