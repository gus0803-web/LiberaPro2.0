-- Function to search for NEM curriculum using pgvector
create or replace function match_nem_curriculum (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_fase text default null
)
returns table (
  id uuid,
  fase text,
  proyecto text,
  eje_articulador text,
  pda_text text,
  book_reference text,
  page integer,
  url text,
  similarity float
)
language sql stable
as $$
  select
    nem_curriculum.id,
    nem_curriculum.fase,
    nem_curriculum.proyecto,
    nem_curriculum.eje_articulador,
    nem_curriculum.pda_text,
    nem_curriculum.book_reference,
    nem_curriculum.page,
    nem_curriculum.url,
    1 - (nem_curriculum.embedding <=> query_embedding) as similarity
  from nem_curriculum
  where 1 - (nem_curriculum.embedding <=> query_embedding) > match_threshold
    and (p_fase is null or nem_curriculum.fase = p_fase)
  order by nem_curriculum.embedding <=> query_embedding
  limit match_count;
$$;
