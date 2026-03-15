export async function GET() {
  try {
    const base = process.env.NEXT_PUBLIC_PYTHON_API_URL ?? 'http://localhost:8000'
    const res = await fetch(`${base}/api/real/aqi/current`, {
      next: { revalidate: 1800 }
    })
    if (!res.ok) throw new Error(`${res.status}`)
    return Response.json(await res.json())
  } catch (err) {
    // Fallback: return simulated AQI so the card always renders
    const baseAqi = 65 + Math.floor(Math.random() * 50)
    return Response.json({
      aqi: baseAqi,
      pm25: +(baseAqi * 0.4 + (Math.random() * 10 - 5)).toFixed(1),
      pm10: +(baseAqi * 0.8 + (Math.random() * 20 - 10)).toFixed(1),
      station_name: 'Bhubaneswar (Simulated)',
      source: 'fallback'
    })
  }
}
