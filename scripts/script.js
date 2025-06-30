const calendarGrid = document.getElementById('calendarGrid');
const monthYearLabel = document.getElementById('monthYearLabel');
const currentDateText = document.getElementById('currentDateText');
const weekdaysContainer = document.getElementById('weekdaysContainer');

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const weekdayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

let today = new Date();
let viewDate = new Date();
let selectedDate = null;
let view = 'days'; // days, months, years
let timeMinutes = 30;
let isCollapsed = false;
let isScrolling = false;      // ← MỚI: Kiểm soát trạng thái scroll
let scrollTimeout = null;     // ← MỚI: Timeout cho animation

function updateCurrentDate() {
    const todayStr = dayNames[today.getDay()] + ', ' + 
                    monthNames[today.getMonth()].substring(0, 3) + ' ' + 
                    today.getDate();
    currentDateText.textContent = todayStr;
}

function createWeekdaysHeader() {
    weekdaysContainer.innerHTML = '';
    if (view === 'days') {
        const weekdaysDiv = document.createElement('div');
        weekdaysDiv.className = 'weekdays';
        weekdayNames.forEach(day => {
            const dayEl = document.createElement('div');
            dayEl.className = 'weekday';
            dayEl.textContent = day;
            weekdaysDiv.appendChild(dayEl);
        });
        weekdaysContainer.appendChild(weekdaysDiv);
    }
}

function render() {
    calendarGrid.innerHTML = '';
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    updateCurrentDate();
    createWeekdaysHeader();

    if (view === 'days') {
        calendarGrid.className = 'calendar-grid';
        monthYearLabel.textContent = `${monthNames[month]} ${year}`;
        
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const prevMonth = month === 0 ? 11 : month - 1;
        const prevYear = month === 0 ? year - 1 : year;
        const prevMonthDays = new Date(prevYear, prevMonth + 1, 0).getDate();
        const nextMonth = month === 11 ? 0 : month + 1;
        const nextYear = month === 11 ? year + 1 : year;

        // Previous month days
        for (let i = firstDay - 1; i >= 0; i--) {
            const cell = document.createElement('div');
            cell.className = 'day-cell other-month';
            cell.textContent = prevMonthDays - i;
            
            cell.onclick = () => {
                document.querySelectorAll('.day-cell').forEach(el => 
                    el.classList.remove('selected'));
                cell.classList.add('selected');
                selectedDate = new Date(prevYear, prevMonth, prevMonthDays - i);
            };
            
            calendarGrid.appendChild(cell);
        }

        // Current month days
        for (let d = 1; d <= daysInMonth; d++) {
            const cell = document.createElement('div');
            cell.className = 'day-cell';
            cell.textContent = d;

            const isToday = d === today.getDate() && 
                            month === today.getMonth() && 
                            year === today.getFullYear();
            if (isToday) cell.classList.add('today');

            cell.onclick = () => {
                document.querySelectorAll('.day-cell').forEach(el => 
                    el.classList.remove('selected'));
                if (!isToday) {
                    cell.classList.add('selected');
                }
                selectedDate = new Date(year, month, d);
            };
            calendarGrid.appendChild(cell);
        }

        // Next month days - always show 6 weeks (42 cells total)
        const totalCells = 42; // 6 weeks × 7 days
        const remainingCells = totalCells - (firstDay + daysInMonth);
        for (let d = 1; d <= remainingCells; d++) {
            const cell = document.createElement('div');
            cell.className = 'day-cell other-month';
            cell.textContent = d;
            
            cell.onclick = () => {
                document.querySelectorAll('.day-cell').forEach(el => 
                    el.classList.remove('selected'));
                cell.classList.add('selected');
                selectedDate = new Date(nextYear, nextMonth, d);
            };
            
            calendarGrid.appendChild(cell);
        }
    }
    else if (view === 'months') {
        calendarGrid.className = 'calendar-grid months';
        monthYearLabel.textContent = `${year}`;
        
        // Add extra months for the layout
        const allMonths = [...monthNamesShort, ...monthNamesShort.slice(0, 4)];
        
        for (let m = 0; m < 16; m++) {
            const cell = document.createElement('div');
            cell.className = 'month-cell';
            cell.textContent = allMonths[m];
            
            if (m < 12) {
                // Current year months
                const isCurrentMonth = m === today.getMonth() && year === today.getFullYear();
                if (isCurrentMonth) cell.classList.add('today');
                
                cell.onclick = () => {
                    viewDate.setMonth(m);
                    view = 'days';
                    render();
                };
            } else {
                // Next year months (m >= 12)
                const nextYearMonth = m - 12;
                cell.classList.add('next-year');
                cell.style.color = '#666';
                
                cell.onclick = () => {
                    viewDate.setFullYear(year + 1);
                    viewDate.setMonth(nextYearMonth);
                    view = 'days';
                    render();
                };
            }
            
            calendarGrid.appendChild(cell);
        }
    }
    else if (view === 'years') {
        calendarGrid.className = 'calendar-grid years';
        const base = Math.floor(year / 10) * 10;
        monthYearLabel.textContent = `${base} - ${base + 9}`;
        
        for (let y = base - 4; y <= base + 11; y++) {
            const cell = document.createElement('div');
            cell.className = 'year-cell';
            cell.textContent = y;
            
            if (y < base || y > base + 9) {
                cell.classList.add('inactive');
            }
            
            const isCurrentYear = y === today.getFullYear();
            if (isCurrentYear && y >= base && y <= base + 9) {
                cell.classList.add('today');
            }
            
            cell.onclick = () => {
                // Allow clicking on any year, not just the main range
                viewDate.setFullYear(y);
                view = 'months';
                render();
            };
            calendarGrid.appendChild(cell);
        }
    }
}

function changePeriod(offset) {
    if (view === 'days') {
        viewDate.setMonth(viewDate.getMonth() + offset);
    } else if (view === 'months') {
        viewDate.setFullYear(viewDate.getFullYear() + offset);
    } else if (view === 'years') {
        viewDate.setFullYear(viewDate.getFullYear() + offset * 10);
    }
    render();
}

function toggleView() {
    if (view === 'days') {
        view = 'months';
    } else if (view === 'months') {
        view = 'years';
    } else {
        view = 'days';
    }
    render();
}

function adjustTime(minutes) {
    timeMinutes += minutes;
    if (timeMinutes <= 0) timeMinutes = 30;
    if (timeMinutes > 240) timeMinutes = 240;
    
    const timeDisplay = document.querySelector('.time-display');
    timeDisplay.textContent = `${timeMinutes} mins`;
}

function toggleFocus() {
    // Placeholder function for Focus button
    console.log('Focus mode toggled');
}


function toggleCalendar(event) {
    event.stopPropagation(); // Prevent triggering goToToday()
    
    const calendarBody = document.querySelector('.calendar-body');
    const calendarContainer = document.querySelector('.calendar-container');
    const dropdownArrow = document.querySelector('.dropdown-arrow');
    
    isCollapsed = !isCollapsed;
    
    if (isCollapsed) {
        calendarBody.classList.add('collapsed');
        calendarContainer.classList.add('collapsed');
        dropdownArrow.classList.add('collapsed');
    } else {
        calendarBody.classList.remove('collapsed');
        calendarContainer.classList.remove('collapsed');
        dropdownArrow.classList.remove('collapsed');
    }
}

function goToToday() {
    // Reset về ngày hiện tại
    today = new Date();
    viewDate = new Date(today);
    view = 'days';
    
    // Clear selection
    selectedDate = null;
    
    // Re-render calendar
    render();
}

function handleWheel(event) {
    event.preventDefault();
    
    if (!isCollapsed && !isScrolling) {
        const delta = event.deltaY;
        const calendarGrid = document.getElementById('calendarGrid');
        
        // ← MỚI: Thêm smooth transition
        calendarGrid.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
        
        // ← MỚI: Animation slide + fade
        if (delta > 0) {
            calendarGrid.style.transform = 'translateY(-20px)';
            calendarGrid.style.opacity = '0.3';
        } else {
            calendarGrid.style.transform = 'translateY(20px)';
            calendarGrid.style.opacity = '0.3';
        }
        
        isScrolling = true;
        
        // ← MỚI: Timing control
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        
        // ← MỚI: Delayed period change với animation reset
        scrollTimeout = setTimeout(() => {
            if (delta > 0) {
                changePeriod(1);
            } else {
                changePeriod(-1);
            }
            
            setTimeout(() => {
                calendarGrid.style.transform = 'translateY(0)';
                calendarGrid.style.opacity = '1';
                
                setTimeout(() => {
                    calendarGrid.style.transition = '';
                    isScrolling = false;
                }, 300);
            }, 50);
            
        }, 150);
    }
}

// ← MỚI: Throttling wrapper
let wheelTimeout = null;
document.querySelector('.calendar-container').addEventListener('wheel', (event) => {
    if (wheelTimeout) return;
    
    handleWheel(event);
    
    wheelTimeout = setTimeout(() => {
        wheelTimeout = null;
    }, 400);
}, { passive: false });
// Initialize
render();