import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await req.json();
    const { schoolName, gradeGroup, shift, studentName, parentName, linkCode } = body;

    if (!linkCode || !studentName) {
      return new Response(JSON.stringify({ error: 'linkCode y studentName son requeridos' }), { status: 400 });
    }

    const { data, error } = await supabase.from('family_link_codes').insert({
      teacher_id: user?.id || null,
      school_name: schoolName || 'Escuela Primaria',
      grade_group: gradeGroup || '2º A',
      shift: shift || 'Vespertino',
      student_name: studentName,
      parent_name: parentName || 'Padre de Familia',
      link_code: linkCode
    }).select().single();

    if (error) {
      console.error('Supabase family_link_codes insert error:', error);
      // Si ya existe el código, ignorar o retornar éxito
      if (error.code === '23505') {
        return new Response(JSON.stringify({ success: true, message: 'Código ya registrado previamente' }), { status: 200 });
      }
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, data }), { status: 200 });
  } catch (err: any) {
    console.error('API link-codes error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
