export async function GET() {
  try {
    const base = process.env.NEXT_PUBLIC_PYTHON_API_URL ?? 'http://localhost:8000'
    const res = await fetch(`${base}/api/real/solar/current`, {
      next: { revalidate: 300 }
    })
    if (!res.ok) throw new Error(`${res.status}`)
    return Response.json(await res.json())
  } catch (err) {
    return Response.json({ error: 'Solar data unavailable' }, { status: 503 })
  }
}