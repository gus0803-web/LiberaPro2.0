import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ allowed: false, error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { fingerprint } = body

    if (!fingerprint) {
      return NextResponse.json({ allowed: false, error: 'Fingerprint requerido' }, { status: 400 })
    }

    // Consultar dispositivos existentes del usuario
    const { data: devices, error: dbError } = await supabase
      .from('user_devices')
      .select('*')
      .eq('user_id', user.id)

    if (dbError) {
      console.error('Error fetching devices:', dbError)
      return NextResponse.json({ allowed: false, error: 'Error interno de base de datos' }, { status: 500 })
    }

    const existingDevice = devices?.find((d) => d.fingerprint_hash === fingerprint)

    if (existingDevice) {
      // Si el dispositivo ya existe, actualizar last_active
      await supabase
        .from('user_devices')
        .update({ last_active: new Date().toISOString() })
        .eq('id', existingDevice.id)

      return NextResponse.json({ allowed: true })
    }

    // Si es un nuevo dispositivo, comprobar el límite
    const MAX_DEVICES = 2
    if (devices && devices.length >= MAX_DEVICES) {
      return NextResponse.json({ 
        allowed: false, 
        error: 'Límite de dispositivos alcanzado. Gestiona tus accesos en configuración.' 
      }, { status: 403 })
    }

    // Si no ha alcanzado el límite, registrar el nuevo dispositivo
    const { error: insertError } = await supabase
      .from('user_devices')
      .insert({
        user_id: user.id,
        fingerprint_hash: fingerprint,
      })

    if (insertError) {
      console.error('Error inserting device:', insertError)
      return NextResponse.json({ allowed: false, error: 'Error al registrar dispositivo' }, { status: 500 })
    }

    return NextResponse.json({ allowed: true })

  } catch (error) {
    console.error('Device verification error:', error)
    return NextResponse.json({ allowed: false, error: 'Error de servidor' }, { status: 500 })
  }
}
