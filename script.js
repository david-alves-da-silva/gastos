const STORAGE_KEY = 'financeData';

// Load data from localStorage on startup
function loadData() {
  const savedData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  console.log('Data loaded from localStorage:', savedData);

  savedData.forEach(({ type, description, amount }) => {
    createRow(type, description, amount);
  });

  setTimeout(() => {
    console.log('Calculating totals after loading data.');
    calculateTotals();
  }, 50);
}

// Save data to localStorage
function saveData() {
  const rows = Array.from(document.querySelectorAll('#financeTable tbody tr'));

  const data = rows.map((row) => {
    const type = row.cells[0].textContent === 'Income' ? 'income' : 'expense';
    const description = row.querySelector('input[type="text"]').value;
    const amount =
      parseFloat(row.querySelector('input[type="number"]').value) || 0;
    return { type, description, amount };
  });

  console.log('Saving data to localStorage:', data);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Calculate totals for income, expenses, and balance
function calculateTotals() {
  let totalIncome = 0;
  let totalExpenses = 0;

  document.querySelectorAll('input[type="number"]').forEach((input) => {
    const value = parseFloat(input.value) || 0;
    if (input.classList.contains('income')) {
      totalIncome += value;
    } else {
      totalExpenses += value;
    }
  });

  console.log('Total Income:', totalIncome);
  console.log('Total Expenses:', totalExpenses);

  document.getElementById('totalIncome').textContent = totalIncome.toFixed(2);
  document.getElementById('totalExpenses').textContent =
    totalExpenses.toFixed(2);
  document.getElementById('balance').textContent = (
    totalIncome - totalExpenses
  ).toFixed(2);
}

// Add a new row to the table
function addRow(type) {
  createRow(type);
  saveData();
}

// Create a new row with optional data
function createRow(type, description = '', amount = 0) {
  const tbody = document.querySelector('#financeTable tbody');
  const newRow = document.createElement('tr');

  newRow.innerHTML = `
    <td>${type === 'income' ? 'Income' : 'Expenses'}</td>
    <td><input type="text" value="${description}" placeholder="Description" /></td>
    <td><input type="number" class="${type}" value="${amount}" /></td>
    <td>
      <button onclick="editRow(this)">Edit</button>
      <button onclick="removeRow(this)">Remove</button>
    </td>
  `;

  const amountInput = newRow.querySelector('input[type="number"]');

  // Add input event to recalculate totals
  amountInput.addEventListener('input', () => {
    calculateTotals();
    saveData();
  });

  tbody.appendChild(newRow);
}

// Toggle between edit and view modes
function editRow(button) {
  const row = button.parentElement.parentElement;
  const inputs = row.querySelectorAll('input');

  inputs.forEach((input) => (input.disabled = !input.disabled));
  button.textContent = button.textContent === 'Edit' ? 'Save' : 'Edit';
  saveData();
}

// Remove a row and recalculate totals
function removeRow(button) {
  button.parentElement.parentElement.remove();
  calculateTotals();
  saveData();
}

// Load data on startup
loadData();

// Register the Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('service-worker.js')
      .then((registration) => {
        console.log(
          'Service Worker registered with scope:',
          registration.scope,
        );
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
  });
}

// Detect user's language
const userLanguage = navigator.language.slice(0, 2);

fetch('translations.json')
  .then((response) => response.json())
  .then((translations) => {
    const lang = translations[userLanguage] || translations['en'];

    // Apply translations to the DOM
    document.title = lang.title;
    document.querySelector('button.add-income').textContent = lang.add_income;
    document.querySelector('button.add-expense').textContent = lang.add_expense;
    document.querySelector('label.description').textContent = lang.description;
    document.querySelector('label.amount').textContent = lang.amount;

    // Set initial language for the selector
    document.getElementById('language-selector').value = userLanguage;
  })
  .catch((error) => console.error('Error loading translations:', error));

// Change language on selection
document
  .getElementById('language-selector')
  .addEventListener('change', (event) => {
    const selectedLanguage = event.target.value;

    fetch('translations.json')
      .then((response) => response.json())
      .then((translations) => {
        const lang = translations[selectedLanguage] || translations['en'];

        // Apply translations to the DOM
        document.title = lang.title;
        document.querySelector('button.add-income').textContent =
          lang.add_income;
        document.querySelector('button.add-expense').textContent =
          lang.add_expense;
        document.querySelector('label.description').textContent =
          lang.description;
        document.querySelector('label.amount').textContent = lang.amount;
      })
      .catch((error) => console.error('Error loading translations:', error));
  });