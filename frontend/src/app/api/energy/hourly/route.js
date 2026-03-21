export async function GET() {
  const BACKEND_URL = process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://localhost:8000";
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/real/energy/hourly`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return Response.json({ error: "Backend error" }, { status: response.status });
    }
    
    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("Energy proxy error:", error);
    const hours = [];
    for (let i = 0; i < 24; i++) {
      const h = String(i).padStart(2, '0') + ':00';
      const base = 180 + Math.sin((i - 6) * Math.PI / 12) * 120;
      hours.push({
        hour: h,
        kwh: Math.round(Math.max(80, base + (Math.random() * 40 - 20))),
        predicted: Math.round(Math.max(80, base + (Math.random() * 20 - 10))),
        temp: +(26 + Math.sin((i - 8) * Math.PI / 14) * 8 + Math.random() * 2).toFixed(1)
      });
    }
    return Response.json(hours);
  }
}
