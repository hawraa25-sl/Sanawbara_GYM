// --- Global State ---
let currentUser = null;
let currentClass = null;

// --- DOM references (assigned after DOM ready) ---
let loadingOverlay;
let authControls;
let userControls;
let userIdDisplay;
let classesListingGrid;
let homeClassesGrid;
let trainersGrid;

// --- Mock Data (from your original code) ---
const MOCK_CLASSES = [
    { id: 'c1', title: 'Pilates Beginner',    trainer: 'Sara', date: 'Fri, 2025-01-10', time: '5 PM - 6 PM',   capacity: 20, price: 5,  type: 'Pilates' },
    { id: 'c2', title: 'Power Cardio Blast',  trainer: 'John', date: 'Sat, 2025-01-11', time: '10 AM - 11 AM', capacity: 15, price: 7,  type: 'Cardio' },
    { id: 'c3', title: 'Heavy Weightlifting', trainer: 'Mark', date: 'Sat, 2025-01-11', time: '1 PM - 2:30 PM', capacity: 10, price: 10, type: 'Weightlifting' },
];

const MOCK_TRAINERS = [
    { id: 't1', name: 'Sara Miller',  specialization: 'Pilates, Yoga',          experience: '5 Years',  photoUrl: 'https://placehold.co/100x100/4ade80/ffffff?text=SARA' },
    { id: 't2', name: 'John Smith',   specialization: 'Cardio, HIIT',           experience: '8 Years',  photoUrl: 'https://placehold.co/100x100/22c55e/ffffff?text=JOHN' },
    { id: 't3', name: 'Mark Johnson', specialization: 'Powerlifting, Nutrition', experience: '12 Years', photoUrl: 'https://placehold.co/100x100/16a34a/ffffff?text=MARK' },
];

// --- Utility Functions ---

function showLoading(show) {
    if (!loadingOverlay) return;
    if (show) {
        loadingOverlay.classList.remove('hidden');
    } else {
        loadingOverlay.classList.add('hidden');
    }
}

function displayFormMessage(viewId, message, type) {
    const msgElement = document.getElementById(${viewId}-message);
    if (!msgElement) return;

    msgElement.textContent = message;
    msgElement.classList.remove(
        'hidden',
        'bg-red-100',
        'text-red-800',
        'bg-green-100',
        'text-green-800'
    );

    if (type === 'error') {
        msgElement.classList.add('bg-red-100', 'text-red-800');
    } else {
        msgElement.classList.add('bg-green-100', 'text-green-800');
    }

    setTimeout(() => msgElement.classList.add('hidden'), 5000);
}

// SPA view switching
window.showView = function (viewName) {
    document.querySelectorAll('section[id^="view-"]').forEach(section => {
        section.classList.add('hidden');
    });

    const targetView = document.getElementById(view-${viewName});
    if (targetView) {
        targetView.classList.remove('hidden');
    } else {
        console.error(View not found: view-${viewName});
        const homeView = document.getElementById('view-home');
        if (homeView) homeView.classList.remove('hidden');
    }

    // Nav link active state
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('border-b-2', 'border-green-600', 'text-green-600');
        if (link.dataset.view === viewName) {
            link.classList.add('border-b-2', 'border-green-600', 'text-green-600');
        }
    });

    // Close mobile menu
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    if (mobileMenu && mobileMenuBtn) {
        mobileMenu.classList.add('-translate-y-full', 'opacity-0');
        mobileMenu.classList.remove('translate-y-0', 'opacity-100');
        mobileMenuBtn.innerHTML =
            '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>';
    }
};

// --- Rendering Functions ---

function renderClasses(classes) {
    if (!classesListingGrid) return;

    if (!classes || classes.length === 0) {
        classesListingGrid.innerHTML =
            '<p class="col-span-full text-center text-gray-500">No classes scheduled right now. Check back soon!</p>';
        return;
    }

    classesListingGrid.innerHTML = classes
        .map(cls => `
            <div class="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <div class="flex-grow">
                    <h3 class="text-xl font-bold text-gray-800">${cls.title}</h3>
                    <p class="text-sm text-gray-600">Trainer: <span class="font-medium">${cls.trainer}</span></p>
                    <p class="text-sm text-gray-600">Date/Time: <span class="font-medium">${cls.date} - ${cls.time}</span></p>
                    <p class="text-sm text-gray-600">Capacity: <span class="font-medium">${cls.capacity} spots</span></p>
                </div>
                <div class="flex-shrink-0 flex flex-col items-end space-y-2">
                    <span class="text-2xl font-extrabold text-green-600">$${cls.price}</span>
                    <button
                        onclick="openBookingModal('${cls.id}', '${cls.title}', '${cls.trainer}', '${cls.date}', '${cls.time}', ${cls.price})"
                        class="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition duration-300 font-semibold text-sm shadow-md">
                        Book Now
                    </button>
                </div>
            </div>
        `)
        .join('');
}

function renderHomeClasses(classes) {
    if (!homeClassesGrid) return;
    const homeClasses = (classes || []).slice(0, 3);

    homeClassesGrid.innerHTML = homeClasses
        .map(cls => `
            <div class="bg-white p-5 rounded-xl shadow-lg hover:shadow-xl transition duration-300 border-b-4 border-green-500">
                <h4 class="text-xl font-bold text-gray-800 mb-1">${cls.title}</h4>
                <p class="text-sm text-gray-600 mb-2">${cls.trainer} | ${cls.type}</p>
                <p class="text-sm text-gray-500">Time: ${cls.time} on ${cls.date}</p>
                <span class="text-lg font-extrabold text-green-600 block mt-2">$${cls.price}</span>
            </div>
        `)
        .join('');
}

function renderTrainers(trainers) {
    if (!trainersGrid) return;

    trainersGrid.innerHTML = (trainers || [])
        .map(t => `
            <div class="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4 border-l-4 border-gray-400 hover:border-green-500 transition duration-300">
                <img src="${t.photoUrl}" alt="${t.name}"
                     class="w-16 h-16 bg-gray-200 rounded-full flex-shrink-0 object-cover"
                     onerror="this.onerror=null; this.src='https://placehold.co/100x100/f5f5f5/333333?text=👤';">
                <div>
                    <h3 class="text-xl font-bold text-gray-800">${t.name}</h3>
                    <p class="text-green-600 font-medium">${t.specialization}</p>
                    <p class="text-sm text-gray-500">Experience: ${t.experience}</p>
                </div>
            </div>
        `)
        .join('');
}

function renderHomeTrainers(trainers) {
    const homeTrainersGrid = document.getElementById('home-trainers-grid');
    if (!homeTrainersGrid) return;

    const homeTrainers = (trainers || []).slice(0, 4);

    homeTrainersGrid.innerHTML = homeTrainers
        .map(t => `
            <div class="bg-white p-4 rounded-xl shadow-md text-center hover:shadow-lg transition duration-300">
                <img src="${t.photoUrl}" alt="${t.name}"
                     class="w-20 h-20 mx-auto rounded-full object-cover mb-3"
                     onerror="this.onerror=null; this.src='https://placehold.co/80x80/f5f5f5/333333?text=👤';">
                <h4 class="text-lg font-semibold">${t.name}</h4>
                <p class="text-green-600 text-sm">${t.specialization}</p>
            </div>
        `)
        .join('');
}

function renderMockData() {
    renderClasses(MOCK_CLASSES);
    renderHomeClasses(MOCK_CLASSES);
    renderTrainers(MOCK_TRAINERS);
    renderHomeTrainers(MOCK_TRAINERS);
}

// --- Auth (simple localStorage demo) ---

function updateAuthUI() {
    if (!authControls || !userControls || !userIdDisplay) return;

    if (currentUser) {
        authControls.classList.add('hidden');
        userControls.classList.remove('hidden');
        userIdDisplay.textContent = currentUser.fullName || currentUser.email || 'User';
    } else {
        authControls.classList.remove('hidden');
        userControls.classList.add('hidden');
        userIdDisplay.textContent = 'Guest';
    }
}

function loadUserFromStorage() {
    try {
        const raw = localStorage.getItem('sanawbaraUser');
        if (raw) {
            currentUser = JSON.parse(raw);
        }
    } catch (e) {
        console.error('Failed to parse user from storage', e);
        currentUser = null;
    }
    updateAuthUI();
}

function saveUserToStorage() {
    if (currentUser) {
        localStorage.setItem('sanawbaraUser', JSON.stringify(currentUser));
    } else {
        localStorage.removeItem('sanawbaraUser');
    }
}