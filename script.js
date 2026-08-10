// ============================================
// ESTADO LOCAL DE LA APLICACIÓN
// ============================================

let appointments = JSON.parse(
  localStorage.getItem('turnero_appointments')
) || [];

const form = document.getElementById('appointment-form');
const container = document.getElementById('appointments-container');
const searchInput = document.getElementById('search-input');
const filterStatus = document.getElementById('filter-status');
const btnExport = document.getElementById('btn-export');


// ============================================
// INICIALIZAR FECHA MÍNIMA
// ============================================

document.getElementById('app-date').min = new Date()
  .toISOString()
  .split('T')[0];


// ============================================
// GUARDAR DATOS EN LOCALSTORAGE
// ============================================

function saveData() {
  localStorage.setItem(
    'turnero_appointments',
    JSON.stringify(appointments)
  );

  updateStats();
}


// ============================================
// MOSTRAR ALERTAS TOAST
// ============================================

function showToast(message) {
  const toastContainer = document.getElementById('toast-container');

  if (!toastContainer) {
    return;
  }

  const toast = document.createElement('div');

  toast.className = 'toast';
  toast.textContent = message;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}


// ============================================
// ACTUALIZAR MÉTRICAS
// ============================================

function updateStats() {
  const totalElement = document.getElementById('stat-total');
  const confirmedElement = document.getElementById('stat-confirmed');
  const pendingElement = document.getElementById('stat-pending');

  if (totalElement) {
    totalElement.textContent = appointments.length;
  }

  if (confirmedElement) {
    confirmedElement.textContent = appointments.filter(
      app => app.status === 'confirmado'
    ).length;
  }

  if (pendingElement) {
    pendingElement.textContent = appointments.filter(
      app => app.status === 'pendiente'
    ).length;
  }
}


// ============================================
// ESCAPAR HTML PARA SEGURIDAD
// ============================================

function escapeHtml(text) {
  const div = document.createElement('div');

  div.textContent = text ?? '';

  return div.innerHTML;
}


// ============================================
// RENDERIZAR TARJETAS DE TURNOS
// ============================================

function renderAppointments() {
  container.innerHTML = '';

  const searchTerm = searchInput.value.toLowerCase().trim();
  const selectedStatus = filterStatus.value;

  // Filtrar resultados
  const filtered = appointments.filter(app => {

    const matchesSearch =
      app.name.toLowerCase().includes(searchTerm) ||
      app.service.toLowerCase().includes(searchTerm);

    const matchesStatus =
      selectedStatus === 'todos' ||
      app.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });


  // Mostrar estado vacío
  if (filtered.length === 0) {

    container.innerHTML = `
      <div class="empty-state">
        <p>No se encontraron turnos registrados.</p>
      </div>
    `;

    updateStats();

    return;
  }


  // Ordenar por fecha y hora
  filtered.sort(
    (a, b) =>
      new Date(`${a.date}T${a.time}`) -
      new Date(`${b.date}T${b.time}`)
  );


  // Crear tarjetas
  filtered.forEach(app => {

    const card = document.createElement('div');

    card.className = 'appointment-card';


    // ============================================
    // WHATSAPP
    // ============================================

    const cleanPhone = app.phone.replace(/[^0-9]/g, '');

    const wsText = encodeURIComponent(
      `Hola ${app.name}, te contactamos desde Patric Soft para recordar tu turno de ${app.service} el día ${app.date} a las ${app.time} hs.`
    );

    const whatsappUrl =
      `https://wa.me/${cleanPhone}?text=${wsText}`;


    // ============================================
    // CONTENIDO DE LA TARJETA
    // ============================================

    card.innerHTML = `
      <div class="app-info">

        <h3>${escapeHtml(app.name)}</h3>

        <p>
          <span>📌 ${escapeHtml(app.service)}</span>
          <span>📅 ${escapeHtml(app.date)} - ${escapeHtml(app.time)} hs</span>
          <span>📞 ${escapeHtml(app.phone)}</span>
        </p>

      </div>


      <div class="appointment-right">

        <span class="status-badge status-${escapeHtml(app.status)}">
          ${escapeHtml(app.status)}
        </span>


        <div class="app-actions">

          <a
            href="${whatsappUrl}"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-action btn-whatsapp"
            title="Enviar Recordatorio por WhatsApp"
            aria-label="Enviar recordatorio por WhatsApp"
          >
            📲
          </a>


          ${
            app.status !== 'confirmado'
              ? `
                <button
                  type="button"
                  class="btn-action"
                  onclick="changeStatus('${app.id}', 'confirmado')"
                  title="Confirmar"
                  aria-label="Confirmar turno"
                >
                  ✓
                </button>
              `
              : ''
          }


          ${
            app.status !== 'cancelado'
              ? `
                <button
                  type="button"
                  class="btn-action"
                  onclick="changeStatus('${app.id}', 'cancelado')"
                  title="Cancelar"
                  aria-label="Cancelar turno"
                >
                  ✕
                </button>
              `
              : ''
          }


          <button
            type="button"
            class="btn-action"
            onclick="deleteAppointment('${app.id}')"
            title="Eliminar"
            aria-label="Eliminar turno"
          >
            🗑
          </button>

        </div>

      </div>
    `;


    container.appendChild(card);
  });


  updateStats();
}


// ============================================
// AGREGAR NUEVO TURNO
// ============================================

form.addEventListener('submit', event => {

  event.preventDefault();


  const newApp = {

    id: Date.now().toString(),

    name: document
      .getElementById('client-name')
      .value
      .trim(),

    phone: document
      .getElementById('client-phone')
      .value
      .trim(),

    service: document
      .getElementById('service-type')
      .value,

    date: document
      .getElementById('app-date')
      .value,

    time: document
      .getElementById('app-time')
      .value,

    status: 'pendiente'
  };


  appointments.push(newApp);

  saveData();

  renderAppointments();

  form.reset();

  showToast('Turno registrado con éxito');
});


// ============================================
// CAMBIAR ESTADO
// ============================================

window.changeStatus = function(id, newStatus) {

  appointments = appointments.map(app => {

    if (app.id === id) {
      return {
        ...app,
        status: newStatus
      };
    }

    return app;
  });


  saveData();

  renderAppointments();

  showToast(`Estado actualizado a ${newStatus}`);
};


// ============================================
// ELIMINAR TURNO
// ============================================

window.deleteAppointment = function(id) {

  appointments = appointments.filter(
    app => app.id !== id
  );


  saveData();

  renderAppointments();

  showToast('Turno eliminado');
};


// ============================================
// PREPARAR VALORES PARA CSV
// ============================================

function escapeCsvValue(value) {

  return `"${String(value ?? '').replace(/"/g, '""')}"`;

}


// ============================================
// EXPORTAR A CSV
// ============================================

btnExport.addEventListener('click', () => {

  if (appointments.length === 0) {

    showToast('No hay datos para exportar');

    return;
  }


  let csvContent =
    'data:text/csv;charset=utf-8,\uFEFF' +
    'ID,Cliente,Telefono,Servicio,Fecha,Hora,Estado\n';


  appointments.forEach(app => {

    csvContent += [
      escapeCsvValue(app.id),
      escapeCsvValue(app.name),
      escapeCsvValue(app.phone),
      escapeCsvValue(app.service),
      escapeCsvValue(app.date),
      escapeCsvValue(app.time),
      escapeCsvValue(app.status)
    ].join(',') + '\n';

  });


  const encodedUri = encodeURI(csvContent);

  const link = document.createElement('a');

  link.setAttribute('href', encodedUri);

  link.setAttribute(
    'download',
    `turnos_patric_soft_${new Date()
      .toISOString()
      .split('T')[0]}.csv`
  );


  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);


  showToast('Reporte exportado correctamente');
});


// ============================================
// EVENTOS DE BÚSQUEDA Y FILTRO
// ============================================

searchInput.addEventListener(
  'input',
  renderAppointments
);

filterStatus.addEventListener(
  'change',
  renderAppointments
);


// ============================================
// CARGA INICIAL
// ============================================

renderAppointments();
