// Selectores del DOM
const formularioTarea = document.querySelector("#formulario-tarea");
const tareaInput = document.querySelector("#tarea-input");
const listaTareas = document.querySelector("#lista-tareas");
const totalTareas = document.querySelector("#total-tareas");
const tareasCompletadas = document.querySelector("#tareas-completadas");
const tareasIncompletas = document.querySelector("#tareas-incompletas");
const mensajeErrorTarea = document.querySelector("#mensaje-error-tarea");

// URL y clave de Supabase
const SUPABASE_URL = "https://mvzkwyytbxdmandpckks.supabase.co";

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12emt3eXl0YnhkbWFuZHBja2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MTIzOTAsImV4cCI6MjA2NTQ4ODM5MH0.KT0ieTBywYvnhgOcfuMMANJyzDAKP4TnKh4u8rjJduU"; // <-- ¡¡PÉGALA AQUÍ!!

// 3. Crear el cliente de Supabase
const supaClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let tareas = []; // Array local para guardar los datos temporalmente

// OBTENER todas las tareas
async function obtenerTareas() {
  const { data, error } = await supaClient.from("tareas").select("*");

  if (error) {
    console.error("Error al obtener tareas:", error.message);
    alert(
      "Error al conectar con la base de datos. Revisa la consola (F12) para más detalles."
    );
    return;
  }

  tareas = data;
  mostrarTareas();
}

// AÑADIR una nueva tarea
async function agregarTarea(evento) {
  evento.preventDefault();
  const textoTarea = tareaInput.value.trim();

  if (textoTarea === "") {
    mensajeErrorTarea.style.display = "block";
    return;
  }
  mensajeErrorTarea.style.display = "none";

  const { error } = await supaClient
    .from("tareas")
    .insert([{ text: textoTarea }]);

  if (error) {
    console.error("Error al añadir tarea:", error.message);
    alert("No se pudo añadir la tarea.");
  } else {
    tareaInput.value = "";
    await obtenerTareas(); // Recargar la lista desde el backend
  }
}

// MARCAR una tarea como completada (actualizar)
async function marcarComoCompletada(id, estadoActual) {
  const { error } = await supaClient
    .from("tareas")
    .update({ completed: !estadoActual })
    .eq("id", id);

  if (error) {
    console.error("Error al actualizar tarea:", error.message);
  } else {
    await obtenerTareas(); // Recargar la lista
  }
}

// ELIMINAR una tarea
async function eliminarTarea(id) {
  const { error } = await supaClient.from("tareas").delete().eq("id", id);

  if (error) {
    console.error("Error al eliminar tarea:", error.message);
  } else {
    await obtenerTareas(); // Recargar la lista
  }
}

// MOSTRAR las tareas en la página
function mostrarTareas() {
  listaTareas.innerHTML = ""; // Limpiar la lista

  tareas.forEach((tarea) => {
    const { id, text, completed } = tarea;

    const elementoTarea = document.createElement("li");
    elementoTarea.classList.add("item-tarea");

    const botonCompletar = document.createElement("button");
    botonCompletar.classList.add("boton-completar");
    botonCompletar.textContent = "✔";
    botonCompletar.addEventListener("click", () =>
      marcarComoCompletada(id, completed)
    );

    const textoTareaElemento = document.createElement("p");
    textoTareaElemento.classList.add("texto-tarea");
    textoTareaElemento.textContent = text;
    if (completed) {
      textoTareaElemento.classList.add("completada");
    }

    const botonEliminar = document.createElement("button");
    botonEliminar.classList.add("boton-eliminar");
    botonEliminar.textContent = "✖";
    botonEliminar.addEventListener("click", () => eliminarTarea(id));

    elementoTarea.appendChild(botonCompletar);
    elementoTarea.appendChild(textoTareaElemento);
    elementoTarea.appendChild(botonEliminar);

    listaTareas.appendChild(elementoTarea);
  });

  actualizarContadoresTareas();
}
// ACTUALIZAR los contadores de tareas
function actualizarContadoresTareas() {
  const total = tareas.length;
  const hechas = tareas.filter((t) => t.completed).length;
  const pendientes = total - hechas;

  totalTareas.textContent = `TOTAL DE TAREAS: ${total}`;
  tareasCompletadas.textContent = `TAREAS COMPLETADAS: ${hechas}`;
  tareasIncompletas.textContent = `TAREAS INCOMPLETAS: ${pendientes}`;
}

formularioTarea.addEventListener("submit", agregarTarea);
// Cargar las tareas al iniciar la página
document.addEventListener("DOMContentLoaded", obtenerTareas);
