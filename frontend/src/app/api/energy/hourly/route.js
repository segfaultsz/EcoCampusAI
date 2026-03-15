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
    return Response.json({ error: "Connection failed" }, { status: 500 });
  }
}
