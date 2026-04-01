
const svgProfile = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
const svgShop = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>`;
const svgStar = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
const svgMoon = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
const svgSun = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;

let pointValues = [5, 10, 30];
let shopItems = [
    { name: 'Elegir Asiento', cost: 100, icon: '🪑' },
    { name: 'Música en Clase', cost: 150, icon: '🎵' },
    { name: 'Pase de Tiempo Libre', cost: 250, icon: '⏱️' },
    { name: 'Ticket No Tarea', cost: 500, icon: '🎫' }
];

let rewardSources = [
    { title: 'Participación Estelar', desc: 'Levantar la mano y participar activamente en clase.', points: 10, icon: '🗣️' },
    { title: 'Tarea Completa', desc: 'Entregar tus deberes a tiempo y con buena calidad.', points: 20, icon: '📚' },
    { title: 'Ayudante Pro', desc: 'Colaborar con el profesor y ayudar a repartir materiales.', points: 15, icon: '🤝' },
    { title: 'Compañerismo', desc: 'Ayudar a un compañero que tenga dudas o dificultades.', points: 10, icon: '💖' },
    { title: 'Super Silencio', desc: 'Trabajar en total concentración durante las actividades.', points: 5, icon: '🤫' }
];

const libIcons = ['🪑','🎵','⏱️','🎫','🎮','🍬','📚','🏆','⭐','🍕','🎨','🎲','🧩','🧸','📱','💻','🏀','⚽','🍎','💡','🌟','⚡','🔮','👑','🗣️','🧹','🤝','💖','🤫','🚀','✅','📝','📅','🎒','🥛','🥗'];
let cfgShopEditingIndex = null;
let cfgGuideEditingIndex = null;

if(localStorage.getItem('gamificacion_points')) {
    try { pointValues = JSON.parse(localStorage.getItem('gamificacion_points')); } catch(e){}
}
if(localStorage.getItem('gamificacion_shop')) {
    try { shopItems = JSON.parse(localStorage.getItem('gamificacion_shop')); } catch(e){}
}
if(localStorage.getItem('gamificacion_guide')) {
    try { rewardSources = JSON.parse(localStorage.getItem('gamificacion_guide')); } catch(e){}
}


// --- Configuración y Datos ---
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('aventura_dark_mode', isDark);
    document.getElementById('btn-dark-mode').innerHTML = isDark ? svgSun : svgMoon;
}

if(localStorage.getItem('aventura_dark_mode') === 'true') {
    document.body.classList.add('dark-mode');
    document.getElementById('btn-dark-mode').innerHTML = svgSun;
} else {
    document.getElementById('btn-dark-mode').innerHTML = svgMoon;
}

function getLevelInfo(xp) {
    const level = Math.floor((-1 + Math.sqrt(1 + 8 * (Math.max(0, xp) / 25 + 1))) / 2);
    const xpNeededForCurrentLevel = 12.5 * level * level + 12.5 * level - 25;
    const xpInLevel = Math.max(0, xp - xpNeededForCurrentLevel);
    const xpForNextLevel = 25 * level + 25;
    const pct = (xpInLevel / xpForNextLevel) * 100;
    return { level, xpInLevel: Math.floor(xpInLevel), xpForNextLevel, pct };
}

let role = 'student'; // 'teacher' o 'student'
let currentCourse = null;
updateMassXPText();
let selectedStudents = new Set(); // conjunto de IDs seleccionados
let searchTerm = '';
let currentProfileId = null;
let currentShopStudentId = null;
let viewMode = 'grid'; // 'grid' o 'list'
let sortMode = 'xp'; // 'xp' o 'alpha'

function toggleViewMode() {
    viewMode = viewMode === 'grid' ? 'list' : 'grid';
    document.getElementById('svg-view-grid').classList.toggle('hidden');
    document.getElementById('svg-view-list').classList.toggle('hidden');
    renderList();
}

function changeSort(mode) {
    sortMode = mode;
    // Dar estilo visual al botón seleccionado
    const btnXp = document.getElementById('btn-sort-xp');
    const btnAlpha = document.getElementById('btn-sort-alpha');
    if(mode === 'xp') {
        btnXp.style.background = 'var(--yellowPrimary)';
        btnXp.style.color = '#78350F';
        btnXp.style.borderColor = '#F59E0B';
        btnAlpha.style.background = 'var(--btnBg)';
        btnAlpha.style.color = 'var(--btnText)';
        btnAlpha.style.borderColor = 'var(--btnBorder)';
    } else {
        btnAlpha.style.background = 'var(--yellowPrimary)';
        btnAlpha.style.color = '#78350F';
        btnAlpha.style.borderColor = '#F59E0B';
        btnXp.style.background = 'var(--btnBg)';
        btnXp.style.color = 'var(--btnText)';
        btnXp.style.borderColor = 'var(--btnBorder)';
    }
    renderList();
}

// (Shop Items moved up)

function prepareStudent(s) {
    if(!s.history) s.history = [];
    if(!s.badges) s.badges = [];
    if(!s.inventory) s.inventory = [];
    if(typeof s.sessionXP === 'undefined') s.sessionXP = 0;
    if(!s.sessionBadges) s.sessionBadges = [];
    if(typeof s.gold === 'undefined') s.gold = Math.max(0, s.xp); // Migración de datos automática
    return s;
}

function onSearch(val) {
    searchTerm = val.trim().toLowerCase();
    renderList();
}

// Lista de nombres ficticios para generar 40 alumnos rápidamente
const fakeNames = "Agustín Silva,Martina González,Lucas Muñoz,Sofía Rojas,Matías Díaz,Valentina Pérez,Joaquín Soto,Isidora Contreras,Tomás Silva,Emilia Martínez,Vicente Sepúlveda,Florencia Morales,Maximiliano Rodríguez,Josefa López,Felipe Fuentes,Antonella Hernández,Benjamín Torres,Ignacia Araya,Sebastián Flores,Catalina Espinoza,Martín Valenzuela,Javiera Castillo,Diego Tapia,Fernanda Reyes,Nicolás Gutiérrez,Constanza Castro,Renato Pizarro,Camila Álvarez,Bastián Vásquez,Amanda Sánchez,Gabriel Fernández,Daniela Gómez,Alonso Cortés,Antonia Herrera,Mateo Núñez,Romina Jara,Simón Vergara,Pía Rivera,Pedro Figueroa,Paula Riquelme".split(",");

// Almacén de Cursos y Estudiantes
let courses = {
    // 6° C ya precargado con los 40 estudiantes fake, con niveles y XP variados para testear
    "6° C": fakeNames.map((n, i) => ({ 
        id: i, 
        name: n, 
        xp: Math.floor(Math.random() * 850), // Empiezan entre 0 y 850 XP
        aliado: false 
    })),
    "5° A": [], // Curso vacío de ejemplo
    "5° B": []
};

// Cargar desde LocalStorage si existe (para sincronizar pestañas)
const localData = localStorage.getItem('gamificacion_cursos');
if(localData) {
    try { courses = JSON.parse(localData); } catch(e){}
}

// =============================================
// FIREBASE SETUP
// =============================================
const firebaseConfig = {
    apiKey: "AIzaSyAfVY2wIvoCuG23Hg-oKAKyW_A9wxFsJF8",
    authDomain: "gamificacion-matematica.firebaseapp.com",
    projectId: "gamificacion-matematica",
    storageBucket: "gamificacion-matematica.firebasestorage.app",
    messagingSenderId: "909072205881",
    appId: "1:909072205881:web:517fbc5bbb405eb0fc65e8"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
let currentUser = null;


function loginWithGoogle() {
    const btn = document.getElementById('btn-google-login');
    const txt = document.getElementById('google-btn-text');
    // Mostrar estado de carga
    if (btn) { btn.style.opacity = '0.65'; btn.disabled = true; }
    if (txt) txt.textContent = 'Abriendo Google...';
    // Auto-reset after 10s in case popup is blocked silently
    const resetBtn = function() {
        if (btn) { btn.style.opacity = '1'; btn.disabled = false; }
        if (txt) txt.textContent = 'Iniciar sesión con Google';
    };
    const resetTimer = setTimeout(resetBtn, 10000);
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then(function() { clearTimeout(resetTimer); })
        .catch(function(err) {
            clearTimeout(resetTimer);
            resetBtn();
            if (err.code !== 'auth/popup-closed-by-user') {
                alert('Error: ' + err.message);
            }
        });
}


function signOut() {
    if(confirm('¿Cerrar sesión de profesor?')) {
        auth.signOut().then(() => location.reload());
    }
}

function continueAsStudent() {
    document.getElementById('login-overlay').style.display = 'none';
    // Mostrar la pantalla de selección de rol (dos mitades)
    switchView('roles');
}

auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        document.getElementById('login-overlay').style.display = 'none';
        // Mostrar botón de perfil en top bar
        const profileBtn = document.getElementById('user-profile-btn');
        if (profileBtn) {
            profileBtn.style.display = 'flex';
        }
        // Rellenar foto y fallback de iniciales
        const avatar = document.getElementById('user-avatar');
        const initials = document.getElementById('user-avatar-initials');
        const initStr = user.displayName ? user.displayName.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase() : '?';
        if (initials) initials.textContent = initStr;
        if (avatar) {
            if (user.photoURL) {
                // Añadir tamaño grande para mejor calidad
                const photoUrl = user.photoURL.replace('=s96-c', '=s200-c');
                avatar.src = photoUrl;
                avatar.style.display = 'block';
            } else {
                avatar.style.display = 'none';
                if (initials) initials.style.display = 'flex';
            }
        }
        const nameEl = document.getElementById('user-name');
        if(nameEl) nameEl.textContent = user.displayName ? user.displayName.split(' ')[0] : 'Profe';
        // Rellenar datos del menu flotante
        const menuAvatar = document.getElementById('menu-user-avatar');
        if(menuAvatar && user.photoURL) menuAvatar.src = user.photoURL;
        const menuName = document.getElementById('menu-user-name');
        if(menuName) menuName.textContent = user.displayName || 'Profesor';
        const menuEmail = document.getElementById('menu-user-email');
        if(menuEmail) menuEmail.textContent = user.email || '';
        // Cargar datos desde Firestore
        loadDataFromFirestore(user.uid);
    }
});

function toggleUserMenu() {
    const menu = document.getElementById('modal-user-menu');
    menu.classList.toggle('hidden');
}

// Cerrar el menú de usuario al hacer clic fuera
document.addEventListener('click', function(e) {
    const menu = document.getElementById('modal-user-menu');
    const btn = document.getElementById('user-profile-btn');
    if (menu && !menu.classList.contains('hidden')) {
        if (!menu.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
            menu.classList.add('hidden');
        }
    }
});

async function loadDataFromFirestore(uid) {
    try {
        const snap = await db.collection('teachers').doc(uid).get();
        if (snap.exists) {
            const data = snap.data();
            if (data.courses) courses = data.courses;
            if (data.shop) shopItems = data.shop;
            if (data.guide) rewardSources = data.guide;
            if (data.points) pointValues = data.points;
        }
    } catch(e) {
        console.warn('Error cargando desde Firestore, usando localStorage:', e);
    }
    // Ir a la pantalla de selección de rol primero
    switchView('roles');
}

async function saveData() {
    // Guardar siempre en localStorage (rápido y offline)
    localStorage.setItem('gamificacion_cursos', JSON.stringify(courses));
    // Si hay usuario logueado, guardar también en Firestore
    if (currentUser) {
        try {
            await db.collection('teachers').doc(currentUser.uid).set({
                courses: courses,
                shop: shopItems,
                guide: rewardSources,
                points: pointValues,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch(e) {
            console.warn('Error guardando en Firestore:', e);
        }
    }
}

// =============================================
// FIN FIREBASE SETUP
// =============================================


// --- Manejo de la Interfaz/Vistas ---

// ===== PIN MODAL LOGIC =====
let pinValue = '';
const TEACHER_PIN = '243524';

function requestTeacherPin() {
    pinValue = '';
    updatePinDisplay();
    document.getElementById('modal-pin-overlay').classList.remove('hidden');
}

function closePinModal() {
    pinValue = '';
    updatePinDisplay();
    document.getElementById('modal-pin-overlay').classList.add('hidden');
}

function pinPress(digit) {
    if (pinValue.length >= 6) return;
    pinValue += digit;
    updatePinDisplay();
    if (pinValue.length === 6) {
        setTimeout(() => pinConfirm(), 120);
    }
}

function pinDelete() {
    pinValue = pinValue.slice(0, -1);
    updatePinDisplay();
}

function updatePinDisplay() {
    for (let i = 0; i < 6; i++) {
        const dot = document.getElementById('pin-d' + i);
        if (!dot) continue;
        dot.classList.remove('filled', 'error');
        if (i < pinValue.length) dot.classList.add('filled');
    }
}

function pinConfirm() {
    if (pinValue === TEACHER_PIN) {
        closePinModal();
        setRole('teacher');
    } else {
        // Animar error
        for (let i = 0; i < 6; i++) {
            const dot = document.getElementById('pin-d' + i);
            if (dot) { dot.classList.remove('filled'); dot.classList.add('error'); }
        }
        setTimeout(() => {
            pinValue = '';
            updatePinDisplay();
        }, 800);
    }
}

function setRole(r) {
    role = r;
    selectedStudents.clear();
    document.body.setAttribute('data-role', role);
    switchView('courses');
    renderCourses();
}

function goHomeFromDash() {
    // Desde el dashboard, ir al selector de roles
    switchView('roles');
}

function toggleRole() {
    role = role === 'teacher' ? 'student' : 'teacher';
    selectedStudents.clear();
    document.body.setAttribute('data-role', role);
    renderList(); // Refresca botones y titulos
}

function switchView(vId) {
    ['roles', 'courses', 'dash', 'config'].forEach(id => document.getElementById('view-'+id).classList.add('hidden'));
    document.getElementById('view-'+vId).classList.remove('hidden');
}

// --- Renderizados ---

function renderCourses() {
    const cb = document.getElementById('course-buttons');
    cb.innerHTML = '';

    // Iconos rotativos por curso
    const courseIcons = ['\ud83d\udcd6','\ud83e\uddee','\ud83d\udd2c','\ud83c\udfa8','\ud83c\udf0d','\ud83e\uddea','\ud83d\udcd0','\ud83c\udfa4','\ud83c\udfeb','\ud83c\udf1f'];
    const colorCount = 5;

    // Panel agregar curso
    const addPanel = document.getElementById('add-course-panel');
    if (addPanel) addPanel.style.display = (role === 'teacher') ? '' : 'none';

    // Badge modo estudiante
    const badge = document.getElementById('student-mode-badge');
    if (badge) badge.classList.toggle('hidden', role !== 'student');

    // Titulo e icono segun rol
    const coursesTitle = document.getElementById('courses-view-title');
    if (coursesTitle) coursesTitle.textContent = role === 'student' ? 'Elige tu Curso' : 'Seleccionar Curso';
    const coursesIcon = document.getElementById('courses-view-icon');
    if (coursesIcon) coursesIcon.textContent = role === 'student' ? '\ud83c\udf93' : '\ud83d\udcda';

    const coursesHint = document.getElementById('courses-view-hint');
    if (coursesHint) {
        coursesHint.textContent = role === 'student' ? 'Selecciona tu aula para ver el ranking' : 'Selecciona un curso para abrir la pizarra';
    }

    const courseKeys = Object.keys(courses);
    if (courseKeys.length === 0) {
        cb.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:rgba(255,255,255,0.5);font-size:1.2rem;font-weight:800;padding:40px 20px;">
            <div style="font-size:4rem;margin-bottom:16px;">\ud83d\udced</div>
            No hay cursos a\u00fan.<br>\u00a1Crea el primero arriba!
        </div>`;
        return;
    }

    courseKeys.forEach((c, idx) => {
        const colorIdx = idx % colorCount;
        const icon = courseIcons[idx % courseIcons.length];
        const count = courses[c].length;

        const card = document.createElement('div');
        card.className = `course-card course-color-${colorIdx}`;
        card.style.animation = `slideUpFade 0.4s ease-out ${idx * 0.08}s both`;

        card.innerHTML = `
            <span class="course-card-icon" style="animation-delay:${idx * 0.3}s">${icon}</span>
            <div class="course-card-name">${c}</div>
            <div class="course-card-count">${count} estudiante${count !== 1 ? 's' : ''}</div>
            <button class="course-card-btn">\u25b6 ENTRAR</button>
        `;

        card.onclick = () => {
            currentCourse = c;
            selectedStudents.clear();
            searchTerm = '';
            const searchInput = document.getElementById('search-input');
            if (searchInput) searchInput.value = '';
            initDash();
        };

        if (role === 'teacher') {
            const delBtn = document.createElement('button');
            delBtn.innerHTML = '\u2716';
            delBtn.title = 'Eliminar curso';
            delBtn.style.cssText = `position:absolute;top:12px;right:12px;background:rgba(239,68,68,0.25);border:2px solid rgba(239,68,68,0.4);color:#fca5a5;border-radius:50%;width:32px;height:32px;font-size:0.85rem;cursor:pointer;font-weight:900;display:flex;align-items:center;justify-content:center;transition:0.2s;backdrop-filter:blur(4px);padding:0;font-family:'Nunito',sans-serif;`;
            delBtn.onmouseover = () => { delBtn.style.background = 'rgba(239,68,68,0.5)'; delBtn.style.color = '#fff'; };
            delBtn.onmouseout = () => { delBtn.style.background = 'rgba(239,68,68,0.25)'; delBtn.style.color = '#fca5a5'; };
            delBtn.onclick = (e) => {
                e.stopPropagation();
                if (confirm(`\u26a0\ufe0f \u00bfELIMINAR CURSO "${c.toUpperCase()}"? \n\nEsta acci\u00f3n es irreversible.`)) {
                    delete courses[c];
                    if (currentCourse === c) currentCourse = null;
                    saveData();
                    renderCourses();
                }
            };
            card.appendChild(delBtn);
        }

        cb.appendChild(card);
    });
}

function addCourseFromMenu() {
    const input = document.getElementById('new-course-name');
    const c = input.value.trim();
    if(!c) return;
    if(courses[c]) {
        alert("El curso ya existe.");
        return;
    }
    courses[c] = [];
    saveData();
    renderCourses();
    input.value = '';
}

function initDash() {
    updateMassXPText();
    switchView('dash');
    renderList();
}

function renderList() {
    if(!currentCourse) return;
    
    // Configura Textos de Header según el estado
    const titleEl = document.getElementById('course-title');
    if (titleEl) titleEl.textContent = currentCourse;
    // btn-toggle-role ya no existe en la nueva navbar; no hacer nada con él

    const list = courses[currentCourse];
    
    // Mostrar/ocultar barra de selección
    const selectionBar = document.getElementById('selection-bar');
    if(selectionBar) {
        if(role === 'teacher' && selectedStudents.size > 0) {
            selectionBar.classList.remove('hidden');
            document.getElementById('selection-count').innerText = `${selectedStudents.size} ${selectedStudents.size === 1 ? 'estudiante seleccionado' : 'estudiantes seleccionados'}`;
        } else {
            selectionBar.classList.add('hidden');
        }
    }
    
    // ¡La magia de la clasificación!
    // Primero guardamos los puestos oficiales según el XP global
    list.sort((a, b) => b.xp - a.xp);
    list.forEach((s, i) => s.rankPos = i + 1); // Guardamos su puesto # real

    // Ahora ordenamos según lo seleccionado por el usuario
    if (sortMode === 'alpha') {
        list.sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
    } else {
        list.sort((a, b) => b.xp - a.xp);
    }
    
    const container = document.getElementById('list-container');
    container.className = `grid ${viewMode === 'list' ? 'list-mode' : ''}`;
    container.innerHTML = ''; // Limpiar grilla

    if(list.length === 0) {
        container.innerHTML = '<p style="text-align:center; grid-column:1/-1; padding:20px; color:var(--subText);">No hay estudiantes. ¡Cambia al Modo Profesor y añade la lista del curso!</p>';
        return;
    }
    
    // Filtrar lista según la búsqueda pero preservar el ranking real
    const filteredList = list
        .map((s, idx) => ({ s: prepareStudent(s), originalIdx: idx }))
        .filter(item => item.s.name.toLowerCase().includes(searchTerm));

    if(filteredList.length === 0) {
        container.innerHTML = '<p style="text-align:center; grid-column:1/-1; padding:20px; color:var(--subText); font-size: 1.2rem; font-weight:800;">No se encontró ningún estudiante llamado "' + searchTerm + '"</p>';
        return;
    }
    
    // Generar Filas
    filteredList.forEach((item) => {
        const s = item.s;
        const idx = item.originalIdx;
        const { level, xpInLevel, xpForNextLevel, pct } = getLevelInfo(s.xp);
        
        let rankClass = "rank";
        if (s.rankPos === 1) rankClass += " rank-1";
        else if (s.rankPos === 2) rankClass += " rank-2";
        else if (s.rankPos === 3) rankClass += " rank-3";

        // Clases dinámicas por si es aliado o seleccionado
        const isSelected = selectedStudents.has(s.id);
        const finalRowClass = `${s.aliado ? 'es-aliado' : ''} ${isSelected ? 'selected' : ''}`.trim();
        const gradeClass = level <= 8 ? `level-${level}` : 'level-max';

        const gradeColors = { 1:'#94A3B8', 2:'#2DD4BF', 3:'#60A5FA', 4:'#A78BFA', 5:'#F472B6', 6:'#FBBF24', 7:'#FB923C', 8:'#EF4444'};
        const stripColor = level <= 8 ? gradeColors[level] : '#EF4444';
        const hex = stripColor.replace('#','');
        const r = parseInt(hex.substring(0,2), 16), g = parseInt(hex.substring(2,4), 16), b = parseInt(hex.substring(4,6), 16);
        const bgAlpha = document.body.classList.contains('dark-mode') ? 0.12 : 0.05;
        const tintBg = `rgba(${r},${g},${b},${bgAlpha})`;
        const dynamicStyles = `background: ${tintBg} !important; border-color: ${stripColor} !important;`;

        if (viewMode === 'list') {
            container.innerHTML += `
                <div class="row ${finalRowClass}" id="s-${s.id}" style="${dynamicStyles} cursor:${role==='teacher'?'pointer':'default'};" onclick="if(role==='teacher') toggleSelection(${s.id})">
                    <span class="${rankClass}">#${s.rankPos}</span>
                    <span class="name name-link ${s.aliado ? 'es-aliado' : ''}" onclick="event.stopPropagation(); showProfile(${s.id})">
                        ${s.aliado ? '⭐ ' : ''}${s.name}
                    </span>
                    <div class="gold-badge" style="background:#FEF3C7; border:2px solid var(--gold); border-radius:10px; color:#D97706; font-weight:900; display:flex; gap:5px; align-items:center;">
                        🪙 ${s.gold}
                    </div>
                    <span class="level ${gradeClass}">Nivel ${level}</span>
                    <div class="progress-col">
                        <div class="bar-bg"><div class="bar-fill" style="width: ${pct}%"></div></div>
                        <div class="xp-val">${xpInLevel}/${xpForNextLevel}</div>
                    </div>
                    <div class="actions teacher-only">
                        <button class="btn-sm b10" style="width:44px; height:44px;" onclick="event.stopPropagation(); addXP(${s.id}, ${pointValues[0]})">+${pointValues[0]}</button>
                        <button class="btn-sm b20" style="width:44px; height:44px;" onclick="event.stopPropagation(); addXP(${s.id}, ${pointValues[1]})">+${pointValues[1]}</button>
                        <button class="btn-sm b50" style="width:44px; height:44px;" onclick="event.stopPropagation(); addXP(${s.id}, ${pointValues[2]})">+${pointValues[2]}</button>
                        <button class="btn-sm bshop" style="width:40px; height:40px; padding:0;" onclick="event.stopPropagation(); showShop(${s.id})">${svgShop}</button>
                    </div>
                </div>`;
        } else {
            container.innerHTML += `
                <div class="row ${finalRowClass}" id="s-${s.id}" style="${dynamicStyles} cursor:${role==='teacher'?'pointer':'default'};" onclick="if(role==='teacher') toggleSelection(${s.id})">
                    <!-- Fila 1: Rango, Nombre y Oro -->
                    <div style="display:flex; align-items:center; justify-content:space-between; width:100%; gap:10px;">
                        <div style="display:flex; align-items:center; gap:8px; flex:1; overflow:hidden;">
                            <span class="${rankClass}">#${s.rankPos}</span>
                            <span class="name name-link ${s.aliado ? 'es-aliado' : ''}" onclick="event.stopPropagation(); showProfile(${s.id})">
                                ${s.aliado ? '⭐ ' : ''}${s.name}
                            </span>
                        </div>
                        <div class="gold-badge" style="background:#FEF3C7; border:2px solid var(--gold); color:#D97706; font-weight:900;">🪙 ${s.gold}</div>
                    </div>
                    
                    <!-- Fila 2: Nivel y Barra de Experiencia -->
                    <div style="display:flex; align-items:center; width:100%; gap:12px; margin: 2px 0;">
                        <span class="level ${gradeClass}" style="flex-shrink:0;">Nivel ${level}</span>
                        <div class="progress-col">
                            <div class="bar-bg"><div class="bar-fill" style="width: ${pct}%"></div></div>
                            <div class="xp-val">${xpInLevel}/${xpForNextLevel}</div>
                        </div>
                    </div>

                    <!-- Fila 3: Botones de Acción -->
                    <div class="actions teacher-only">
                        <button class="btn-sm b10" onclick="event.stopPropagation(); addXP(${s.id}, ${pointValues[0]})">+${pointValues[0]}</button>
                        <button class="btn-sm b20" onclick="event.stopPropagation(); addXP(${s.id}, ${pointValues[1]})">+${pointValues[1]}</button>
                        <button class="btn-sm b50" onclick="event.stopPropagation(); addXP(${s.id}, ${pointValues[2]})">+${pointValues[2]}</button>
                        <button class="btn-sm bshop" style="padding:0;" onclick="event.stopPropagation(); showShop(${s.id})">${svgShop}</button>
                    </div>
                </div>`;
        }
    });
}

// --- Lógica Gamificada ---

function toggleSelection(id) {
    if(role !== 'teacher') return;
    if(selectedStudents.has(id)) {
        selectedStudents.delete(id);
    } else {
        selectedStudents.add(id);
    }
    renderList();
}

function addXPToSelected(amount) {
    if(amount <= 0 || selectedStudents.size === 0) return;
    let studentsAssigned = [];
    let leveledUpStudents = [];
    
    selectedStudents.forEach(id => {
        const s = courses[currentCourse].find(x => x.id === id);
        if(s) {
            prepareStudent(s);
            const oldLevelInfo = getLevelInfo(s.xp);
            s.xp += Math.floor(amount);
            s.sessionXP += Math.floor(amount);
            
            s.history.unshift({ desc: `+${amount} XP masivo`, date: new Date().toLocaleDateString() });
            if(s.history.length > 30) s.history.pop();
            
            const newLevelInfo = getLevelInfo(s.xp);
            
            studentsAssigned.push(id);
            if(newLevelInfo.level > oldLevelInfo.level) {
                leveledUpStudents.push({name: s.name, level: newLevelInfo.level});
            }
        }
    });
    selectedStudents.clear();
    saveData();
    renderList();
    
    // Animar las filas después del renderizado completo
    studentsAssigned.forEach(id => {
        setTimeout(() => triggerRowAnimation(id), 50);
    });
    
    // Si hubo subidas de nivel masivas
    if(leveledUpStudents.length > 0) {
        setTimeout(() => {
            if(leveledUpStudents.length === 1) {
                showLevelUp(leveledUpStudents[0].name, leveledUpStudents[0].level);
            } else {
                showLevelUp(`${leveledUpStudents.length} Estudiantes`, leveledUpStudents[0].level, true);
            }
        }, 600); // Dar tiempo a que vean la asignación de puntos primero
    }
}

function clearSelection() {
    selectedStudents.clear();
    renderList();
}

function triggerRowAnimation(id) {
    const row = document.getElementById('s-'+id);
    const s = courses[currentCourse].find(x => x.id === id);
    if(row && s) {
        // Simple brillo verde para simular que ganaron algo
        row.style.transition = 'all 0.4s';
        row.style.transform = 'scale(1.02)';
        row.style.borderColor = '#4ADE80';
        row.style.background = '#F0FDF4';
        setTimeout(() => {
            row.style.transform = '';
            row.style.borderColor = s.aliado ? '#FACC15' : '';
            row.style.background = s.aliado ? '#FEF9C3' : '';
        }, 1200);
    }
}

function addXP(id, amount, customHistoryMsg = null) {
    if(amount === 0) return; 
    const s = courses[currentCourse].find(x => x.id === id);
    if(!s) return;

    prepareStudent(s);
    const oldLevelInfo = getLevelInfo(s.xp);
    
    s.xp += Math.floor(amount);
    if(s.xp < 0) s.xp = 0; // No bajar de cero XP global
    
    s.gold += Math.floor(amount);
    if(s.gold < 0) s.gold = 0; // No bajar de cero oro
    
    s.sessionXP += Math.floor(amount);

    if(customHistoryMsg) {
        s.history.unshift({ desc: customHistoryMsg, date: new Date().toLocaleDateString() });
    } else {
        const sign = amount > 0 ? '+' : '';
        s.history.unshift({ desc: `${sign}${amount} XP/Oro`, date: new Date().toLocaleDateString() });
    }
    if(s.history.length > 30) s.history.pop();
    
    const newLevelInfo = getLevelInfo(s.xp);
    const oldLevel = oldLevelInfo.level;
    const newLevel = newLevelInfo.level;
    
    saveData();
    
    // Renderizamos toda la lista instantáneamente. 
    // Como ordenamos por xp, el estudiante que gané xp podría "escala posiciones" en pantalla al instante!
    renderList();
    
    // Anima visualmente a la fila que acaba de ser recompesantada
    const row = document.getElementById('s-'+id);
    if(row){
        // Efecto pulso general
        row.style.transition = 'all 0.4s';
        
        if(newLevel > oldLevel) {
            // Estallido dorado de subida de nivel
            row.style.transform = 'scale(1.04)';
            row.style.borderColor = '#FACC15';
            row.style.background = '#FEF9C3';
            row.style.boxShadow = '0 0 20px rgba(250, 204, 21, 0.6)';
            
            // Mostrar modal de subida de nivel
            setTimeout(() => {
                 showLevelUp(s.name, newLevel);
            }, 500); // mostrar modal animado un momento después de asigar xp
        } else {
            // Brillo verde pequeño
            row.style.transform = 'scale(1.02)';
            row.style.borderColor = '#4ADE80';
            row.style.background = '#F0FDF4';
        }

        setTimeout(() => {
            row.style.transform = '';
            row.style.borderColor = s.aliado ? '#FACC15' : '';
            row.style.background = s.aliado ? '#FEF9C3' : '';
            row.style.boxShadow = '';
        }, 1200);
    }
}

function showLevelUp(name, level, isMultiple = false) {
    const modal = document.getElementById('modal-levelup');
    document.getElementById('levelup-name').innerText = name;
    
    const levelSpan = document.getElementById('levelup-level-name');
    levelSpan.className = `level ${level <= 8 ? 'level-'+level : 'level-max'}`;
    levelSpan.innerText = `NIVEL ${level}`;

    if(isMultiple) {
         document.getElementById('levelup-title').innerText = '¡SUBIERON DE NIVEL! 🎉';
         document.getElementById('levelup-info').innerHTML = `Han alcanzado el <span id="levelup-level-name" class="level ${level <= 8 ? 'level-'+level : 'level-max'}" style="font-size: 1.5rem; border-radius: 12px; padding: 8px 16px;">NIVEL ${level}</span>`;
    } else {
         document.getElementById('levelup-title').innerText = '¡NUEVO NIVEL! 🚀';
         document.getElementById('levelup-info').innerHTML = `Ha alcanzado el <span id="levelup-level-name" class="level ${level <= 8 ? 'level-'+level : 'level-max'}" style="font-size: 1.5rem; border-radius: 12px; padding: 8px 16px;">NIVEL ${level}</span>`;
    }
    
    modal.classList.remove('hidden');
    // Para que los confetis o animaciones pesadas no rompan, la animación CSS ya lo escala visualmente atractivo.
}

function hideLevelUp() {
    document.getElementById('modal-levelup').classList.add('hidden');
}

function toggleAliado(id) {
    const s = courses[currentCourse].find(x => x.id === id);
    if(s) {
        s.aliado = !s.aliado;
        const action = s.aliado ? 'Convertido en Aliado' : 'Removido como Aliado';
        s.history.unshift({ desc: `${action}`, date: new Date().toLocaleDateString() });
        if(s.history.length > 30) s.history.pop();
        saveData();
        renderList();
    }
}

function showProfile(id) {
    currentProfileId = id;
    const s = prepareStudent(courses[currentCourse].find(x => x.id === id));
    document.getElementById('prof-name').innerText = s.name;
    const { level, pct, xpInLevel, xpForNextLevel } = getLevelInfo(s.xp);
    
    document.getElementById('prof-level').className = `level ${level <= 8 ? 'level-'+level : 'level-max'}`;
    document.getElementById('prof-level').innerText = `NIVEL ${level}`;
    document.getElementById('prof-xp').innerText = `${s.xp} XP (Progreso Global)`;
    document.getElementById('prof-gold').innerText = `🪙 ${s.gold} Oro (Para Gastar)`;
    document.getElementById('prof-bar').style.width = `${pct}%`;
    document.getElementById('prof-bar-text').innerText = `${xpInLevel}/${xpForNextLevel}`;
    document.getElementById('prof-badges').innerHTML = s.badges.map(b => `<span class="badge-icon" title="${b}">${b.split(' ')[0]} ${b.split(' ')[1] || ''}</span>`).join('') || '<span style="color:var(--subText); font-size:0.9rem;">Sin insignias preparadas. ¡Demuestra tu valor!</span>';
    document.getElementById('prof-history').innerHTML = s.history.map(h => `<li><span>${h.desc}</span> <span style="color:var(--subText); font-size:0.8rem; font-weight:bold;">${h.date}</span></li>`).join('') || '<li style="color:var(--subText); justify-content:center;">Sin movimientos recientes.</li>';
    
    const allBadges = ['💡 Participación', '🤝 Compañerismo', '🚀 Esfuerzo', '🎨 Creatividad'];
    document.getElementById('prof-badge-buttons').innerHTML = allBadges.map(b => {
        const isAwarded = s.sessionBadges && s.sessionBadges.includes(b);
        const style = isAwarded ? 'background: var(--topBarBorder); border-color: var(--subText); color: var(--subText); opacity: 0.7; transform: none;' : '';
        return `<button class="badge-btn" style="${style}" onclick="awardBadge('${b}')">${b}</button>`;
    }).join('');
    
    showModal('modal-profile');
}

function awardBadge(name) {
    if(role !== 'teacher' || !currentProfileId) return;
    const s = prepareStudent(courses[currentCourse].find(x => x.id === currentProfileId));
    
    if(s.sessionBadges.includes(name)) {
        // Desapretar / Quitar
        s.sessionBadges = s.sessionBadges.filter(b => b !== name);
        const bIdx = s.badges.lastIndexOf(name);
        if(bIdx !== -1) s.badges.splice(bIdx, 1);
        addXP(s.id, -20, `Insignia revocada: ${name} (-20 XP y Oro)`);
    } else {
        // Apretar / Otorgar
        s.sessionBadges.push(name);
        s.badges.push(name);
        addXP(s.id, 20, `¡Insignia ganada!: ${name} (+20 XP y Oro)`);
    }
    showProfile(currentProfileId);
}

function showShop(studentId = null) {
    currentShopStudentId = studentId;
    let s = null;
    if(studentId !== null) {
        s = prepareStudent(courses[currentCourse].find(x => x.id === studentId));
    }
    
    document.getElementById('shop-subtitle').innerHTML = s ? `Comprando para: <strong style="color:var(--text); font-size:1.1rem;">${s.name}</strong>` : 'Catálogo General de Precios';
    
    let invHtml = '';
    if(s) {
        invHtml = `
        <div style="margin-bottom:30px; background: var(--bg); padding: 15px; border-radius: 16px; border: 2px solid var(--btnShadow);">
            <h3 style="color:var(--purplePrimary); margin:-5px 0 12px 0; font-size:1.1rem; display:flex; align-items:center; gap:8px;">📦 Mochila / Inventario <span style="background:var(--purplePrimary); color:white; padding:2px 8px; border-radius:8px; font-size:0.8rem;">${s.inventory.filter(i => i.status === 'unused').length}</span></h3>
            <div id="inventory-list" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap:10px;">
                ${s.inventory.length === 0 ? '<p style="color:var(--subText); font-size:0.9rem; margin:0;">Tu mochila está vacía. ¡Ahorra oro para comprar recompensas!</p>' : ''}
                ${s.inventory
                  .slice() // clonar para no mutar el original
                  .sort((a, b) => {
                      if (a.status === 'unused' && b.status !== 'unused') return -1;
                      if (a.status !== 'unused' && b.status === 'unused') return  1;
                      if (a.status === 'used' && b.status === 'used') return b.id - a.id; // Recién canjeados primero entre los usados
                      return a.id - b.id; // Los más antiguos sin usar primero
                  })
                  .map(inv => `
                    <div style="background:var(--cardBg); border:2px solid ${inv.status === 'unused' ? 'var(--yellowPrimary)' : 'var(--btnShadow)'}; border-radius:12px; padding:8px 12px; display:flex; align-items:center; gap:8px; opacity: ${inv.status === 'unused' ? 1 : 0.6};">
                        <span style="font-size:1.5rem;">${inv.icon}</span>
                        <div style="flex:1; min-width:0;">
                            <div style="font-weight:900; font-size:0.85rem; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${inv.name}</div>
                            <div style="font-size:0.7rem; color:var(--subText);">${inv.status === 'unused' ? 'Sin usar' : 'Canjeado'}</div>
                        </div>
                        ${inv.status === 'unused' && role === 'teacher' ? `<button class="btn-sm" style="background:var(--yellowPrimary); color:#78350F; font-size:0.7rem; padding:4px 8px; border-bottom-width:2px !important;" onclick="useItem(${s.id}, ${inv.id})">USAR</button>` : ''}
                    </div>
                `).join('')}
            </div>
            <div style="margin-top:15px; font-weight:900; font-size:1.1rem; text-align:right; color:#D97706;">Balance: 🪙 ${s.gold} Oro</div>
        </div>
        <h3 style="color:var(--purplePrimary); margin-bottom:15px; font-size:1.15rem; border-left: 4px solid var(--yellowPrimary); padding-left: 10px;">🛒 Tienda de Artículos</h3>
        `;
    }

    const content = document.getElementById('shop-content');
    content.innerHTML = invHtml + `
        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap:15px;">
            ${shopItems.map((item, i) => {
                const canAfford = s && s.gold >= item.cost;
                return `
                <div class="shop-item" style="background:var(--rowBg); border:2px solid var(--btnShadow); border-radius:15px; padding:15px; display:flex; flex-direction:column; align-items:center; text-align:center; transition:0.2s; ${!canAfford && s ? 'opacity:0.6; filter:grayscale(0.8);' : ''}">
                    <div style="font-size:3.5rem; margin-bottom:10px; height:70px; display:flex; align-items:center; justify-content:center;">${item.icon}</div>
                    <div style="font-weight:900; margin-bottom:4px; font-size:1rem; color:var(--text); line-height:1.1;">${item.name}</div>
                    <div style="color:#D97706; font-weight:900; font-size:1rem; margin-bottom:12px;">🪙 ${item.cost}</div>
                    ${role === 'teacher' && s ? 
                        `<button class="btn-sm bshop" style="width:100%; border-radius:10px !important; ${!canAfford ? 'background: #94A3B8 !important; color:#FFF !important; cursor:not-allowed;' : ''}" onclick="buyItem(${i})" ${!canAfford?'disabled':''}>${canAfford ? '🛍️ Comprar' : 'Falta Oro'}</button>` 
                        : (s ? `<span style="font-size:0.75rem; color:var(--subText); font-weight:bold; margin-top:auto; text-align:center;">Solo el Profesor puede canjear</span>` : `<span style="font-size:0.75rem; color:var(--purplePrimary); font-weight:900; margin-top:auto; text-align:center;">Catálogo de Premios</span>`)
                    }
                </div>
                `;
            }).join('')}
        </div>
    `;
    showModal('modal-shop');
}

function showGuide() {
    const container = document.getElementById('guide-content');
    container.innerHTML = rewardSources.map(s => `
        <div style="background:var(--cardBg); border:3px solid var(--purplePrimary); border-radius:20px; padding:20px; display:flex; flex-direction:column; align-items:center; text-align:center; transition:0.3s; box-shadow:0 6px 15px rgba(0,0,0,0.05);">
            <div style="font-size:3.5rem; margin-bottom:10px;">${s.icon}</div>
            <div style="font-weight:900; font-size:1.2rem; color:var(--text); margin-bottom:5px; line-height:1.2;">${s.title}</div>
            <div style="font-size:0.9rem; color:var(--subText); margin-bottom:15px; flex:1;">${s.desc}</div>
            <div style="background:var(--purplePrimary); color:white; padding:6px 15px; border-radius:50px; font-weight:900; font-size:1.1rem; border:none; box-shadow:0 4px 0 #6D28D9;">+${s.points} XP</div>
        </div>
    `).join('');
    showModal('modal-guide');
}


function useItem(studentId, itemId) {
    const s = courses[currentCourse].find(x => x.id === studentId);
    if(!s) return;
    const item = s.inventory.find(i => i.id === itemId);
    if(item && item.status === 'unused') {
        if(confirm(`¿Confirmar que ${s.name} usa su recompensa "${item.name}" ahora?`)) {
            item.status = 'used';
            s.history.unshift({ desc: `¡Usó recompensa!: ${item.icon} ${item.name}`, date: new Date().toLocaleDateString() });
            saveData();
            renderList();
            showShop(studentId);
        }
    }
}

function toggleCinemaMode() {
    document.body.classList.toggle('cinema-mode');
    const isCinema = document.body.classList.contains('cinema-mode');
    if(isCinema) {
        if(!document.getElementById('btn-exit-cinema')) {
            const btn = document.createElement('button');
            btn.id = 'btn-exit-cinema';
            btn.innerHTML = '✖ Salir de Modo Cinema';
            btn.style.cssText = 'position:fixed; top:20px; right:20px; z-index:10001; background:rgba(255,255,255,0.2); color:white; border:2px solid white; padding:10px 20px; border-radius:30px; cursor:pointer; font-weight:900; backdrop-filter:blur(10px);';
            btn.onclick = toggleCinemaMode;
            document.body.appendChild(btn);
        }
    } else {
        const btn = document.getElementById('btn-exit-cinema');
        if(btn) btn.remove();
    }
}

function buyItem(idx) {
    if(role !== 'teacher' || currentShopStudentId === null) return;
    const item = shopItems[idx];
    const s = prepareStudent(courses[currentCourse].find(x => x.id === currentShopStudentId));
    
    if(s.gold >= item.cost) {
        if(confirm(`¿Estás seguro que ${s.name} va a intercambiar 🪙 ${item.cost} piezas de oro por "${item.name}"?`)) {
            s.gold -= item.cost;
            s.inventory.push({ id: Date.now() + Math.random(), name: item.name, icon: item.icon, status: 'unused', date: new Date().toLocaleDateString() });
            s.history.unshift({ desc: `Compró recompensa: ${item.icon} ${item.name} (-${item.cost} Oro)`, date: new Date().toLocaleDateString() });
            
            saveData();
            renderList();
            showShop(currentShopStudentId); // Refresca tienda (botón y monedas actualizadas)
        }
    }
}

function shootConfetti() {
    const duration = 2500;
    const end = Date.now() + duration;
    
    const container = document.createElement('div');
    container.style.position = 'fixed'; container.style.top = '0'; container.style.left = '0'; container.style.width = '100vw'; container.style.height = '100vh';
    container.style.pointerEvents = 'none'; container.style.zIndex = '99999'; container.style.overflow = 'hidden';
    document.body.appendChild(container);

    const colors = ['#EF4444', '#3B82F6', '#F59E0B', '#10B981', '#8B5CF6', '#F472B6'];

    let interval = setInterval(() => {
        if(Date.now() > end) { clearInterval(interval); setTimeout(() => container.remove(), 2500); return; }
        for(let i=0; i<4; i++) {
            const el = document.createElement('div');
            el.style.position = 'absolute'; el.style.left = Math.random() * 100 + 'vw'; el.style.top = '-20px';
            el.style.width = Math.random() * 10 + 6 + 'px'; el.style.height = Math.random() * 20 + 10 + 'px';
            el.style.background = colors[Math.floor(Math.random() * colors.length)];
            el.style.opacity = Math.random() + 0.5; el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            
            const destX = (Math.random() - 0.5) * 400 + 'px';
            const destY = window.innerHeight + 50 + 'px';
            const durationAnim = Math.random() * 1500 + 1500;
            
            el.animate([
                { transform: `translate(0, 0) rotate(0deg)` },
                { transform: `translate(${destX}, ${destY}) rotate(${Math.random() * 1080}deg)` }
            ], { duration: durationAnim, easing: 'ease-in', fill: 'forwards' });
            container.appendChild(el);
            setTimeout(() => el.remove(), durationAnim);
        }
    }, 40);
}

function showPodium() {
    if(!currentCourse) return;
    const list = courses[currentCourse].map(s => prepareStudent(s));
    
    let highlightedStudents = new Set();
    let categories = [];
    
    // 1. Top points today (Racha del Día)
    const sessionSorted = [...list].sort((a, b) => b.sessionXP - a.sessionXP);
    const topToday = sessionSorted.find(s => s.sessionXP > 0 && !highlightedStudents.has(s.id));
    if(topToday) {
        highlightedStudents.add(topToday.id);
        categories.push({
            title: "🔥 Racha del Día", subtitle: "Mayor Subida de XP hoy",
            student: topToday, stat: `+${topToday.sessionXP} XP`, color: "#EF4444", icon: "🔥"
        });
    }
    
    // 2. Top Global Points (Líder Supremo)
    const globalSorted = [...list].sort((a, b) => b.xp - a.xp);
    const topGlobal = globalSorted.find(s => s.xp > 0 && !highlightedStudents.has(s.id));
    if(topGlobal) {
        highlightedStudents.add(topGlobal.id);
        categories.push({
            title: "👑 Líder Supremo", subtitle: "Mayor Puntaje Global",
            student: topGlobal, stat: `${topGlobal.xp} XP`, color: "#F59E0B", icon: "👑"
        });
    }
    
    // 3. Aliados
    const aliados = list.filter(s => s.aliado && !highlightedStudents.has(s.id));
    aliados.forEach(aliado => {
        highlightedStudents.add(aliado.id);
        categories.push({
            title: "⭐ Aliado Valioso", subtitle: "Solidaridad y Apoyo",
            student: aliado, stat: "Compañerismo", color: "#3B82F6", icon: "⭐"
        });
    });
    
    // 4. Badges (Insignias)
    const badgeEarners = list.filter(s => s.sessionBadges && s.sessionBadges.length > 0 && !highlightedStudents.has(s.id));
    badgeEarners.sort((a, b) => b.sessionBadges.length - a.sessionBadges.length);
    badgeEarners.forEach(earner => {
        highlightedStudents.add(earner.id);
        categories.push({
            title: "🏅 Coleccionista", subtitle: "Nuevas Insignias Obtenidas",
            student: earner, stat: earner.sessionBadges.slice(0,2).join(', ') + (earner.sessionBadges.length > 2 ? '...' : ''), color: "#8B5CF6", icon: "🏅"
        });
    });
    
    const container = document.getElementById('podium-container');
    if(categories.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:var(--subText); font-size:1.1rem; padding: 20px;">Aún no hay acciones destacables hoy. ¡La clase apenas comienza!</p>';
    } else {
        shootConfetti(); // Animación super llamativa
        container.innerHTML = '<div class="podium-showcase">' + categories.map((cat, i) => `
            <div class="podium-card animate-podium" style="animation-delay: ${i * 0.15}s; --theme-color: ${cat.color};">
                <div class="podium-card-icon">${cat.icon}</div>
                <div class="podium-card-content">
                    <div class="podium-cat">${cat.title}</div>
                    <div class="podium-sub">${cat.subtitle}</div>
                    <div class="podium-name">${cat.student.name}</div>
                    <div class="podium-stat">${cat.stat}</div>
                </div>
            </div>
        `).join('') + '</div>';
    }
    showModal('modal-podium');
}

function resetClassSession() {
    if(confirm('¿Seguro que quieres reiniciar la clase de hoy? Esto pondrá en cero la sesión para el podio de destacados y rehabilitará las insignias diarias, pero conservará intacto el XP total global de los alumnos.')) {
        courses[currentCourse].forEach(s => { 
            let pS = prepareStudent(s);
            pS.sessionXP = 0; 
            pS.sessionBadges = [];
        });
        saveData();
        hideModal('modal-podium');
    }
}

// --- Manejo del Modal ---
function showModal(id) { document.getElementById(id).classList.remove('hidden'); }
function hideModal(id) { document.getElementById(id).classList.add('hidden'); }
function saveStudents() {
    const val = document.getElementById('ta-students').value;
    
    // Separadores tolerados: Saltos de línea, o comillas
    const parts = val.split(/[\n,]/).map(x => x.trim()).filter(x => x);
    if(!parts.length) { hideModal('modal-add'); return; }
    
    const list = courses[currentCourse];
    let maxId = list.length > 0 ? Math.max(...list.map(s => s.id)) : 0;
    
    parts.forEach(name => {
        list.push({ id: ++maxId, name: name, xp: 0, aliado: false });
    });
    
    hideModal('modal-add');
    document.getElementById('ta-students').value = '';
    
    saveData();
    // Retornamos al curso actualizado
    renderList();
}


function updateMassXPText() {
    if(document.getElementById('txt-pt1-mass')) document.getElementById('txt-pt1-mass').innerText = pointValues[0];
    if(document.getElementById('txt-pt2-mass')) document.getElementById('txt-pt2-mass').innerText = pointValues[1];
    if(document.getElementById('txt-pt3-mass')) document.getElementById('txt-pt3-mass').innerText = pointValues[2];
}


const themes = [
    { name: 'Azul Brillo', hex: '#40AAFE', text: '#FFFFFF' },
    { name: 'Naranja Fuerte', hex: '#FFB32F', text: '#FFFFFF' },
    { name: 'Morado Mágico', hex: '#A663F6', text: '#FFFFFF' },
    { name: 'Verde Manzana', hex: '#10B981', text: '#FFFFFF' },
    { name: 'Coral Cálido', hex: '#FF6B6B', text: '#FFFFFF' },
    { name: 'Cielo Diurno', hex: '#0EA5E9', text: '#FFFFFF' }
];
let currentThemeIdx = 0;

function cycleTheme() {
    currentThemeIdx = (currentThemeIdx + 1) % themes.length;
    document.documentElement.style.setProperty('--theme-color', themes[currentThemeIdx].hex);
    document.documentElement.style.setProperty('--theme-text', themes[currentThemeIdx].text);
    localStorage.setItem('gamificacion_theme_v4', JSON.stringify({ hex: themes[currentThemeIdx].hex, text: themes[currentThemeIdx].text }));
}

// Check for saved theme
window.addEventListener('load', () => {
    let savedTheme = localStorage.getItem('gamificacion_theme_v4');
    let tObj = { hex: '#40AAFE', text: '#FFFFFF' };
    if(savedTheme) {
        try { tObj = JSON.parse(savedTheme); } catch(e){}
    } else {
        localStorage.setItem('gamificacion_theme_v4', JSON.stringify(tObj));
    }
    document.documentElement.style.setProperty('--theme-color', tObj.hex);
    document.documentElement.style.setProperty('--theme-text', tObj.text);
    const idx = themes.findIndex(t => t.hex === tObj.hex);
    if(idx !== -1) currentThemeIdx = idx;
});


// --- Configuración ---
function openConfig() {
    switchView('config');
    cfgRenderCourses();
    cfgRenderPoints();
    cfgRenderShop();
    cfgRenderGuide();
    
    // Init icon picker
    document.getElementById('icon-picker-grid').innerHTML = libIcons.map((ic, i) => `<div style="cursor:pointer; padding:5px; border-radius:12px; display:inline-block; transition:0.2s;" onclick="cfgSelectIcon('${ic}')" onmouseover="this.style.background='var(--topBarBorder)'; this.style.transform='scale(1.2)';" onmouseout="this.style.background='transparent'; this.style.transform='none';">${ic}</div>`).join('');
}

function switchConfigToDash() {
    initDash();
}

function cfgRenderCourses() {
    const list = document.getElementById('cfg-course-list');
    list.innerHTML = Object.keys(courses).map(c => `
        <li style="display:flex; justify-content:space-between; padding:12px 15px; border-bottom:1px solid var(--topBarBorder); align-items:center;">
            <span style="font-weight:900; font-size:1.1rem; color:var(--text);">${c} <small style="color:var(--subText); font-size:0.9rem; font-weight:800; opacity:0.8;">(${courses[c].length} est.)</small></span>
            <button class="btn-sm" style="background:#EF4444; color:white; padding:6px 12px;" onclick="cfgDelCourse('${c}')">Borrar</button>
        </li>
    `).join('');
    
    const sel = document.getElementById('cfg-course-sel');
    const oldVal = sel.value;
    sel.innerHTML = '<option value="">-- Elige un Curso --</option>' + Object.keys(courses).map(c => `<option value="${c}">${c}</option>`).join('');
    if(courses[oldVal]) {
        sel.value = oldVal;
    } else if(currentCourse) {
        sel.value = currentCourse;
    }
    cfgRenderStudents();
}

function cfgAddCourse() {
    const c = document.getElementById('cfg-new-course').value.trim();
    if(c && !courses[c]) { courses[c] = []; saveData(); cfgRenderCourses(); document.getElementById('cfg-new-course').value = ''; }
}
function cfgDelCourse(c) {
    if(confirm(`⚠️ ¿ELIMINAR CURSO "${c.toUpperCase()}"? \n\nEsta acción es irreversible y se borrarán TODOS los estudiantes, registros de XP, medallas e historial de este curso. ¿Deseas continuar?`)) { 
        delete courses[c]; 
        if(currentCourse === c) currentCourse = null; 
        saveData(); 
        cfgRenderCourses(); 
    }
}

function cfgRenderPoints() {
    document.getElementById('cfg-pt-1').value = pointValues[0];
    document.getElementById('cfg-pt-2').value = pointValues[1];
    document.getElementById('cfg-pt-3').value = pointValues[2];
    updateMassXPText();
}
function cfgSavePoints() {
    pointValues[0] = parseInt(document.getElementById('cfg-pt-1').value)||5;
    pointValues[1] = parseInt(document.getElementById('cfg-pt-2').value)||10;
    pointValues[2] = parseInt(document.getElementById('cfg-pt-3').value)||30;
    localStorage.setItem('gamificacion_points', JSON.stringify(pointValues));
    updateMassXPText();
}

function cfgRenderStudents() {
    const c = document.getElementById('cfg-course-sel').value;
    const container = document.getElementById('cfg-student-list');
    if(!c) { container.innerHTML = '<p style="color:var(--subText); padding:10px;">Selecciona o añade un curso para gestionar a los estudiantes.</p>'; return; }
    
    if(courses[c].length === 0) {
        container.innerHTML = '<p style="color:var(--subText); padding:10px;">Lista vacía. Añade a los alumnos pegando la lista desde Excel u otra fuente.</p>';
    } else {
        container.innerHTML = courses[c].map((s, i) => `
            <div style="display:flex; gap:10px; background:var(--cardBg); padding:8px 12px; border-radius:12px; border:2px solid var(--btnShadow); align-items:center;">
                <span style="font-size:0.8rem; font-weight:900; color:var(--subText); min-width:20px;">#${i+1}</span>
                <input type="text" value="${s.name}" style="flex:1; min-width:0; border:none; background:transparent; font-weight:900; color:var(--text); font-size:1rem; outline:none;" onchange="cfgRenameStudent('${c}', ${s.id}, this.value)">
                <button class="btn-sm" style="background:#EF4444; color:white; flex-shrink:0; width:36px; height:36px; padding:0; display:flex; align-items:center; justify-content:center;" onclick="cfgDelStudent('${c}', ${s.id})" title="Eliminar Alumno">✖</button>
            </div>
        `).join('');
    }
}

function cfgRenameStudent(c, id, newName) {
    if(newName.trim()) {
        const s = courses[c].find(x => x.id === id);
        if(s) s.name = newName.trim();
        saveData();
    }
}
function cfgDelStudent(c, id) {
    if(confirm('¿Eliminar estudiante?')) {
        courses[c] = courses[c].filter(x => x.id !== id);
        saveData(); cfgRenderStudents(); cfgRenderCourses();
    }
}
function cfgAddStudentsLot() {
    const c = document.getElementById('cfg-course-sel').value;
    if(!c) return alert("Selecciona un curso primero desde el menú anterior.");
    const val = document.getElementById('cfg-new-students').value;
    const parts = val.split(/[\n,]/).map(x => x.trim()).filter(x => x);
    if(parts.length) {
        let maxId = courses[c].length > 0 ? Math.max(...courses[c].map(s => s.id)) : 0;
        parts.forEach(name => courses[c].push({ id: ++maxId, name: name, xp: 0, aliado: false }));
        saveData(); cfgRenderStudents(); cfgRenderCourses();
        document.getElementById('cfg-new-students').value = '';
    }
}

function cfgRenderShop() {
    document.getElementById('cfg-shop-list').innerHTML = shopItems.map((item, i) => `
        <div style="display:flex; gap:10px; align-items:center; background:var(--cardBg); padding:16px; border-radius:12px; border:2px solid var(--btnShadow); flex-wrap:wrap; box-shadow:0 4px 10px rgba(0,0,0,0.05);">
            <button style="font-size:2.5rem; padding:0; height:70px; width:70px; display:flex; align-items:center; justify-content:center; background:var(--cardBg); border:2px solid var(--btnShadow); border-radius:15px; flex: 0 0 auto; cursor:pointer;" onclick="cfgOpenIconPicker(${i})" title="Cambiar Icono">${item.icon}</button>
            <div style="flex:2; display:flex; flex-direction:column; gap:5px; min-width:140px;">
                <label style="font-size:0.75rem; font-weight:bold; color:var(--subText); margin-bottom:-4px;">Nombre Recompensa</label>
                <input type="text" value="${item.name}" placeholder="Nombre" style="width:100%; padding:8px 10px; box-sizing:border-box; border-radius:8px; border:2px solid var(--btnShadow); font-weight:bold;" onchange="cfgUpdateShop(${i}, 'name', this.value)">
            </div>
            <div style="flex:1; display:flex; flex-direction:column; gap:5px; min-width:80px;">
                <label style="font-size:0.75rem; font-weight:bold; color:var(--subText); margin-bottom:-4px;">Oro Coste</label>
                <input type="number" value="${item.cost}" placeholder="Oro" style="width:100%; padding:8px 10px; box-sizing:border-box; border-radius:8px; border:2px solid var(--btnShadow); font-weight:bold; color:#F59E0B;" onchange="cfgUpdateShop(${i}, 'cost', this.value)">
            </div>
            <button class="btn-sm" style="background:#EF4444; color:white; padding:10px; flex: 0 0 auto; align-self: center;" onclick="cfgDelShop(${i})" title="Eliminar Recompensa">✖</button>
        </div>
    `).join('');
}
function cfgAddShopItem() {
    shopItems.push({ name: 'Nueva Recompensa', cost: 100, icon: '🌟' });
    cfgSaveShop(); cfgRenderShop();
}
function cfgDelShop(i) {
    if(confirm("¿Eliminar recompensa de la tienda?")) {
        shopItems.splice(i, 1); cfgSaveShop(); cfgRenderShop();
    }
}
function cfgUpdateShop(i, field, val) {
    shopItems[i][field] = field === 'cost' ? (parseInt(val)||0) : val;
    cfgSaveShop();
}
function cfgSaveShop() { localStorage.setItem('gamificacion_shop', JSON.stringify(shopItems)); }

function cfgOpenIconPicker(idx) {
    cfgShopEditingIndex = idx;
    showModal('modal-icon-picker');
}
function cfgSelectIcon(ic) {
    if(cfgShopEditingIndex !== null) {
        shopItems[cfgShopEditingIndex].icon = ic;
        cfgSaveShop(); cfgRenderShop();
        hideModal('modal-icon-picker');
    } else if(cfgGuideEditingIndex !== null) {
        rewardSources[cfgGuideEditingIndex].icon = ic;
        cfgSaveGuide(); cfgRenderGuide();
        hideModal('modal-icon-picker');
    }
}

// --- Gestión del Manual de Puntos (Guía) ---
function cfgRenderGuide() {
    const list = document.getElementById('cfg-guide-list');
    list.innerHTML = rewardSources.map((s, i) => `
        <div style="background:var(--cardBg); padding:20px; border-radius:15px; border:2px solid var(--btnShadow); display:flex; flex-direction:column; gap:12px; box-shadow:0 4px 10px rgba(0,0,0,0.05);">
            <div style="display:flex; gap:10px; align-items:center;">
                <button style="font-size:2.5rem; width:65px; height:65px; display:flex; align-items:center; justify-content:center; background:var(--cardBg); border:2px solid var(--btnShadow); border-radius:15px; cursor:pointer;" onclick="cfgOpenGuideIconPicker(${i})" title="Cambiar Icono">${s.icon}</button>
                <div style="flex:1;">
                    <label style="font-size:0.75rem; font-weight:bold; color:var(--subText);">Título Regla</label>
                    <input type="text" value="${s.title}" style="width:100%; padding:8px; border-radius:8px; border:2px solid var(--btnShadow); font-weight:bold;" onchange="cfgUpdateGuide(${i}, 'title', this.value)">
                </div>
            </div>
            <div>
                <label style="font-size:0.75rem; font-weight:bold; color:var(--subText);">Descripción</label>
                <textarea style="width:100%; height:60px; padding:8px; border-radius:8px; border:2px solid var(--btnShadow); font-size:0.9rem; font-family:inherit;" onchange="cfgUpdateGuide(${i}, 'desc', this.value)">${s.desc}</textarea>
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
                <div style="flex:1;">
                    <label style="font-size:0.75rem; font-weight:bold; color:var(--subText);">Puntos (+XP)</label>
                    <input type="number" value="${s.points}" style="width:100%; padding:8px; border-radius:8px; border:2px solid var(--btnShadow); font-weight:bold; color:var(--purplePrimary);" onchange="cfgUpdateGuide(${i}, 'points', this.value)">
                </div>
                <button class="btn-sm" style="background:#EF4444; color:white; height:40px; margin-top:18px;" onclick="cfgDelGuide(${i})">✖ Eliminar</button>
            </div>
        </div>
    `).join('');
}
function cfgAddGuideItem() {
    rewardSources.push({ title: 'Nueva Regla', desc: 'Explica cómo ganar esta XP...', points: 10, icon: '🚀' });
    cfgSaveGuide(); cfgRenderGuide();
}
function cfgDelGuide(i) {
    if(confirm("¿Eliminar esta regla del manual?")) {
        rewardSources.splice(i, 1); cfgSaveGuide(); cfgRenderGuide();
    }
}
function cfgUpdateGuide(i, field, val) {
    rewardSources[i][field] = field === 'points' ? (parseInt(val)||0) : val;
    cfgSaveGuide();
}
function cfgSaveGuide() { localStorage.setItem('gamificacion_guide', JSON.stringify(rewardSources)); }
function cfgOpenGuideIconPicker(idx) {
    cfgGuideEditingIndex = idx;
    cfgShopEditingIndex = null;
    showModal('modal-icon-picker');
}

// --- Exportar / Importar Datos ---
function exportData() {
    const data = {
        courses: courses,
        shop: shopItems,
        guide: rewardSources,
        points: pointValues,
        version: '2.0-backup'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aventura-matematica-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function importData(event) {
    const file = event.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if(confirm("⚠️ ¿Estás seguro de que quieres CARGAR esta copia? Se borrarán todos los datos actuales y se reemplazarán por los del archivo.")) {
                if(data.courses) localStorage.setItem('gamificacion_cursos', JSON.stringify(data.courses));
                if(data.shop) localStorage.setItem('gamificacion_shop', JSON.stringify(data.shop));
                if(data.guide) localStorage.setItem('gamificacion_guide', JSON.stringify(data.guide));
                if(data.points) localStorage.setItem('gamificacion_points', JSON.stringify(data.points));
                alert("¡Datos cargados con éxito! La página se recargará.");
                location.reload();
            }
        } catch(err) {
            alert("Error al leer el archivo. Asegúrate de que sea una copia válida.");
        }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
}

// --- Sincronización Multi-Pestaña (Pizarra y Laptop) ---
// Esto permite que las ventanas "Modo Estudiante" escuchen los cambios
// hechos desde la ventana "Modo Profesor" en otro monitor y lancen las animaciones.
window.addEventListener('storage', (e) => {
    if(e.key === 'gamificacion_cursos' && e.newValue) {
        const oldCourses = courses;
        try { courses = JSON.parse(e.newValue); } catch(err){ return; }
        
        if(currentCourse && courses[currentCourse] && oldCourses[currentCourse]) {
            const currentList = courses[currentCourse];
            const oldList = oldCourses[currentCourse];
            
            let leveledUpStudents = [];
            currentList.forEach(s => {
                const oldStudent = oldList.find(x => x.id === s.id);
                if(oldStudent && s.xp > oldStudent.xp) {
                    const oldLevel = getLevelInfo(oldStudent.xp).level;
                    const newLevel = getLevelInfo(s.xp).level;
                    if(newLevel > oldLevel) {
                        leveledUpStudents.push({name: s.name, level: newLevel});
                    }
                    setTimeout(() => triggerRowAnimation(s.id), 50);
                }
            });
            
            renderList();
            
            if(leveledUpStudents.length > 0) {
                setTimeout(() => {
                    if(leveledUpStudents.length === 1) {
                        showLevelUp(leveledUpStudents[0].name, leveledUpStudents[0].level);
                    } else {
                        showLevelUp(`${leveledUpStudents.length} Estudiantes`, leveledUpStudents[0].level, true);
                    }
                }, 300);
            }
        } else {
            renderList();
        }
    }
});
