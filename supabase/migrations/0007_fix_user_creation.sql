-- 1. Si el campo "credits" fue agregado manualmente, nos aseguramos de que tenga un valor por defecto
-- de lo contrario la inserción del trigger fallará al pedir NOT NULL sin un default.
do $$ 
begin
  if exists (
    select from information_schema.columns 
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'credits'
  ) then
    alter table public.profiles alter column credits set default 120;
  end if;
end $$;

-- 2. Hacemos el Trigger "a prueba de balas"
-- Si hay un error en la creación del perfil (por una columna faltante o configuración manual),
-- el error se captura silenciosamente en los logs y NO bloquea la creación del usuario en Auth.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  begin
    insert into public.profiles (id, full_name)
    values (new.id, new.raw_user_meta_data->>'full_name');
  exception when others then
    -- Registrar el error pero permitir que el usuario de Auth se cree
    raise log 'Error al crear el perfil para el usuario %: %', new.id, SQLERRM;
  end;
  
  return new;
end;
$$ language plpgsql security definer;
