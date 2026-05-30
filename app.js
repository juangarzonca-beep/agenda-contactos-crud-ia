/*
 * app.js – Lógica principal de la Agenda de Contactos IA.
 *
 * 1. Se usan funciones puras y bien documentadas.
 * 2. Se persisten los contactos en localStorage.
 * 3. Se actualiza la vista cada vez que cambia el modelo.
 * 4. Todo el código está comentado en español para tu documentación.
 */

// Constantes de localStorage
const STORAGE_KEY = 'agendaContactos';

/**
 * Obtiene la lista de contactos desde localStorage.
 * @returns {Array<Object>} Array de contactos.
 */
function obtenerContactos() {
  const datos = localStorage.getItem(STORAGE_KEY);
  return datos ? JSON.parse(datos) : [];
}

/**
 * Guarda la lista de contactos en localStorage.
 * @param {Array<Object>} contactos - Lista a guardar.
 */
function guardarContactos(contactos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contactos));
}

/**
 * Genera un ID único basado en la fecha y un contador.
 * @returns {string}
 */
function generarId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * Renderiza la lista de contactos en el DOM.
 * @param {Array<Object>} contactos - Lista a renderizar.
 */
function renderizarContactos(contactos) {
  const contenedor = document.getElementById('contactsContainer');
  contenedor.innerHTML = '';

  if (contactos.length === 0) {
    contenedor.innerHTML = '<p class="empty-message">No hay contactos registrados.</p>';
    return;
  }

  contactos.forEach((c) => {
    const card = document.createElement('div');
    card.className = 'col-md-4 contact-card';
    card.innerHTML = `
      <div class="card h-100">
        <div class="card-body">
          <h5 class="card-title">${c.name}</h5>
          <p class="card-text"><strong>Teléfono:</strong> ${c.phone}</p>
          <p class="card-text"><strong>Correo:</strong> ${c.email}</p>
          <p class="card-text"><strong>Categoría:</strong> ${c.category}</p>
          <button class="btn btn-sm btn-outline-primary action-btn" data-id="${c.id}" data-action="edit">Editar</button>
          <button class="btn btn-sm btn-outline-danger action-btn" data-id="${c.id}" data-action="delete">Eliminar</button>
        </div>
      </div>`;
    contenedor.appendChild(card);
  });
}

/**
 * Valida el formulario de contacto.
 * @returns {boolean} true si es válido.
 */
function validarFormulario() {
  const form = document.getElementById('contactForm');
  return form.checkValidity();
}

/**
 * Limpia el formulario y restablece el estado de edición.
 */
function limpiarFormulario() {
  document.getElementById('contactForm').reset();
  document.getElementById('contactId').value = '';
  document.getElementById('cancelEdit').classList.add('d-none');
}

/**
 * Carga los datos de un contacto en el formulario para editar.
 * @param {Object} contacto
 */
function cargarEnFormulario(contacto) {
  document.getElementById('contactId').value = contacto.id;
  document.getElementById('name').value = contacto.name;
  document.getElementById('phone').value = contacto.phone;
  document.getElementById('email').value = contacto.email;
  document.getElementById('category').value = contacto.category;
  document.getElementById('cancelEdit').classList.remove('d-none');
}

/**
 * Maneja la acción de guardar (crear o actualizar).
 * @param {Event} e
 */
function manejarGuardar(e) {
  e.preventDefault();
  if (!validarFormulario()) return;

  const id = document.getElementById('contactId').value;
  const nombre = document.getElementById('name').value.trim();
  const telefono = document.getElementById('phone').value.trim();
  const correo = document.getElementById('email').value.trim();
  const categoria = document.getElementById('category').value;

  const contactos = obtenerContactos();
  if (id) {
    // Actualizar
    const index = contactos.findIndex((c) => c.id === id);
    if (index !== -1) {
      contactos[index] = { id, name: nombre, phone: telefono, email: correo, category: categoria };
    }
  } else {
    // Crear
    const nuevo = {
      id: generarId(),
      name: nombre,
      phone: telefono,
      email: correo,
      category: categoria,
    };
    contactos.push(nuevo);
  }
  guardarContactos(contactos);
  renderizarContactos(contactos);
  limpiarFormulario();
}

/**
 * Maneja la eliminación de un contacto.
 * @param {string} id
 */
function eliminarContacto(id) {
  if (!confirm('¿Estás seguro de eliminar este contacto?')) return;
  const contactos = obtenerContactos();
  const filtrados = contactos.filter((c) => c.id !== id);
  guardarContactos(filtrados);
  renderizarContactos(filtrados);
}

/**
 * Filtra contactos por nombre.
 * @param {string} termino
 */
function filtrarContactos(termino) {
  const contactos = obtenerContactos();
  const filtrados = contactos.filter((c) => c.name.toLowerCase().includes(termino.toLowerCase()));
  renderizarContactos(filtrados);
}

/**
 * Inicializa los listeners y renderiza la vista inicial.
 */
function init() {
  document.getElementById('contactForm').addEventListener('submit', manejarGuardar);
  document.getElementById('cancelEdit').addEventListener('click', limpiarFormulario);
  document.getElementById('searchInput').addEventListener('input', (e) => filtrarContactos(e.target.value));
  document.getElementById('contactsContainer').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    const action = btn.getAttribute('data-action');
    const contactos = obtenerContactos();
    if (action === 'edit') {
      const contacto = contactos.find((c) => c.id === id);
      if (contacto) cargarEnFormulario(contacto);
    } else if (action === 'delete') {
      eliminarContacto(id);
    }
  });
  renderizarContactos(obtenerContactos());
}

// Ejecutar init cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);
