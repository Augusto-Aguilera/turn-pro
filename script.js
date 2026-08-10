// Estado local de la aplicación
let appointments = JSON.parse(localStorage.getItem('turnero_appointments')) || [];

const form = document.getElementById('appointment-form');
const container = document.getElementById('appointments-container');
const searchInput = document.getElementById('search-input');
const filterStatus = document.getElementById('filter-status');
const btnExport = document.getElementById('btn-export');

// Inicializar fecha mínima en el input date (hoy)
document.getElementById('app-date').min = new Date().toISOString().split('T')[0];

// Guardar en LocalStorage
function saveData() {
  localStorage.setItem('turnero_appointments', JSON.stringify(appointments));
  updateStats();
}

// Mostrar alertas Toast
function showToast(message) {
  const toastContainer = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Actualizar métricas
function updateStats() {
  document.getElementById('stat-total').textContent = appointments.length;
  document.getElementById('stat-confirmed').textContent = appointments.filter(a => a.status === 'confirmado').length;
  document.getElementById('stat-pending').textContent = appointments.filter(a => a.status === 'pendiente').length;
}

// Renderizar tarjetas de turnos con filtros
function renderAppointments() {
  container.innerHTML = '';

  const searchTerm = searchInput.value.toLowerCase();
  const selectedStatus = filterStatus.value;

  // Filtrar resultados
  const filtered = appointments.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm) || app.service.toLowerCase().includes(searchTerm);
    const matchesStatus = selectedStatus === 'todos' || app.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

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
  filtered.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

  filtered.forEach((app) => {
    const card = document.createElement('div');
    card.className = 'appointment-card';

    // Generar enlace de WhatsApp
    const cleanPhone = app.phone.replace(/[^0-9]/g, '');
    const wsText = encodeURIComponent(`Hola ${app.name}, te contactamos desde Patric Soft para recordar tu turno de ${app.service} el día ${app.date} a las ${app.time} hs.`);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${wsText}`;

    card.innerHTML = `
      <div class="app-info">
        <h3>${escapeHtml(app.name)}</h3>
        <p>
          <span>📌 ${escapeHtml(app.service)}</span>
          <span>📅 ${app.date} - ${app.time} hs</span>
          <span>📞 ${escapeHtml(app.phone)}</span>
        </p>
      </div>
      <div style="display: flex; align-items: center; gap: 1rem;">
        <span class="status-badge status-${app.status}">${app.status}</span>
        <div class="app-actions">
          <a href="${whatsappUrl}" target="_blank" class="btn-action btn-whatsapp" title="Enviar Recordatorio por WhatsApp">📲</a>
          ${app.status !== 'confirmado' ? `<button class="btn-action" onclick="changeStatus('${app.id}', 'confirmado')" title="Confirmar">✓</button>` : ''}
          ${app.status !== 'cancelado' ? `<button class="btn-action" onclick="changeStatus('${app.id}', 'cancelado')" title="Cancelar">✕</button>` : ''}
          <button class="btn-action" onclick="deleteAppointment('${app.id}')" title="Eliminar">🗑</button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });

  updateStats();
}

// Escapar HTML para seguridad
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Agregar turno
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const newApp = {
    id: Date.now().toString(),
    name: document.getElementById('client-name').value,
    phone: document.getElementById('client-phone').value,
    service: document.getElementById('service-type').value,
    date: document.getElementById('app-date').value,
    time: document.getElementById('app-time').value,
    status: 'pendiente'
  };

  appointments.push(newApp);
  saveData();
  renderAppointments();

  form.reset();
  showToast('Turno registrado con éxito');
});

// Cambiar estado
window.changeStatus = function(id, newStatus) {
  appointments = appointments.map(app => app.id === id ? { ...app, status: newStatus } : app);
  saveData();
  renderAppointments();
  showToast(`Estado actualizado a ${newStatus}`);
};

// Eliminar turno
window.deleteAppointment = function(id) {
  appointments = appointments.filter(app => app.id !== id);
  saveData();
  renderAppointments();
  showToast('Turno eliminado');
};

// Exportar a CSV
btnExport.addEventListener('click', () => {
  if (appointments.length === 0) {
    showToast('No hay datos para exportar');
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,ID,Cliente,Telefono,Servicio,Fecha,Hora,Estado\n";
  appointments.forEach(app => {
    csvContent += `"${app.id}","${app.name}","${app.phone}","${app.service}","${app.date}","${app.time}","${app.status}"\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `turnos_patric_soft_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('Reporte exportado correctamente');
});

// Eventos de Filtro y Búsqueda
searchInput.addEventListener('input', renderAppointments);
filterStatus.addEventListener('change', renderAppointments);

// Carga inicial
renderAppointments();