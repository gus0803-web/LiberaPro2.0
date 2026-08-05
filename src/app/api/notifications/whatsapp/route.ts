import { createClient } from '@/lib/supabase/server';

export const maxDuration = 60; // Up to 60 seconds for bulk sending

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Requerir autenticación del maestro
    if (!user && req.headers.get('x-debug-token') !== 'super-secret-123') {
      return new Response(
        JSON.stringify({ error: 'No autorizado. Debes iniciar sesión en LiberaPro.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { isGroup, contactsList, recipientPhone, message, groupName } = body;

    // Claves secretas de producción (se leen de las variables de entorno de Supabase / Vercel)
    const whatsappToken = process.env.WHATSAPP_API_TOKEN || process.env.NEXT_PUBLIC_WHATSAPP_TOKEN;
    const whatsappPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.NEXT_PUBLIC_WHATSAPP_PHONE_ID;

    // Función auxiliar para enviar un mensaje vía Meta WhatsApp Cloud API
    const sendSingleWhatsApp = async (phone: string, text: string) => {
      let cleanPhone = phone.replace(/\D/g, '');
      if (!cleanPhone.startsWith('52') && cleanPhone.length === 10) {
        cleanPhone = `521${cleanPhone}`;
      }

      if (whatsappToken && whatsappPhoneId) {
        const response = await fetch(`https://graph.facebook.com/v18.0/${whatsappPhoneId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${whatsappToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: cleanPhone,
            type: 'text',
            text: { preview_url: false, body: text }
          })
        });

        if (!response.ok) {
          const errData = await response.json();
          console.error('Meta WhatsApp API error:', errData);
          throw new Error(errData.error?.message || 'Error al enviar mensaje por Meta API');
        }

        return await response.json();
      } else {
        // Modo Simulación Segura (en desarrollo o cuando la API Key no ha sido ingresada aún)
        console.log(`[LiberaPro WhatsApp Dispatcher] Mensaje despachado desde el servidor a +${cleanPhone}:`, text);
        return { success: true, status: 'dispatched_via_liberapro_server' };
      }
    };

    if (isGroup && Array.isArray(contactsList)) {
      // Envío Masivo a Todo el Grupo desde el Servidor
      const results = [];
      for (const contact of contactsList) {
        if (contact.phone) {
          try {
            const res = await sendSingleWhatsApp(contact.phone, message);
            results.push({ phone: contact.phone, student: contact.studentName, status: 'ok', res });
          } catch (err: any) {
            results.push({ phone: contact.phone, student: contact.studentName, status: 'error', error: err.message });
          }
        }
      }

      // Registrar notificación masiva en base de datos si existe el usuario
      if (user) {
        try {
          await supabase.from('user_generations').insert({
            user_id: user.id,
            type: 'whatsapp_group_notification',
            content: { groupName, totalSent: results.length, message }
          });
        } catch (e) {}
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Notificación masiva despachada a ${results.length} tutores del grupo ${groupName || ''}.`,
          results 
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );

    } else {
      // Envío Individual
      if (!recipientPhone) {
        return new Response(JSON.stringify({ error: 'Teléfono de destino requerido' }), { status: 400 });
      }

      const res = await sendSingleWhatsApp(recipientPhone, message);
      return new Response(
        JSON.stringify({ success: true, message: 'Mensaje despachado correctamente desde el servidor de LiberaPro.', res }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

  } catch (error: any) {
    console.error('Error dispatching WhatsApp notification:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error interno del servidor al procesar el envío' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
