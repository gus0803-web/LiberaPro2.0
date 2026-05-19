import { redirect } from 'next/navigation';

export default function Home() {
  // Redirigir siempre a la aplicación principal (el Concierge)
  redirect('/app/dashboard');
}
