// ============================================
// CONFIGURACIÓN SUPABASE
// ============================================

const SUPABASE_URL =
  'https://elvcdlhhjphbfunybjlu.supabase.co';

const SUPABASE_PUBLISHABLE_KEY =
  'sb_publishable_DTMOZTGWyRMKbs41aVJajQ_VBpGGqPt';

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);


// ============================================
// CONFIGURACIÓN DE LA DEMO
// ============================================

const DEMO_LIMIT = 3;


// ============================================
// ESTADO LOCAL DE LA APLICACIÓN
// ============================================

let appointments = [];

let currentUser = null;

let currentProfile = null;


// ============================================
// ELEMENTOS DE AUTENTICACIÓN
// ============================================

const authScreen =
  document.getElementById('auth-screen');

const appContent =
  document.getElementById('app-content');

const loginForm =
  document.getElementById('login-form');

const registerForm =
  document.getElementById('register-form');

const loginContainer =
  document.getElementById('login-form-container');

const registerContainer =
  document.getElementById('register-form-container');

const showRegister =
  document.getElementById('show-register');

const showLogin =
  document.getElementById('show-login');

const authMessage =
  document.getElementById('auth-message');

const loginSubmit =
  document.getElementById('login-submit');

const registerSubmit =
  document.getElementById('register-submit');

const btnLogout =
  document.getElementById('btn-logout');

const userBusiness =
  document.getElementById('user-business');

const userEmail =
  document.getElementById('user-email');


// ============================================
// ELEMENTOS DE LA APLICACIÓN
// ============================================

const form =
  document.getElementById('appointment-form');

const container =
  document.getElementById('appointments-container');

const searchInput =
  document.getElementById('search-input');

const filterStatus =
  document.getElementById('filter-status');

const btnExport =
  document.getElementById('btn-export');

const demoCounter =
  document.getElementById('demo-counter');

const limitMessage =
  document.getElementById('limit-message');

const btnSubmitAppointment =
  document.getElementById(
    'btn-submit-appointment'
  );


// ============================================
// OBTENER CLAVE LOCAL DEL USUARIO
// ============================================

function getStorageKey() {

  if (!currentUser) {
    return null;
  }

  return `turnero_appointments_${currentUser.id}`;

}


// ============================================
// CARGAR TURNOS DEL USUARIO
// ============================================

function loadAppointments() {

  const storageKey =
    getStorageKey();

  if (!storageKey) {

    appointments = [];

    return;
  }


  try {

    appointments =
      JSON.parse(
        localStorage.getItem(storageKey)
      ) || [];

  } catch (error) {

    console.error(
      'Error al cargar turnos:',
      error
    );

    appointments = [];

  }

}


// ============================================
// INICIALIZAR FECHA MÍNIMA
// ============================================

function initializeDate() {

  const dateInput =
    document.getElementById('app-date');

  if (!dateInput) {
    return;
  }


  dateInput.min =
    new Date()
      .toISOString()
      .split('T')[0];

}


// ============================================
// GUARDAR DATOS
// ============================================

function saveData() {

  const storageKey =
    getStorageKey();

  if (!storageKey) {
    return;
  }


  localStorage.setItem(
    storageKey,
    JSON.stringify(appointments)
  );


  updateStats();

  updateDemoStatus();

}


// ============================================
// MOSTRAR TOAST
// ============================================

function showToast(message) {

  const toastContainer =
    document.getElementById(
      'toast-container'
    );

  if (!toastContainer) {
    return;
  }


  const toast =
    document.createElement('div');


  toast.className =
    'toast';


  toast.textContent =
    message;


  toastContainer.appendChild(
    toast
  );


  setTimeout(() => {

    toast.remove();

  }, 3000);

}


// ============================================
// MOSTRAR MENSAJE DE AUTH
// ============================================

function showAuthMessage(
  message,
  type = 'error'
) {

  if (!authMessage) {
    return;
  }


  authMessage.textContent =
    message;


  authMessage.className =
    `auth-message ${type}`;

}


// ============================================
// LIMPIAR MENSAJE AUTH
// ============================================

function clearAuthMessage() {

  if (!authMessage) {
    return;
  }


  authMessage.textContent =
    '';

  authMessage.className =
    'auth-message';

}


// ============================================
// MOSTRAR LOGIN
// ============================================

function showLoginScreen() {

  if (authScreen) {
    authScreen.style.display =
      'flex';
  }


  if (appContent) {
    appContent.classList.add(
      'app-content-hidden'
    );
  }


  currentUser = null;

  currentProfile = null;

  appointments = [];

}


// ============================================
// MOSTRAR REGISTRO
// ============================================

showRegister.addEventListener(
  'click',
  () => {

    loginContainer.classList.add(
      'auth-hidden'
    );

    registerContainer.classList.remove(
      'auth-hidden'
    );

    clearAuthMessage();

  }
);


// ============================================
// MOSTRAR LOGIN
// ============================================

showLogin.addEventListener(
  'click',
  () => {

    registerContainer.classList.add(
      'auth-hidden'
    );

    loginContainer.classList.remove(
      'auth-hidden'
    );

    clearAuthMessage();

  }
);


// ============================================
// REGISTRO DE USUARIO
// ============================================

registerForm.addEventListener(
  'submit',
  async event => {

    event.preventDefault();


    const businessName =
      document
        .getElementById(
          'register-business'
        )
        .value
        .trim();


    const email =
      document
        .getElementById(
          'register-email'
        )
        .value
        .trim();


    const password =
      document
        .getElementById(
          'register-password'
        )
        .value;


    if (
      !businessName ||
      !email ||
      !password
    ) {

      showAuthMessage(
        'Completá todos los campos.'
      );

      return;

    }


    if (password.length < 6) {

      showAuthMessage(
        'La contraseña debe tener al menos 6 caracteres.'
      );

      return;

    }


    registerSubmit.disabled =
      true;

    registerSubmit.textContent =
      '⏳ Creando cuenta...';


    try {

      const {
        data,
        error
      } =
        await supabaseClient.auth.signUp({

          email,

          password,

          options: {

            data: {
              business_name:
                businessName
            }

          }

        });


      if (error) {
        throw error;
      }


      if (!data.user) {

        throw new Error(
          'No se pudo crear la cuenta.'
        );

      }


      showAuthMessage(
        '¡Cuenta creada correctamente! Ahora podés iniciar sesión.',
        'success'
      );


      registerForm.reset();


      setTimeout(() => {

        registerContainer.classList.add(
          'auth-hidden'
        );

        loginContainer.classList.remove(
          'auth-hidden'
        );

        clearAuthMessage();

      }, 1500);


    } catch (error) {

      console.error(
        'Error de registro:',
        error
      );


      let message =
        'No se pudo crear la cuenta.';


      if (
        error.message
          ?.toLowerCase()
          .includes('already registered')
      ) {

        message =
          'Ese correo electrónico ya está registrado.';

      } else if (
        error.message
          ?.toLowerCase()
          .includes('password')
      ) {

        message =
          'La contraseña no cumple los requisitos.';

      } else if (error.message) {

        message =
          error.message;

      }


      showAuthMessage(
        message
      );


    } finally {

      registerSubmit.disabled =
        false;

      registerSubmit.textContent =
        '🚀 Crear Cuenta';

    }

  }
);


// ============================================
// INICIO DE SESIÓN
// ============================================

loginForm.addEventListener(
  'submit',
  async event => {

    event.preventDefault();


    const email =
      document
        .getElementById(
          'login-email'
        )
        .value
        .trim();


    const password =
      document
        .getElementById(
          'login-password'
        )
        .value;


    if (!email || !password) {

      showAuthMessage(
        'Completá tu correo y contraseña.'
      );

      return;

    }


    loginSubmit.disabled =
      true;

    loginSubmit.textContent =
      '⏳ Ingresando...';


    try {

      const {
        data,
        error
      } =
        await supabaseClient.auth.signInWithPassword({

          email,

          password

        });


      if (error) {
        throw error;
      }


      if (!data.session) {

        throw new Error(
          'No se pudo iniciar la sesión.'
        );

      }


      showToast(
        '¡Inicio de sesión correcto!'
      );


    } catch (error) {

      console.error(
        'Error de inicio de sesión:',
        error
      );


      showAuthMessage(
        'Correo o contraseña incorrectos.'
      );


    } finally {

      loginSubmit.disabled =
        false;

      loginSubmit.textContent =
        '🔐 Iniciar Sesión';

    }

  }
);


// ============================================
// CERRAR SESIÓN
// ============================================

btnLogout.addEventListener(
  'click',
  async () => {

    try {

      const {
        error
      } =
        await supabaseClient.auth.signOut();


      if (error) {
        throw error;
      }


      showToast(
        'Sesión cerrada correctamente.'
      );


    } catch (error) {

      console.error(
        'Error al cerrar sesión:',
        error
      );


      showToast(
        'No se pudo cerrar la sesión.'
      );

    }

  }
);


// ============================================
// OBTENER PERFIL
// ============================================

async function loadProfile() {

  if (!currentUser) {
    return;
  }


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from('profiles')
        .select('*')
        .eq(
          'id',
          currentUser.id
        )
        .maybeSingle();


    if (error) {

      console.warn(
        'No se pudo cargar el perfil:',
        error
      );

      return;

    }


    currentProfile =
      data || null;


  } catch (error) {

    console.warn(
      'Error cargando perfil:',
      error
    );

  }

}


// ============================================
// ACTUALIZAR INFORMACIÓN DEL USUARIO
// ============================================

function updateUserInterface() {

  if (!currentUser) {
    return;
  }


  const metadata =
    currentUser.user_metadata || {};


  const businessName =
    currentProfile?.business_name ||
    metadata.business_name ||
    'Mi negocio';


  if (userBusiness) {

    userBusiness.textContent =
      businessName;

  }


  if (userEmail) {

    userEmail.textContent =
      currentUser.email || '';

  }

}


// ============================================
// MOSTRAR APLICACIÓN
// ============================================

async function showApplication(
  session
) {

  if (!session?.user) {
    showLoginScreen();
    return;
  }


  currentUser =
    session.user;


  await loadProfile();


  updateUserInterface();


  loadAppointments();


  authScreen.style.display =
    'none';


  appContent.classList.remove(
    'app-content-hidden'
  );


  initializeDate();

  renderAppointments();

  updateStats();

  updateDemoStatus();

}


// ============================================
// CONTROL DE SESIÓN
// ============================================

async function checkSession() {

  try {

    const {
      data: {
        session
      }
    } =
      await supabaseClient.auth.getSession();


    if (session) {

      await showApplication(
        session
      );

    } else {

      showLoginScreen();

    }


  } catch (error) {

    console.error(
      'Error verificando sesión:',
      error
    );

    showLoginScreen();

  }

}


// ============================================
// DETECTAR CAMBIOS DE SESIÓN
// ============================================

supabaseClient.auth.onAuthStateChange(
  async (event, session) => {

    if (
      session &&
      (
        event === 'SIGNED_IN' ||
        event === 'INITIAL_SESSION' ||
        event === 'TOKEN_REFRESHED'
      )
    ) {

      await showApplication(
        session
      );

    }


    if (event === 'SIGNED_OUT') {

      showLoginScreen();

    }

  }
);


// ============================================
// ACTUALIZAR MÉTRICAS
// ============================================

function updateStats() {

  const totalElement =
    document.getElementById(
      'stat-total'
    );

  const confirmedElement =
    document.getElementById(
      'stat-confirmed'
    );

  const pendingElement =
    document.getElementById(
      'stat-pending'
    );


  if (totalElement) {

    totalElement.textContent =
      appointments.length;

  }


  if (confirmedElement) {

    confirmedElement.textContent =
      appointments.filter(
        app =>
          app.status === 'confirmado'
      ).length;

  }


  if (pendingElement) {

    pendingElement.textContent =
      appointments.filter(
        app =>
          app.status === 'pendiente'
      ).length;

  }

}


// ============================================
// ACTUALIZAR ESTADO DE LA DEMO
// ============================================

function updateDemoStatus() {

  if (!demoCounter) {
    return;
  }


  const count =
    appointments.length;


  demoCounter.textContent =
    `Demo: ${count} / ${DEMO_LIMIT}`;


  const limitReached =
    count >= DEMO_LIMIT;


  if (limitReached) {

    limitMessage.classList.add(
      'active'
    );


    form.querySelectorAll(
      'input, select'
    ).forEach(element => {

      element.disabled =
        true;

    });


    btnSubmitAppointment.disabled =
      true;


    btnSubmitAppointment.textContent =
      '🔒 Demo finalizada';


  } else {

    limitMessage.classList.remove(
      'active'
    );


    form.querySelectorAll(
      'input, select'
    ).forEach(element => {

      element.disabled =
        false;

    });


    btnSubmitAppointment.disabled =
      false;


    btnSubmitAppointment.textContent =
      'Reservar Turno';

  }

}


// ============================================
// ESCAPAR HTML
// ============================================

function escapeHtml(text) {

  const div =
    document.createElement(
      'div'
    );


  div.textContent =
    text ?? '';


  return div.innerHTML;

}


// ============================================
// RENDERIZAR TURNOS
// ============================================

function renderAppointments() {

  if (!container) {
    return;
  }


  container.innerHTML =
    '';


  const searchTerm =
    searchInput.value
      .toLowerCase()
      .trim();


  const selectedStatus =
    filterStatus.value;


  const filtered =
    appointments.filter(
      app => {

        const name =
          String(
            app.name || ''
          ).toLowerCase();


        const service =
          String(
            app.service || ''
          ).toLowerCase();


        const matchesSearch =
          name.includes(
            searchTerm
          ) ||
          service.includes(
            searchTerm
          );


        const matchesStatus =
          selectedStatus === 'todos' ||
          app.status ===
            selectedStatus;


        return (
          matchesSearch &&
          matchesStatus
        );

      }
    );


  if (
    filtered.length === 0
  ) {

    container.innerHTML = `

      <div class="empty-state">

        <p>
          No se encontraron turnos registrados.
        </p>

      </div>

    `;


    updateStats();

    return;

  }


  // Ordenar por fecha y hora

  filtered.sort(
    (a, b) =>
      new Date(
        `${a.date}T${a.time}`
      ) -
      new Date(
        `${b.date}T${b.time}`
      )
  );


  // Crear tarjetas

  filtered.forEach(
    app => {

      const card =
        document.createElement(
          'div'
        );


      card.className =
        'appointment-card';


      // WhatsApp

      const cleanPhone =
        String(
          app.phone || ''
        ).replace(
          /[^0-9]/g,
          ''
        );


      const wsText =
        encodeURIComponent(
          `Hola ${app.name}, te contactamos desde Patric Soft para recordar tu turno de ${app.service} el día ${app.date} a las ${app.time} hs.`
        );


      const whatsappUrl =
        `https://wa.me/${cleanPhone}?text=${wsText}`;


      // Tarjeta

      card.innerHTML = `

        <div class="app-info">

          <h3>
            ${escapeHtml(
              app.name
            )}
          </h3>


          <p>

            <span>
              📌 ${escapeHtml(
                app.service
              )}
            </span>

            <span>
              📅 ${escapeHtml(
                app.date
              )}
              -
              ${escapeHtml(
                app.time
              )}
              hs
            </span>

            <span>
              📞 ${escapeHtml(
                app.phone
              )}
            </span>

          </p>

        </div>


        <div class="appointment-right">

          <span
            class="status-badge status-${escapeHtml(
              app.status
            )}"
          >
            ${escapeHtml(
              app.status
            )}
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
              app.status !==
              'confirmado'

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
              app.status !==
              'cancelado'

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


      container.appendChild(
        card
      );

    }
  );


  updateStats();

}


// ============================================
// AGREGAR NUEVO TURNO
// ============================================

form.addEventListener(
  'submit',
  event => {

    event.preventDefault();


    if (!currentUser) {

      showToast(
        'Debés iniciar sesión para registrar un turno.'
      );

      return;

    }


    // Control de demo

    if (
      appointments.length >=
      DEMO_LIMIT
    ) {

      showToast(
        'La demo gratuita ya alcanzó sus 3 turnos.'
      );

      updateDemoStatus();

      return;

    }


    const newApp = {

      id:
        `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,

      name:
        document
          .getElementById(
            'client-name'
          )
          .value
          .trim(),

      phone:
        document
          .getElementById(
            'client-phone'
          )
          .value
          .trim(),

      service:
        document
          .getElementById(
            'service-type'
          )
          .value,

      date:
        document
          .getElementById(
            'app-date'
          )
          .value,

      time:
        document
          .getElementById(
            'app-time'
          )
          .value,

      status:
        'pendiente'

    };


    appointments.push(
      newApp
    );


    saveData();

    renderAppointments();


    form.reset();


    initializeDate();


    showToast(
      'Turno registrado con éxito'
    );

  }
);


// ============================================
// CAMBIAR ESTADO
// ============================================

window.changeStatus =
  function(
    id,
    newStatus
  ) {

    appointments =
      appointments.map(
        app => {

          if (
            app.id === id
          ) {

            return {

              ...app,

              status:
                newStatus

            };

          }


          return app;

        }
      );


    saveData();

    renderAppointments();


    showToast(
      `Estado actualizado a ${newStatus}`
    );

  };


// ============================================
// ELIMINAR TURNO
// ============================================

window.deleteAppointment =
  function(id) {

    appointments =
      appointments.filter(
        app =>
          app.id !== id
      );


    saveData();

    renderAppointments();

    updateDemoStatus();


    showToast(
      'Turno eliminado'
    );

  };


// ============================================
// ESCAPAR VALORES CSV
// ============================================

function escapeCsvValue(
  value
) {

  return `"${String(
    value ?? ''
  ).replace(
    /"/g,
    '""'
  )}"`;

}


// ============================================
// EXPORTAR CSV
// ============================================

btnExport.addEventListener(
  'click',
  () => {

    if (
      appointments.length ===
      0
    ) {

      showToast(
        'No hay datos para exportar'
      );

      return;

    }


    let csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      'ID,Cliente,Telefono,Servicio,Fecha,Hora,Estado\n';


    appointments.forEach(
      app => {

        csvContent += [

          escapeCsvValue(
            app.id
          ),

          escapeCsvValue(
            app.name
          ),

          escapeCsvValue(
            app.phone
          ),

          escapeCsvValue(
            app.service
          ),

          escapeCsvValue(
            app.date
          ),

          escapeCsvValue(
            app.time
          ),

          escapeCsvValue(
            app.status
          )

        ].join(',') +
        '\n';

      }
    );


    const encodedUri =
      encodeURI(
        csvContent
      );


    const link =
      document.createElement(
        'a'
      );


    link.setAttribute(
      'href',
      encodedUri
    );


    link.setAttribute(
      'download',
      `turnos_patric_soft_${new Date()
        .toISOString()
        .split('T')[0]}.csv`
    );


    document.body.appendChild(
      link
    );


    link.click();


    document.body.removeChild(
      link
    );


    showToast(
      'Reporte exportado correctamente'
    );

  }
);


// ============================================
// BÚSQUEDA
// ============================================

searchInput.addEventListener(
  'input',
  renderAppointments
);


// ============================================
// FILTRO
// ============================================

filterStatus.addEventListener(
  'change',
  renderAppointments
);


// ============================================
// INICIALIZACIÓN
// ============================================

initializeDate();

checkSession();
