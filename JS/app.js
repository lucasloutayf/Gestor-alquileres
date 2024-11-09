function addTenantCard(propertyId) {
    const tenantsDiv = document.getElementById(`tenants-${propertyId}`);
    
    const tenantCard = document.createElement('div');
    tenantCard.className = 'tenant-card';
    
    tenantCard.innerHTML = `
        <h3 class="tenant-name" onclick="toggleDetails(this)">Inquilina</h3>
        <div class="tenant-details">
            <label>Nombre: <input type="text" name="nombre" oninput="updateTenantName(this)"></label>
            <label>Apellido: <input type="text" name="apellido" oninput="updateTenantName(this)"></label>
            <label>DNI: <input type="text" name="dni"></label>
            <label>Teléfono: <input type="text" name="telefono"></label>
            <label>Teléfono de un conocido: <input type="text" name="telefono_conocido"></label>
            <label>Precio de la pieza: <input type="text" name="precio_pieza"></label>
            <label>Estado de pago: 
                <select name="estado_pago" onchange="updatePaymentStatus(this)">
                    <option value="al_dia">Al día</option>
                    <option value="debe">Debe</option>
                </select>
            </label>
            <label>Fecha del recibo: <input type="date" name="fecha_recibo"></label>
            <label>Fecha de vencimiento: <input type="date" name="fecha_vencimiento"></label>
            <button class="save-button" onclick="saveTenantData(this)">Guardar</button>
        </div>
    `;
    
    tenantsDiv.appendChild(tenantCard);
}

function toggleDetails(element) {
    const detailsDiv = element.nextElementSibling;
    
    // Muestra u oculta los detalles de la tarjeta
    detailsDiv.style.display = detailsDiv.style.display === 'none' ? 'block' : 'none';
    
    // Asegúrate de que el botón "Guardar" esté visible junto con los detalles
    if (detailsDiv.style.display === 'block') {
        const saveButton = detailsDiv.querySelector('.save-button');
        saveButton.style.display = 'block';  // Mostrar el botón al desplegar
    }
}

function updateTenantName(inputElement) {
    const tenantCard = inputElement.closest('.tenant-card');
    const tenantName = tenantCard.querySelector('.tenant-name');
    
    const nombre = tenantCard.querySelector('input[name="nombre"]').value;
    const apellido = tenantCard.querySelector('input[name="apellido"]').value;

    // Actualizamos el título con el nombre y apellido
    tenantName.textContent = `${nombre} ${apellido}` || "Inquilina";
    
    // Aseguramos que el nombre cambie de color si tiene deuda
    const estadoPago = tenantCard.querySelector('select[name="estado_pago"]').value;
    if (estadoPago === 'debe') {
        tenantName.classList.add('deudora');
    } else {
        tenantName.classList.remove('deudora');
    }
}

function updatePaymentStatus(selectElement) {
    const tenantCard = selectElement.closest('.tenant-card');
    const tenantName = tenantCard.querySelector('.tenant-name');
    
    // Cambia el color del nombre según el estado de pago
    if (selectElement.value === 'debe') {
        tenantName.classList.add('deudora');
    } else {
        tenantName.classList.remove('deudora');
    }
}

function saveTenantData(buttonElement) {
    const tenantCard = buttonElement.closest('.tenant-card');
    
    const nombre = tenantCard.querySelector('input[name="nombre"]').value;
    const apellido = tenantCard.querySelector('input[name="apellido"]').value;
    const dni = tenantCard.querySelector('input[name="dni"]').value;
    const telefono = tenantCard.querySelector('input[name="telefono"]').value;
    const telefonoConocido = tenantCard.querySelector('input[name="telefono_conocido"]').value;
    const precioPieza = tenantCard.querySelector('input[name="precio_pieza"]').value;
    const estadoPago = tenantCard.querySelector('select[name="estado_pago"]').value;
    const fechaRecibo = tenantCard.querySelector('input[name="fecha_recibo"]').value;
    
    const tenantData = {
        nombre,
        apellido,
        dni,
        telefono,
        telefonoConocido,
        precioPieza,
        estadoPago,
        fechaRecibo
    };

    console.log('Datos guardados:', tenantData);
    
    // Aquí podrías guardar los datos en localStorage, en una base de datos, o en algún otro sistema de almacenamiento.
    // Por ejemplo:
    // localStorage.setItem('tenantData', JSON.stringify(tenantData));
    
    // Para ahora solo mostramos un mensaje de éxito.
    alert('Información guardada correctamente');
}

// Función para guardar los datos de un inquilino en localStorage
function saveTenantInfo(propertyId, tenantId) {
    const tenantName = document.getElementById(`tenant-name-${propertyId}-${tenantId}`).value;
    const tenantSurname = document.getElementById(`tenant-surname-${propertyId}-${tenantId}`).value;
    const tenantDNI = document.getElementById(`tenant-dni-${propertyId}-${tenantId}`).value;
    const tenantPhone = document.getElementById(`tenant-phone-${propertyId}-${tenantId}`).value;
    const tenantEmergencyPhone = document.getElementById(`tenant-emergency-phone-${propertyId}-${tenantId}`).value;
    const tenantPrice = document.getElementById(`tenant-price-${propertyId}-${tenantId}`).value;
    const tenantStatus = document.getElementById(`tenant-status-${propertyId}-${tenantId}`).value;
    const receiptDate = document.getElementById(`receipt-date-${propertyId}-${tenantId}`).value;

    // Crear un objeto con los datos del inquilino
    const tenantData = {
        name: tenantName,
        surname: tenantSurname,
        dni: tenantDNI,
        phone: tenantPhone,
        emergencyPhone: tenantEmergencyPhone,
        price: tenantPrice,
        status: tenantStatus,
        receiptDate: receiptDate,
    };

    // Recuperar los datos actuales del localStorage para la propiedad específica
    let tenantsData = JSON.parse(localStorage.getItem(`property-${propertyId}`)) || [];

    // Agregar o actualizar el inquilino en el array de la propiedad
    tenantsData[tenantId] = tenantData;

    // Guardar los datos actualizados en localStorage
    localStorage.setItem(`property-${propertyId}`, JSON.stringify(tenantsData));

    alert('Información guardada correctamente');
}

// Función para cargar los datos de los inquilinos desde el localStorage al cargar la página
function loadTenantInfo() {
    // Cargar los datos de cada propiedad
    for (let propertyId = 1; propertyId <= 3; propertyId++) {
        const tenantsData = JSON.parse(localStorage.getItem(`property-${propertyId}`)) || [];
        
        // Cargar los datos de los inquilinos
        tenantsData.forEach((tenantData, tenantId) => {
            if (tenantData) {
                document.getElementById(`tenant-name-${propertyId}-${tenantId}`).value = tenantData.name;
                document.getElementById(`tenant-surname-${propertyId}-${tenantId}`).value = tenantData.surname;
                document.getElementById(`tenant-dni-${propertyId}-${tenantId}`).value = tenantData.dni;
                document.getElementById(`tenant-phone-${propertyId}-${tenantId}`).value = tenantData.phone;
                document.getElementById(`tenant-emergency-phone-${propertyId}-${tenantId}`).value = tenantData.emergencyPhone;
                document.getElementById(`tenant-price-${propertyId}-${tenantId}`).value = tenantData.price;
                document.getElementById(`tenant-status-${propertyId}-${tenantId}`).value = tenantData.status;
                document.getElementById(`receipt-date-${propertyId}-${tenantId}`).value = tenantData.receiptDate;
            }
        });
    }
}

// Llamar la función para cargar la información cuando se carga la página
window.onload = function() {
    loadTenantInfo();
}