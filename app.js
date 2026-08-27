const SUPABASE_URL = 'https://sbxlrcwonlqppluekcrt.supabase.co';
const SUPABASE_KEY = 'sb_publishable_xL2hBFPTlX6ANG8uu9KsvA_q6qGYpqr';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let esPremium = false;

const form = document.getElementById('notaForm');
const lista = document.getElementById('listaNotas');
const contador = document.getElementById('contador');
const mensajeLimite = document.getElementById('mensajeLimite');

function actualizarPlan() {
  esPremium = document.getElementById('planPremium').checked;
  obtenerNotas();
}

obtenerNotas();

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  mensajeLimite.textContent = '';
  const contenido = document.getElementById('textoNota').value;

  // 1. Consultar cantidad actual de notas
  const { data: notasActuales, error: countError } = await supabaseClient
    .from('notas')
    .select('id');

  if (countError) return alert('Error al consultar: ' + countError.message);

  const limite = esPremium ? 5 : 3;

  // 2. Controlar límite según el plan
  if (notasActuales.length >= limite) {
    mensajeLimite.textContent = `¡Límite alcanzado! El plan ${esPremium ? 'Premium' : 'Gratuito'} permite hasta ${limite} notas.`;
    return;
  }

  // 3. Guardar en Supabase
  const { error } = await supabaseClient
    .from('notas')
    .insert([{ contenido, es_premium: esPremium }]);

  if (error) {
    alert('Error al guardar: ' + error.message);
  } else {
    document.getElementById('textoNota').value = '';
    obtenerNotas();
  }
});

async function obtenerNotas() {
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