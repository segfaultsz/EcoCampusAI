export async function GET() {
  try {
    const base = process.env.NEXT_PUBLIC_PYTHON_API_URL ?? 'http://localhost:8000'
    const res = await fetch(`${base}/api/real/solar/current`, {
      next: { revalidate: 300 }
    })
    if (!res.ok) throw new Error(`${res.status}`)
    return Response.json(await res.json())
  } catch (err) {
    return Response.json({
      irradiance_wm2: Math.round(200 + Math.random() * 600),
      cloud_cover_pct: Math.round(10 + Math.random() * 50),
      temp_c: +(28 + Math.random() * 8).toFixed(1),
      timestamp: new Date().toISOString(),
      source: 'fallback'
    })
  }
}