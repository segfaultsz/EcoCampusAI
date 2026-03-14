import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export async function GET() {
  try {
    const { data: energy, error } = await supabase
      .from('energy_readings')
      .select('building_id, consumption_kwh, timestamp, buildings(name, code, type)')
      .order('timestamp', { ascending: false })
      .limit(50)
    if (error) throw error

    const { data: solar } = await supabase
      .from('solar_readings')
      .select('irradiance_wm2, cloud_cover_pct, temp_c, timestamp')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single()

    const seen = new Set()
    const buildings = (energy ?? []).filter(r => {
      if (seen.has(r.building_id)) return false
      seen.add(r.building_id)
      return true
    })

    return Response.json({ buildings, solar })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}