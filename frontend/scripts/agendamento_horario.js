let currentDate = new Date();
let selectedDate = null;
let selectedTime = null;

const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30'
];

document.addEventListener('DOMContentLoaded', function() {
  const prevMonthBtn = document.getElementById('prevMonth');
  const nextMonthBtn = document.getElementById('nextMonth');

  prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  });

  nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  });

  renderCalendar();
});

function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Atualizar título
  document.getElementById('monthYear').textContent = `${months[month]} ${year}`;

  // Obter primeiro dia do mês e número de dias
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDaysContainer = document.getElementById('calendarDays');
  calendarDaysContainer.innerHTML = '';

  // Dias do mês anterior
  for (let i = firstDay - 1; i >= 0; i--) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'day other-month';
    dayDiv.textContent = daysInPrevMonth - i;
    calendarDaysContainer.appendChild(dayDiv);
  }

  // Dias do mês atual
  const today = new Date();
  for (let day = 1; day <= daysInMonth; day++) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'day';
    dayDiv.textContent = day;

    const dateObj = new Date(year, month, day);
    
    // Desabilitar dias passados
    if (dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
      dayDiv.classList.add('disabled');
    } else {
      dayDiv.addEventListener('click', () => selectDate(day, month, year, dayDiv));
    }

    // Destacar dia selecionado
    if (selectedDate && 
        selectedDate.getDate() === day && 
        selectedDate.getMonth() === month && 
        selectedDate.getFullYear() === year) {
      dayDiv.classList.add('selected');
    }

    calendarDaysContainer.appendChild(dayDiv);
  }

  // Dias do próximo mês
  const totalCells = calendarDaysContainer.children.length;
  const remainingCells = 42 - totalCells; // 6 linhas × 7 colunas
  for (let day = 1; day <= remainingCells; day++) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'day other-month';
    dayDiv.textContent = day;
    calendarDaysContainer.appendChild(dayDiv);
  }
}

function selectDate(day, month, year, element) {
  // Remove seleção anterior
  document.querySelectorAll('.day.selected').forEach(el => el.classList.remove('selected'));
  
  // Adiciona seleção nova
  element.classList.add('selected');
  
  selectedDate = new Date(year, month, day);
  selectedTime = null; // Reset time selection

  // Mostrar seleção de horários
  showTimeSelection();
}

function showTimeSelection() {
  const timeSelectionSection = document.getElementById('timeSelectionSection');
  const selectedDateDisplay = document.getElementById('selectedDateDisplay');
  const timeSlotsContainer = document.getElementById('timeSlots');
  const confirmBtn = document.getElementById('confirmBtn');

  // Formatar data
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = selectedDate.toLocaleDateString('pt-BR', options);
  selectedDateDisplay.textContent = `Data selecionada: ${formattedDate}`;

  // Renderizar slots de horário
  timeSlotsContainer.innerHTML = '';
  timeSlots.forEach(time => {
    const timeSlot = document.createElement('button');
    timeSlot.className = 'time-slot';
    timeSlot.textContent = time;
    
    timeSlot.addEventListener('click', () => {
      // Remove seleção anterior
      document.querySelectorAll('.time-slot.selected').forEach(el => el.classList.remove('selected'));
      
      // Adiciona seleção nova
      timeSlot.classList.add('selected');
      selectedTime = time;
      confirmBtn.style.display = 'block';
    });

    timeSlotsContainer.appendChild(timeSlot);
  });

  timeSelectionSection.style.display = 'block';
  confirmBtn.style.display = 'none';
  
  // Scroll para a seção de horários
  timeSelectionSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function confirmBooking() {
  if (selectedDate && selectedTime) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = selectedDate.toLocaleDateString('pt-BR', options);
    
    alert(`Agendamento confirmado para ${formattedDate} às ${selectedTime}`);
    // Aqui você pode enviar os dados para o servidor
    // window.location.href = 'confirmacao.html';
  }
}
