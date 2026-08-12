let items = [
  { description: 'Beauty Face Wash 100ml', qty: 2, price: 450 }
];

const itemsContainer = document.getElementById('items-container');
const addItemBtn = document.getElementById('add-item');
const saveDraftBtn = document.getElementById('save-draft');
const resetFormBtn = document.getElementById('reset-form');
const invoicePreview = document.getElementById('invoice-preview');

const enableTaxCheckbox = document.getElementById('enable-tax');
const taxRateInput = document.getElementById('tax-rate');

const businessNameInput = document.getElementById('business-name');
const invoiceNumberInput = document.getElementById('invoice-number');
const issueDateInput = document.getElementById('issue-date');
const dueDateInput = document.getElementById('due-date');
const clientNameInput = document.getElementById('client-name');
const clientEmailInput = document.getElementById('client-email');
const clientAddressInput = document.getElementById('client-address');

window.addEventListener('DOMContentLoaded', () => {
  renderItems();
  updateCalculationsAndPreview();
  renderInvoiceHistory();
  attachInputListeners();
});

function attachInputListeners() {
  const inputs = [businessNameInput, invoiceNumberInput, issueDateInput, dueDateInput, clientNameInput, clientEmailInput, clientAddressInput, enableTaxCheckbox, taxRateInput];
  inputs.forEach(input => {
    if (input) input.addEventListener('input', updateCalculationsAndPreview);
  });
}

function renderItems() {
  if (!itemsContainer) return;
  itemsContainer.innerHTML = '';

  items.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
      <input type="text" placeholder="Description" value="${item.description}" oninput="updateItem(${index}, 'description', this.value)" />
      <input type="number" placeholder="Qty" min="1" value="${item.qty}" oninput="updateItem(${index}, 'qty', this.value)" />
      <input type="number" placeholder="Price" min="0" value="${item.price}" oninput="updateItem(${index}, 'price', this.value)" />
      <button class="remove-item" onclick="removeItem(${index})">&times;</button>
    `;
    itemsContainer.appendChild(row);
  });
}

function updateItem(index, key, value) {
  if (key === 'qty' || key === 'price') {
    items[index][key] = parseFloat(value) || 0;
  } else {
    items[index][key] = value;
  }
  updateCalculationsAndPreview();
}

if (addItemBtn) {
  addItemBtn.addEventListener('click', () => {
    items.push({ description: '', qty: 1, price: 0 });
    renderItems();
    updateCalculationsAndPreview();
  });
}

function removeItem(index) {
  if (items.length > 1) {
    items.splice(index, 1);
  } else {
    items = [{ description: '', qty: 1, price: 0 }];
  }
  renderItems();
  updateCalculationsAndPreview();
}

function updateCalculationsAndPreview() {
  let subtotal = 0;
  items.forEach(item => {
    subtotal += (item.qty || 0) * (item.price || 0);
  });

  const isTaxEnabled = enableTaxCheckbox ? enableTaxCheckbox.checked : false;
  const taxRate = taxRateInput ? (parseFloat(taxRateInput.value) || 0) : 0;
  const tax = isTaxEnabled ? (subtotal * (taxRate / 100)) : 0;
  const total = subtotal + tax;

  // Form Totals Update
  document.getElementById('subtotal-value').innerText = `Rs. ${subtotal.toFixed(2)}`;
  
  const taxRow = document.getElementById('tax-row');
  const taxLabel = document.getElementById('tax-label');
  if (isTaxEnabled) {
    taxRow.style.display = 'flex';
    if (taxLabel) taxLabel.innerText = `Tax (${taxRate}%)`;
    document.getElementById('tax-value').innerText = `Rs. ${tax.toFixed(2)}`;
  } else {
    taxRow.style.display = 'none';
  }
  
  document.getElementById('total-value').innerText = `Rs. ${total.toFixed(2)}`;

  // Invoice Output View Generation
  if (invoicePreview) {
    let itemsTableRows = items.map(item => `
      <tr>
        <td>${item.description || '—'}</td>
        <td class="text-center">${item.qty}</td>
        <td class="text-right">Rs. ${parseFloat(item.price || 0).toFixed(2)}</td>
        <td class="text-right">Rs. ${(item.qty * item.price).toFixed(2)}</td>
      </tr>
    `).join('');

    invoicePreview.innerHTML = `
      <div class="preview-top">
        <div class="preview-brand">
          <h2>${businessNameInput.value || 'Your Business'}</h2>
          <p>Supplier</p>
        </div>
        <div class="preview-inv-meta">
          <h3>INVOICE</h3>
          <div class="inv-no">${invoiceNumberInput.value || 'INV-1001'}</div>
          <div><strong>Date:</strong> ${issueDateInput.value || 'N/A'}</div>
          <div><strong>Due Date:</strong> ${dueDateInput.value || 'N/A'}</div>
        </div>
      </div>

      <div class="preview-info-grid">
        <div>
          <strong style="color:#4b5563;">Billed To:</strong><br>
          <strong style="font-size:1rem; color:#111827;">${clientNameInput.value || 'Client Name'}</strong><br>
          ${clientEmailInput.value || ''}<br>
          ${clientAddressInput.value ? clientAddressInput.value.replace(/\n/g, '<br>') : ''}
        </div>
      </div>

      <table class="preview-table">
        <thead>
          <tr>
            <th>Description</th>
            <th class="text-center">Qty</th>
            <th class="text-right">Price</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsTableRows}
        </tbody>
      </table>

      <div class="preview-summary">
        <div>Subtotal: <strong>Rs. ${subtotal.toFixed(2)}</strong></div>
        ${isTaxEnabled ? `<div>Tax (${taxRate}%): <strong>Rs. ${tax.toFixed(2)}</strong></div>` : ''}
        <div class="grand-price">Total: Rs. ${total.toFixed(2)}</div>
      </div>
    `;
  }
}

// Save Invoice to History with dynamic Tax Rate
if (saveDraftBtn) {
  saveDraftBtn.addEventListener('click', () => {
    let subtotal = 0;
    items.forEach(item => { subtotal += (item.qty || 0) * (item.price || 0); });
    const isTaxEnabled = enableTaxCheckbox.checked;
    const taxRate = parseFloat(taxRateInput.value) || 0;
    const tax = isTaxEnabled ? (subtotal * (taxRate / 100)) : 0;
    const grandTotal = subtotal + tax;

    const invoiceData = {
      businessName: businessNameInput.value,
      id: invoiceNumberInput.value || 'INV-1001',
      issueDate: issueDateInput.value,
      dueDate: dueDateInput.value,
      clientName: clientNameInput.value,
      clientEmail: clientEmailInput.value,
      clientAddress: clientAddressInput.value,
      items: JSON.parse(JSON.stringify(items)),
      isTaxEnabled: isTaxEnabled,
      taxRate: taxRate,
      totalAmount: `Rs. ${grandTotal.toFixed(2)}`
    };

    let history = JSON.parse(localStorage.getItem('invoiceHistory')) || [];
    const existingIndex = history.findIndex(inv => inv.id === invoiceData.id);
    if (existingIndex > -1) {
      history[existingIndex] = invoiceData;
    } else {
      history.push(invoiceData);
    }

    localStorage.setItem('invoiceHistory', JSON.stringify(history));
    renderInvoiceHistory();
    alert(`Invoice ${invoiceData.id} successfully saved!`);
  });
}

function renderInvoiceHistory() {
  const history = JSON.parse(localStorage.getItem('invoiceHistory')) || [];
  const tableBody = document.getElementById('history-table-body');
  if (!tableBody) return;

  tableBody.innerHTML = '';
  if (history.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#6b7280; padding:1rem;">No saved invoices.</td></tr>';
    return;
  }

  history.forEach((inv, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${inv.id}</strong></td>
      <td>${inv.clientName || 'N/A'}</td>
      <td>${inv.issueDate || '-'}</td>
      <td>${inv.totalAmount || 'Rs. 0.00'}</td>
      <td>
        <div class="history-actions">
          <button class="ghost-btn btn-sm" onclick="viewInvoice(${index})">View</button>
          <button class="danger-btn btn-sm" onclick="deleteInvoice(${index})">Delete</button>
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

function viewInvoice(index) {
  const history = JSON.parse(localStorage.getItem('invoiceHistory')) || [];
  const inv = history[index];

  if (inv) {
    businessNameInput.value = inv.businessName || '';
    invoiceNumberInput.value = inv.id || '';
    issueDateInput.value = inv.issueDate || '';
    dueDateInput.value = inv.dueDate || '';
    clientNameInput.value = inv.clientName || '';
    clientEmailInput.value = inv.clientEmail || '';
    clientAddressInput.value = inv.clientAddress || '';
    
    if (enableTaxCheckbox) enableTaxCheckbox.checked = inv.isTaxEnabled ?? true;
    if (taxRateInput) taxRateInput.value = inv.taxRate ?? 5;

    items = inv.items && inv.items.length > 0 ? JSON.parse(JSON.stringify(inv.items)) : [{ description: '', qty: 1, price: 0 }];

    renderItems();
    updateCalculationsAndPreview();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function deleteInvoice(index) {
  if (confirm("Are you sure you want to delete this invoice?")) {
    let history = JSON.parse(localStorage.getItem('invoiceHistory')) || [];
    history.splice(index, 1);
    localStorage.setItem('invoiceHistory', JSON.stringify(history));
    renderInvoiceHistory();
  }
}

if (resetFormBtn) {
  resetFormBtn.addEventListener('click', () => {
    businessNameInput.value = 'Mustafa Studio';
    invoiceNumberInput.value = 'INV-1001';
    issueDateInput.value = '';
    dueDateInput.value = '';
    clientNameInput.value = '';
    clientEmailInput.value = '';
    clientAddressInput.value = '';
    if (enableTaxCheckbox) enableTaxCheckbox.checked = true;
    if (taxRateInput) taxRateInput.value = 5;
    items = [{ description: '', qty: 1, price: 0 }];
    renderItems();
    updateCalculationsAndPreview();
  });
}