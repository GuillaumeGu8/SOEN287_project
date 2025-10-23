const scheduleDiv= document.getElementById("schedule");
const rooms = ["Room China", "Room Lebanon", "Room Singapore", "Room Morocco", "Room Vietnam",
     "Room Egypt", "Room Brazil", "Room Canada"];
const hours = Array.from({ length: 15 }, (_, i) => i + 8); // 8 am to 10pm

let selectedSlot = null;
let bookings= JSON.parse(localStorage.getItem("bookings") || "{}");

const datePicker = document.getElementById("datePicker");
datePicker.valueAsDate= new Date();
const equipmentSearch = document.getElementById('equipmentSearch');
const categorySelect = document.getElementById('categorySelect');
const mainWrap = document.getElementById('mainWrap');

function equipmentCategory(name){
    if(/room/i.test(name)) return 'Room';
    return 'Other';
}

function renderSchedule() {
    const date= datePicker.value;
    const q = (equipmentSearch && equipmentSearch.value || '').trim().toLowerCase();
    const cat = (categorySelect && categorySelect.value) || 'all';
    const filtered = rooms.filter(e => {
        if(cat && cat !== 'all' && equipmentCategory(e) !== cat) return false;
        if(q && !e.toLowerCase().includes(q)) return false;
        return true;
    });

    const isNarrow = window.innerWidth <= 720;
    if(isNarrow){
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

    scheduleDiv.style.gridTemplateColumns = `100px repeat(${filtered.length}, 1fr)`;
    let html = `<div></div>` + filtered.map(e => `<div class="resource-header">${e}</div>`).join('');
    hours.forEach((hour) => {
        html += `<div class="time-slot time-col sticky">${hour}:00</div>`;
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
    if(mainWrap) mainWrap.style.display = 'none';
    document.getElementById("bookingForm").style.display= "flex";
});

document.getElementById("saveBooking").onclick = () => {
    const name = document.getElementById("name").value.trim();
    const purpose = document.getElementById("purpose").value.trim();
    if(!name || !purpose) return alert("Please fill all fields.");
    bookings[selectedSlot] = {name, purpose};
    localStorage.setItem("bookings", JSON.stringify(bookings));
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