const scheduleDiv= document.getElementById("schedule");
const equipments = ["Whiteboard + Markers(#1)", "Whiteboard + Markers(#2)", "Whiteboard + Markers(#3)",
    "Audio system + microphone(#1)", "Audio system + microphone(#2)", "Projector(#1)", "Projector(#2)",
    "Laptop(#1)", "Laptop(#2)", "Laptop(#3)", "Microscope(#1)", "Microscope(#2)", "Electrical Toolkit(#1)",
    "Electrical Toolkit(#2)", "3D Printer", "Chemistry/Biology Lab Kit (#1)", "Chemistry/Biology Lab Kit (#2)"];
const hours = Array.from({ length: 15 }, (_, i) => i + 8); // 8 am to 10pm

let selectedSlot = null;
let bookings= JSON.parse(localStorage.getItem("bookings") || "{}");

const datePicker = document.getElementById("datePicker");
datePicker.valueAsDate = new Date();
const equipmentSearch = document.getElementById('equipmentSearch');
const categorySelect = document.getElementById('categorySelect');
const mainWrap = document.getElementById('mainWrap');

// derive category from equipment name by matching keywords
function equipmentCategory(name){
    if(/whiteboard/i.test(name)) return 'Whiteboard';
    if(/audio|microphone/i.test(name)) return 'Audio';
    if(/projector/i.test(name)) return 'Projector';
    if(/laptop/i.test(name)) return 'Laptop';
    if(/microscope/i.test(name)) return 'Microscope';
    if(/toolkit/i.test(name)) return 'Toolkit';
    if(/3d printer/i.test(name)) return '3D';
    if(/lab kit/i.test(name)) return 'Lab Kit';
    return 'Other';
}

function renderSchedule() {
    const date= datePicker.value;
    // compute filtered list
    const q = (equipmentSearch && equipmentSearch.value || '').trim().toLowerCase();
    const cat = (categorySelect && categorySelect.value) || 'all';
    const filtered = equipments.filter(e => {
        if(cat && cat !== 'all' && equipmentCategory(e) !== cat) return false;
        if(q && !e.toLowerCase().includes(q)) return false;
        return true;
    });
    // responsive: stacked card layout on small screens
    const isNarrow = window.innerWidth <= 720;
    if(isNarrow){
        // render each equipment as a vertical card with time rows
        let html = '';
        filtered.forEach(equipment => {
            html += `<div class="equipment-card" style="background:var(--surface);padding:0.6rem;border-radius:10px;margin-bottom:0.8rem;box-shadow:0 4px 14px rgba(16,42,67,0.04);">`;
            html += `<div class="resource-header" style="position:static;margin-bottom:0.5rem;">${equipment}</div>`;
            hours.forEach(hour => {
                const slotId = `${date}-${equipment}-${hour}`;
                const booking = bookings[slotId];
                html += `<div class="time-slot ${booking ? 'booked' : 'available'}" data-slot="${slotId}" style="display:flex;justify-content:space-between;padding:0.5rem;margin:0.25rem 0;">`;
                html += `<div>${hour}:00</div><div>${booking ? booking.name : 'Available'}</div></div>`;
            });
            html += `</div>`;
        });
        scheduleDiv.innerHTML = html;
        return;
    }

    // desktop/tablet: grid layout (times as rows, equipments as columns)
    // set grid columns: first column for time labels, then one per equipment
    scheduleDiv.style.gridTemplateColumns = `100px repeat(${filtered.length}, 1fr)`;

    // build header row: empty corner + equipment headers
    let html = `<div></div>` + filtered.map(e => `<div class="resource-header">${e}</div>`).join('');

    // build one row per hour: time label then one cell per equipment
    hours.forEach((hour, rIdx) => {
        html += `<div class="time-slot time-col sticky">${hour}:00</div>`; // time label (sticky)
        filtered.forEach(equipment => {
            const slotId = `${date}-${equipment}-${hour}`;
            const booking = bookings[slotId];
            html += `
            <div class="time-slot ${booking ? 'booked' : 'available'}" data-slot="${slotId}">
              ${booking ? booking.name : 'Available'}
            </div>`;
        });
    });

    scheduleDiv.innerHTML = html;
}

// re-render when search or category changes
if(equipmentSearch) equipmentSearch.addEventListener('input', renderSchedule);
if(categorySelect) categorySelect.addEventListener('change', renderSchedule);


scheduleDiv.addEventListener("click", e => {
    const slot= e.target.dataset.slot;
    if(!slot) return;
    selectedSlot= slot;
    const booking= bookings[slot];
    document.getElementById("formTitle").textContent= booking ? "Edit Booking" : "New Booking";
    document.getElementById("name").value= booking ? booking.name : "";
    document.getElementById("purpose").value= booking ? booking.purpose : "";
    document.getElementById("deleteBooking").style.display= booking ? "inline-block" : "none";
    // hide the main schedule when the booking form is open
    if(mainWrap) mainWrap.style.display = 'none';
    document.getElementById("bookingForm").style.display= "flex";
});

document.getElementById("saveBooking").onclick = () => {
    const name = document.getElementById("name").value.trim();
    const purpose = document.getElementById("purpose").value.trim();
    if(!name || !purpose) return alert("Please fill all fields.");
    bookings[selectedSlot] = {name, purpose};
    localStorage.setItem("bookings", JSON.stringify(bookings));
    // show schedule again
    document.getElementById("bookingForm").style.display = "none";
    if(mainWrap) mainWrap.style.display = '';
    renderSchedule();
};


document.getElementById("deleteBooking").onclick = () => {
    delete bookings[selectedSlot];
    localStorage.setItem("bookings", JSON.stringify(bookings));
    document.getElementById("bookingForm").style.display = "none";
    if(mainWrap) mainWrap.style.display = '';
    renderSchedule();
};


document.getElementById("cancelBooking").onclick = () => {
    document.getElementById("bookingForm").style.display = "none";
    if(mainWrap) mainWrap.style.display = '';
};

datePicker.addEventListener("change", renderSchedule);

renderSchedule();