// ============================================
// TURN PRO | PATRIC SOFT
// SCRIPT PRINCIPAL - SUPABASE
// ============================================


// ============================================
// CONFIGURACIÓN SUPABASE
// ============================================

const SUPABASE_URL =
  'https://elvcdlhhjphbfunybjlu.supabase.co';

const SUPABASE_PUBLISHABLE_KEY =
  'sb_publishable_DTMOZTGWyRMKbs41aVJajQ_VBpGGqPt';

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );


// ============================================
// CONFIGURACIÓN DEMO
// ============================================

const DEMO_LIMIT = 3;


// ============================================
// ESTADO DE LA APLICACIÓN
// ============================================

let currentUser = null;
let currentProfile = null;
let appointments = [];


// ============================================
// ELEMENTOS AUTH
// ============================================

const authScreen =
  document.getElementById('auth-screen');

const loginForm =
  document.getElementById('login-form');

const registerForm =
  document.getElementById('register-form');

const showRegister =
  document.getElementById('show-register');

const showLogin =
  document.getElementById('show-login');

const authMessage =
  document.getElementById('auth-message');

const loginButton =
  document.getElementById('login-button');

const registerButton =
  document.getElementById('register-button');

const logoutButton =
  document.getElementById('logout-button');


// ============================================
// ELEMENTOS APP
// ============================================

const appScreen =
  document.getElementById('app-screen');

const appointmentForm =
  document.getElementById('appointment-form');

const appointmentsContainer =
  document.getElementById(
    'appointments-container'
  );

const searchInput =
  document.getElementById('search-input');

const filterStatus =
  document.getElementById('filter-status');

const exportButton =
  document.getElementById('btn-export');

const limitInfo =
  document.getElementById('limit-info');

const submitAppointment =
  document.getElementById(
    'submit-appointment'
  );

const userInfo =
  document.getElementById('user-info');

const planBadge =
  document.getElementById('plan-badge');


// ============================================
// ESTADÍSTICAS
// ============================================

const statTotal =
  document.getElementById('stat-total');

const statConfirmed =
  document.getElementById('stat-confirmed');

const statPending =
  document.getElementById('stat-pending');


// ============================================
// MOSTRAR MENSAJE AUTH
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
// TOAST
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
// MOSTRAR LOGIN
// ============================================

function showLoginScreen() {

  if (authScreen) {
    authScreen.hidden = false;
    authScreen.style.display = 'flex';
  }

  if (appScreen) {
    appScreen.hidden = true;
  }

  currentUser = null;
  currentProfile = null;
  appointments = [];
}


// ============================================
// MOSTRAR APLICACIÓN
// ============================================

function showAppScreen() {

  if (authScreen) {
    authScreen.hidden = true;
    authScreen.style.display = 'none';
  }

  if (appScreen) {
    appScreen.hidden = false;
  }
}


// ============================================
// CAMBIAR A REGISTRO
// ============================================

showRegister?.addEventListener(
  'click',
  () => {

    if (loginForm) {
      loginForm.hidden = true;
    }

    if (registerForm) {
      registerForm.hidden = false;
    }

    clearAuthMessage();
  }
);


// ============================================
// CAMBIAR A LOGIN
// ============================================

showLogin?.addEventListener(
  'click',
  () => {

    if (registerForm) {
      registerForm.hidden = true;
    }

    if (loginForm) {
      loginForm.hidden = false;
    }

    clearAuthMessage();
  }
);


// ============================================
// REGISTRO
// ============================================

registerForm?.addEventListener(
  'submit',
  async event => {

    event.preventDefault();

    clearAuthMessage();

    const email =
      document
        .getElementById(
          'register-email'
        )
        ?.value
        .trim();

    const password =
      document
        .getElementById(
          'register-password'
        )
        ?.value;

    const passwordConfirm =
      document
        .getElementById(
          'register-password-confirm'
        )
        ?.value;


    if (
      !email ||
      !password ||
      !passwordConfirm
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


    if (password !== passwordConfirm) {

      showAuthMessage(
        'Las contraseñas no coinciden.'
      );

      return;
    }


    registerButton.disabled =
      true;

    registerButton.textContent =
      '⏳ Creando cuenta...';


    try {

      const {
        data,
        error
      } =
        await supabaseClient.auth.signUp({

          email,

          password

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
        '¡Cuenta creada correctamente! Ya podés iniciar sesión.',
        'success'
      );


      registerForm.reset();


      setTimeout(() => {

        registerForm.hidden =
          true;

        loginForm.hidden =
          false;

        clearAuthMessage();

      }, 1800);


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
          .includes(
            'already registered'
          )
      ) {

        message =
          'Ese correo electrónico ya está registrado.';

      } else if (
        error.message
          ?.toLowerCase()
          .includes(
            'password'
          )
      ) {

        message =
          'La contraseña no cumple los requisitos.';

      } else if (
        error.message
      ) {

        message =
          error.message;
      }


      showAuthMessage(
        message
      );

    } finally {

      registerButton.disabled =
        false;

      registerButton.textContent =
        'Crear cuenta';
    }
  }
);


// ============================================
// LOGIN
// ============================================

loginForm?.addEventListener(
  'submit',
  async event => {

    event.preventDefault();

    clearAuthMessage();


    const email =
      document
        .getElementById(
          'login-email'
        )
        ?.value
        .trim();

    const password =
      document
        .getElementById(
          'login-password'
        )
        ?.value;


    if (!email || !password) {

      showAuthMessage(
        'Completá tu correo y contraseña.'
      );

      return;
    }


    loginButton.disabled =
      true;

    loginButton.textContent =
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
        'Error de login:',
        error
      );


      showAuthMessage(
        'Correo o contraseña incorrectos.'
      );


    } finally {

      loginButton.disabled =
        false;

      loginButton.textContent =
        'Iniciar sesión';
    }
  }
);


// ============================================
// LOGOUT
// ============================================

logoutButton?.addEventListener(
  'click',
  async () => {

    logoutButton.disabled =
      true;


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
        'Error cerrando sesión:',
        error
      );


      showToast(
        'No se pudo cerrar la sesión.'
      );


    } finally {

      logoutButton.disabled =
        false;
    }
  }
);


// ============================================
// CARGAR PERFIL
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
      throw error;
    }


    currentProfile =
      data;


    if (!currentProfile) {

      console.warn(
        'El usuario no tiene perfil todavía.'
      );

      return;
    }


    updateUserInterface();


  } catch (error) {

    console.error(
      'Error cargando perfil:',
      error
    );
  }
}


// ============================================
// ACTUALIZAR INTERFAZ DEL USUARIO
// ============================================

function updateUserInterface() {

  if (!currentUser) {
    return;
  }


  const businessName =
    currentProfile?.business_name ||
    'Mi Negocio';


  if (userInfo) {

    userInfo.innerHTML = `

      <strong>
        ${escapeHtml(businessName)}
      </strong>

      <span>
        ${escapeHtml(
          currentUser.email || ''
        )}
      </span>

    `;
  }


  const plan =
    currentProfile?.plan ||
    'demo';


  if (planBadge) {

    planBadge.textContent =
      plan.toUpperCase();
  }
}


// ============================================
// CARGAR TURNOS DESDE SUPABASE
// ============================================

async function loadAppointments() {

  if (!currentUser) {
    appointments = [];
    return;
  }


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from('appointments')
        .select('*')
        .eq(
          'user_id',
          currentUser.id
        )
        .order(
          'date',
          {
            ascending: true
          }
        )
        .order(
          'time',
          {
            ascending: true
          }
        );


    if (error) {
      throw error;
    }


    appointments =
      data || [];


    renderAppointments();

    updateStats();

    updateDemoStatus();


  } catch (error) {

    console.error(
      'Error cargando turnos:',
      error
    );


    showToast(
      'No se pudieron cargar los turnos.'
    );
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


  showAppScreen();


  await loadProfile();

  await loadAppointments();


  initializeDate();
}


// ============================================
// SESIÓN INICIAL
// ============================================

async function checkSession() {

  try {

    const {
      data,
      error
    } =
      await supabaseClient.auth.getSession();


    if (error) {
      throw error;
    }


    if (data.session) {

      await showApplication(
        data.session
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
// CAMBIOS DE SESIÓN
// ============================================

supabaseClient.auth.onAuthStateChange(
  async (
    event,
    session
  ) => {

    console.log(
      'Auth event:',
      event
    );


    if (
      session &&
      (
        event ===
          'SIGNED_IN' ||

        event ===
          'INITIAL_SESSION' ||

        event ===
          'TOKEN_REFRESHED'
      )
    ) {

      await showApplication(
        session
      );
    }


    if (
      event ===
      'SIGNED_OUT'
    ) {

      showLoginScreen();
    }
  }
);


// ============================================
// FECHA MÍNIMA
// ============================================

function initializeDate() {

  const dateInput =
    document.getElementById(
      'app-date'
    );


  if (!dateInput) {
    return;
  }


  const today =
    new Date()
      .toISOString()
      .split('T')[0];


  dateInput.min =
    today;
}


// ============================================
// ESTADÍSTICAS
// ============================================

function updateStats() {

  if (statTotal) {

    statTotal.textContent =
      appointments.length;
  }


  if (statConfirmed) {

    statConfirmed.textContent =
      appointments.filter(
        appointment =>
          appointment.status ===
          'confirmado'
      ).length;
  }


  if (statPending) {

    statPending.textContent =
      appointments.filter(
        appointment =>
          appointment.status ===
          'pendiente'
      ).length;
  }
}


// ============================================
// ESTADO DEMO
// ============================================

function updateDemoStatus() {

  const isDemo =
    (
      currentProfile?.plan ||
      'demo'
    ) === 'demo';


  const count =
    appointments.length;


  if (!limitInfo) {
    return;
  }


  if (!isDemo) {

    limitInfo.innerHTML =
      'Plan activo: <strong>sin límite de demo</strong>';

    limitInfo.classList.remove(
      'active'
    );

    if (submitAppointment) {
      submitAppointment.disabled =
        false;

      submitAppointment.textContent =
        'Reservar Turno';
    }

    appointmentForm
      ?.querySelectorAll(
        'input, select'
      )
      .forEach(
        element => {
          element.disabled =
            false;
        }
      );

    return;
  }


  if (count >= DEMO_LIMIT) {

    limitInfo.innerHTML = `
      🔒 Demo finalizada:
      <strong>${count} / ${DEMO_LIMIT}</strong>
      turnos utilizados.
    `;


    limitInfo.classList.add(
      'active'
    );


    appointmentForm
      ?.querySelectorAll(
        'input, select'
      )
      .forEach(
        element => {
          element.disabled =
            true;
        }
      );


    if (submitAppointment) {

      submitAppointment.disabled =
        true;

      submitAppointment.textContent =
        '🔒 Demo finalizada';
    }


  } else {

    limitInfo.innerHTML = `
      🎯 Demo:
      <strong>${count} / ${DEMO_LIMIT}</strong>
      turnos utilizados.
    `;


    limitInfo.classList.remove(
      'active'
    );


    appointmentForm
      ?.querySelectorAll(
        'input, select'
      )
      .forEach(
        element => {
          element.disabled =
            false;
        }
      );


    if (submitAppointment) {

      submitAppointment.disabled =
        false;

      submitAppointment.textContent =
        'Reservar Turno';
    }
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

  if (!appointmentsContainer) {
    return;
  }


  appointmentsContainer.innerHTML =
    '';


  const searchTerm =
    searchInput?.value
      ?.toLowerCase()
      .trim() || '';


  const selectedStatus =
    filterStatus?.value ||
    'todos';


  const filtered =
    appointments
      .filter(
        appointment => {

          const name =
            String(
              appointment.name || ''
            ).toLowerCase();


          const service =
            String(
              appointment.service || ''
            ).toLowerCase();


          const matchesSearch =
            name.includes(
              searchTerm
            ) ||
            service.includes(
              searchTerm
            );


          const matchesStatus =
            selectedStatus ===
              'todos' ||

            appointment.status ===
              selectedStatus;


          return (
            matchesSearch &&
            matchesStatus
          );
        }
      )
      .sort(
        (a, b) => {

          const dateA =
            new Date(
              `${a.date}T${a.time}`
            );


          const dateB =
            new Date(
              `${b.date}T${b.time}`
            );


          return dateA - dateB;
        }
      );


  if (
    filtered.length ===
    0
  ) {

    appointmentsContainer.innerHTML = `

      <div class="empty-state">

        <p>
          No se encontraron turnos registrados.
        </p>

      </div>

    `;

    return;
  }


  filtered.forEach(
    appointment => {

      const card =
        document.createElement(
          'div'
        );


      card.className =
        'appointment-card';


      const cleanPhone =
        String(
          appointment.phone || ''
        ).replace(
          /[^0-9]/g,
          ''
        );


      const whatsappMessage =
        encodeURIComponent(
          `Hola ${appointment.name}, te contactamos desde Patric Soft para recordar tu turno de ${appointment.service} el día ${appointment.date} a las ${appointment.time} hs.`
        );


      const whatsappUrl =
        `https://wa.me/${cleanPhone}?text=${whatsappMessage}`;


      const confirmButton =
        appointment.status !==
        'confirmado'
          ? `
            <button
              type="button"
              class="btn-action"
              onclick="changeStatus('${appointment.id}', 'confirmado')"
              title="Confirmar"
              aria-label="Confirmar turno"
            >
              ✓
            </button>
          `
          : '';


      const cancelButton =
        appointment.status !==
        'cancelado'
          ? `
            <button
              type="button"
              class="btn-action"
              onclick="changeStatus('${appointment.id}', 'cancelado')"
              title="Cancelar"
              aria-label="Cancelar turno"
            >
              ✕
            </button>
          `
          : '';


      card.innerHTML = `

        <div class="app-info">

          <h3>
            ${escapeHtml(
              appointment.name
            )}
          </h3>

          <p>

            <span>
              📌
              ${escapeHtml(
                appointment.service
              )}
            </span>

            <span>
              📅
              ${escapeHtml(
                appointment.date
              )}
              -
              ${escapeHtml(
                appointment.time
              )}
              hs
            </span>

            <span>
              📞
              ${escapeHtml(
                appointment.phone
              )}
            </span>

          </p>

        </div>


        <div class="appointment-right">

          <span
            class="status-badge status-${escapeHtml(
              appointment.status
            )}"
          >
            ${escapeHtml(
              appointment.status
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


            ${confirmButton}


            ${cancelButton}


            <button
              type="button"
              class="btn-action"
              onclick="deleteAppointment('${appointment.id}')"
              title="Eliminar"
              aria-label="Eliminar turno"
            >
              🗑
            </button>

          </div>

        </div>

      `;


      appointmentsContainer.appendChild(
        card
      );
    }
  );
}


// ============================================
// CREAR TURNO
// ============================================

appointmentForm?.addEventListener(
  'submit',
  async event => {

    event.preventDefault();


    if (!currentUser) {

      showToast(
        'Debés iniciar sesión.'
      );

      return;
    }


    const isDemo =
      (
        currentProfile?.plan ||
        'demo'
      ) === 'demo';


    if (
      isDemo &&
      appointments.length >=
        DEMO_LIMIT
    ) {

      showToast(
        'La demo gratuita ya alcanzó sus 3 turnos.'
      );

      updateDemoStatus();

      return;
    }


    const name =
      document
        .getElementById(
          'client-name'
        )
        ?.value
        .trim();


    const phone =
      document
        .getElementById(
          'client-phone'
        )
        ?.value
        .trim();


    const service =
      document
        .getElementById(
          'service-type'
        )
        ?.value;


    const date =
      document
        .getElementById(
          'app-date'
        )
        ?.value;


    const time =
      document
        .getElementById(
          'app-time'
        )
        ?.value;


    if (
      !name ||
      !phone ||
      !service ||
      !date ||
      !time
    ) {

      showToast(
        'Completá todos los campos.'
      );

      return;
    }


    submitAppointment.disabled =
      true;

    submitAppointment.textContent =
      '⏳ Guardando...';


    try {

      const {
        data,
        error
      } =
        await supabaseClient
          .from('appointments')
          .insert({

            user_id:
              currentUser.id,

            name,

            phone,

            service,

            date,

            time,

            status:
              'pendiente'

          })
          .select()
          .single();


      if (error) {
        throw error;
      }


      if (data) {

        appointments.push(
          data
        );
      }


      appointmentForm.reset();

      initializeDate();

      renderAppointments();

      updateStats();

      updateDemoStatus();


      showToast(
        '✅ Turno registrado correctamente.'
      );


    } catch (error) {

      console.error(
        'Error creando turno:',
        error
      );


      showToast(
        '❌ No se pudo guardar el turno.'
      );


    } finally {

      updateDemoStatus();
    }
  }
);


// ============================================
// CAMBIAR ESTADO
// ============================================

window.changeStatus =
  async function(
    id,
    newStatus
  ) {

    if (!currentUser) {
      return;
    }


    try {

      const {
        error
      } =
        await supabaseClient
          .from('appointments')
          .update({

            status:
              newStatus

          })
          .eq(
            'id',
            id
          )
          .eq(
            'user_id',
            currentUser.id
          );


      if (error) {
        throw error;
      }


      appointments =
        appointments.map(
          appointment => {

            if (
              appointment.id ===
              id
            ) {

              return {

                ...appointment,

                status:
                  newStatus

              };
            }


            return appointment;
          }
        );


      renderAppointments();

      updateStats();


      showToast(
        `Estado actualizado a ${newStatus}.`
      );


    } catch (error) {

      console.error(
        'Error actualizando estado:',
        error
      );


      showToast(
        'No se pudo actualizar el estado.'
      );
    }
  };


// ============================================
// ELIMINAR TURNO
// ============================================

window.deleteAppointment =
  async function(id) {

    if (!currentUser) {
      return;
    }


    const confirmed =
      window.confirm(
        '¿Seguro que querés eliminar este turno?'
      );


    if (!confirmed) {
      return;
    }


    try {

      const {
        error
      } =
        await supabaseClient
          .from('appointments')
          .delete()
          .eq(
            'id',
            id
          )
          .eq(
            'user_id',
            currentUser.id
          );


      if (error) {
        throw error;
      }


      appointments =
        appointments.filter(
          appointment =>
            appointment.id !== id
        );


      renderAppointments();

      updateStats();

      updateDemoStatus();


      showToast(
        '🗑 Turno eliminado correctamente.'
      );


    } catch (error) {

      console.error(
        'Error eliminando turno:',
        error
      );


      showToast(
        'No se pudo eliminar el turno.'
      );
    }
  };


// ============================================
// EXPORTAR CSV
// ============================================

function escapeCsvValue(value) {

  return `"${String(
    value ?? ''
  ).replace(
    /"/g,
    '""'
  )}"`;
}


exportButton?.addEventListener(
  'click',
  () => {

    if (
      appointments.length ===
      0
    ) {

      showToast(
        'No hay datos para exportar.'
      );

      return;
    }


    let csvContent =
      '\uFEFF' +
      'ID,Cliente,Telefono,Servicio,Fecha,Hora,Estado\n';


    appointments.forEach(
      appointment => {

        csvContent += [

          escapeCsvValue(
            appointment.id
          ),

          escapeCsvValue(
            appointment.name
          ),

          escapeCsvValue(
            appointment.phone
          ),

          escapeCsvValue(
            appointment.service
          ),

          escapeCsvValue(
            appointment.date
          ),

          escapeCsvValue(
            appointment.time
          ),

          escapeCsvValue(
            appointment.status
          )

        ].join(',') + '\n';
      }
    );


    const blob =
      new Blob(
        [csvContent],
        {
          type:
            'text/csv;charset=utf-8;'
        }
      );


    const url =
      URL.createObjectURL(
        blob
      );


    const link =
      document.createElement(
        'a'
      );


    link.href =
      url;


    link.download =
      `turnos_patric_soft_${new Date()
        .toISOString()
        .split('T')[0]}.csv`;


    document.body.appendChild(
      link
    );


    link.click();

    document.body.removeChild(
      link
    );


    URL.revokeObjectURL(
      url
    );


    showToast(
      '📊 Reporte exportado correctamente.'
    );
  }
);


// ============================================
// BÚSQUEDA
// ============================================

searchInput?.addEventListener(
  'input',
  renderAppointments
);


// ============================================
// FILTRO
// ============================================

filterStatus?.addEventListener(
  'change',
  renderAppointments
);


// ============================================
// INICIALIZACIÓN
// ============================================

initializeDate();

checkSession();
