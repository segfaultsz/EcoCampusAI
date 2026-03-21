export async function GET() {
  try {
    const base = process.env.NEXT_PUBLIC_PYTHON_API_URL ?? 'http://localhost:8000'
    const res = await fetch(`${base}/api/real/sunrise-sunset`, {
      next: { revalidate: 86400 }
    })
    if (!res.ok) throw new Error(`${res.status}`)
    return Response.json(await res.json())
  } catch (err) {
    const today = new Date().toISOString().split('T')[0]
    return Response.json({
      sunrise: today + 'T06:05:00+05:30',
      sunset: today + 'T18:15:00+05:30',
      day_length_hrs: 12.17,
      solar_noon: today + 'T12:10:00+05:30',
      source: 'fallback'
    })
  }
}