const SUPABASE_URL = 'https://sbxlrcwonlqppluekcrt.supabase.co';
const SUPABASE_KEY = 'sb_publishable_xL2hBFPTlX6ANG8uu9KsvA_q6qGYpqr';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let usuarioActual = null;
let esPremium = false;

const seccionLogin = document.getElementById('seccion-login');
const seccionApp = document.getElementById('seccion-app');
const userEmail = document.getElementById('userEmail');
const form = document.getElementById('notaForm');
const lista = document.getElementById('listaNotas');
const contador = document.getElementById('contador');
const mensajeLimite = document.getElementById('mensajeLimite');

// 1. Escuchar activamente cuando el usuario inicia o cierra sesión
supabaseClient.auth.onAuthStateChange((event, session) => {
  if (session && session.user) {
    usuarioActual = session.user;
    userEmail.textContent = session.user.email;
    seccionLogin.classList.add('hidden');
    seccionApp.classList.remove('hidden');
    obtenerNotas();
  } else {
    usuarioActual = null;
    seccionLogin.classList.remove('hidden');
    seccionApp.classList.add('hidden');
  }
});

// 2. Iniciar / Registrarse con Google (Redirigiendo a Cloudflare)
async function loginConGoogle() {
  await supabaseClient.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'https://calculadoraprueba.pages.dev'
    }
  });
}

// 3. Cerrar sesión
async function cerrarSesion() {
  await supabaseClient.auth.signOut();
  window.location.reload();
}

function actualizarPlan() {
  esPremium = document.getElementById('planPremium').checked;
  obtenerNotas();
}

// 4. Guardar nota asociada a usuario
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  mensajeLimite.textContent = '';
  const contenido = document.getElementById('textoNota').value;

  // Consultar notas solo del usuario actual
  const { data: notasActuales, error: countError } = await supabaseClient
    .from('notas')
    .select('id');

  if (countError) return alert('Error al consultar: ' + countError.message);

  const limite = esPremium ? 5 : 3;

  if (notasActuales.length >= limite) {
    mensajeLimite.textContent = `¡Límite alcanzado! Tu plan ${esPremium ? 'Premium' : 'Gratuito'} permite máximo ${limite} notas.`;
    return;
  }

  const { error } = await supabaseClient
    .from('notas')
    .insert([{ 
      contenido: contenido, 
      es_premium: esPremium,
      user_id: usuarioActual.id 
    }]);

  if (error) {
    alert('Error al guardar: ' + error.message);
  } else {
    document.getElementById('textoNota').value = '';
    obtenerNotas();
  }
});

// 5. Cargar notas solo del usuario logueado
async function obtenerNotas() {
  if (!usuarioActual) return;

  const { data, error } = await supabaseClient
    .from('notas')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return console.error(error);

  contador.textContent = data.length;
  lista.innerHTML = '';

  data.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item.contenido;
    lista.appendChild(li);
  });
}