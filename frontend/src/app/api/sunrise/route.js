export async function GET() {
  try {
    const base = process.env.NEXT_PUBLIC_PYTHON_API_URL ?? 'http://localhost:8000'
    const res = await fetch(`${base}/api/real/sunrise-sunset`, {
      next: { revalidate: 86400 }
    })
    if (!res.ok) throw new Error(`${res.status}`)
    return Response.json(await res.json())
  } catch (err) {
    return Response.json({ error: 'Sunrise data unavailable' }, { status: 503 })
  }
}