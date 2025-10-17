const API_URL = "http://localhost:3000";
let productos = [];
let paginaActual = 1;
const porPagina = 5;
let ordenCampo = null;
let ordenAsc = true;

const tbody = document.querySelector("#tabla-productos tbody");
const spinner = document.getElementById("spinner");
const mensaje = document.getElementById("mensaje");

document.getElementById("btn-cargar").addEventListener("click", cargarProductos);
document.getElementById("busqueda").addEventListener("input", renderProductos);
document.getElementById("form-producto").addEventListener("submit", agregarProducto);
document.querySelectorAll("#tabla-productos th[data-field]").forEach(th => {
  th.addEventListener("click", () => ordenarPor(th.dataset.field));
});

// ✅ Cargar productos del backend
async function cargarProductos() {
  mostrarSpinner(true);
  try {
    const res = await fetch(`${API_URL}/productos`);
    if (!res.ok) throw new Error("Error al cargar productos");
    productos = await res.json(); // ✅ El backend devuelve directamente el array
    paginaActual = 1;
    renderProductos();
    mostrarMensaje("Productos cargados correctamente", "ok");
  } catch (err) {
    mostrarMensaje(err.message, "error");
  } finally {
    mostrarSpinner(false);
  }
}

// ✅ Renderizado con búsqueda dinámica
async function renderProductos() {
  const busqueda = document.getElementById("busqueda").value.trim();

  try {
    // Consultar al backend con búsqueda
    const url = busqueda 
      ? `${API_URL}/productos?busqueda=${encodeURIComponent(busqueda)}`
      : `${API_URL}/productos`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error("Error al obtener productos");
    
    let filtrados = await res.json(); // ✅ Array directo

    // Ordenamiento local
    if (ordenCampo) {
      filtrados.sort((a, b) => {
        if (a[ordenCampo] < b[ordenCampo]) return ordenAsc ? -1 : 1;
        if (a[ordenCampo] > b[ordenCampo]) return ordenAsc ? 1 : -1;
        return 0;
      });
    }

    // Paginación
    const inicio = (paginaActual - 1) * porPagina;
    const visibles = filtrados.slice(inicio, inicio + porPagina);

    // Mostrar en tabla
    tbody.innerHTML = "";
    
    if (visibles.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center">No hay productos</td></tr>';
    } else {
      visibles.forEach(p => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><input type="text" value="${p.nombre}" data-id="${p._id}" data-field="nombre" disabled></td>
          <td><input type="number" value="${p.precio}" data-id="${p._id}" data-field="precio" disabled></td>
          <td><input type="text" value="${p.descripcion}" data-id="${p._id}" data-field="descripcion" disabled></td>
          <td>
            <button class="edit-btn" onclick="editarProducto('${p._id}')">Editar</button>
            <button class="save-btn" onclick="guardarProducto('${p._id}')" style="display:none">Guardar</button>
            <button class="delete-btn" onclick="eliminarProducto('${p._id}')">Eliminar</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }

    renderPaginacion(filtrados.length);
  } catch (err) {
    mostrarMensaje("Error al renderizar productos: " + err.message, "error");
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:red">Error al cargar datos</td></tr>';
  }
}

function renderPaginacion(total) {
  const totalPaginas = Math.ceil(total / porPagina);
  const pagDiv = document.getElementById("paginacion");
  pagDiv.innerHTML = "";
  
  if (totalPaginas <= 1) return; // No mostrar paginación si solo hay 1 página
  
  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === paginaActual) btn.style.background = "#0056b3";
    btn.addEventListener("click", () => {
      paginaActual = i;
      renderProductos();
    });
    pagDiv.appendChild(btn);
  }
}

function ordenarPor(campo) {
  if (ordenCampo === campo) {
    ordenAsc = !ordenAsc;
  } else {
    ordenCampo = campo;
    ordenAsc = true;
  }
  renderProductos();
}

async function eliminarProducto(id) {
  if (!confirm("¿Seguro que deseas eliminar este producto?")) return;
  
  mostrarSpinner(true);
  try {
    const res = await fetch(`${API_URL}/productos/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error al eliminar");
    
    productos = productos.filter(p => p._id !== id);
    renderProductos();
    mostrarMensaje("Producto eliminado", "ok");
  } catch (err) {
    mostrarMensaje("Error al eliminar producto: " + err.message, "error");
  } finally {
    mostrarSpinner(false);
  }
}

function editarProducto(id) {
  const inputs = document.querySelectorAll(`input[data-id="${id}"]`);
  inputs.forEach(i => i.disabled = false);
  const row = inputs[0].closest("tr");
  row.querySelector(".edit-btn").style.display = "none";
  row.querySelector(".save-btn").style.display = "inline-block";
}

async function guardarProducto(id) {
  const inputs = document.querySelectorAll(`input[data-id="${id}"]`);
  const actualizado = {};
  
  inputs.forEach(i => {
    actualizado[i.dataset.field] = i.type === "number" ? parseFloat(i.value) : i.value;
  });

  // Validaciones
  if (!actualizado.nombre || actualizado.nombre.length < 3) {
    return mostrarMensaje("El nombre debe tener al menos 3 caracteres", "error");
  }
  if (!actualizado.precio || actualizado.precio <= 0) {
    return mostrarMensaje("El precio debe ser mayor que 0", "error");
  }
  if (!actualizado.descripcion || actualizado.descripcion.length < 5) {
    return mostrarMensaje("La descripción debe tener al menos 5 caracteres", "error");
  }

  mostrarSpinner(true);
  try {
    const res = await fetch(`${API_URL}/productos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(actualizado)
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.mensaje || "Error al actualizar");
    }
    
    const productoActualizado = await res.json();
    
    // Deshabilitar inputs y cambiar botones
    inputs.forEach(i => i.disabled = true);
    const row = inputs[0].closest("tr");
    row.querySelector(".edit-btn").style.display = "inline-block";
    row.querySelector(".save-btn").style.display = "none";
    
    // Actualizar el array local
    productos = productos.map(p => p._id === id ? productoActualizado : p);
    
    mostrarMensaje("Producto actualizado", "ok");
  } catch (err) {
    mostrarMensaje("Error al actualizar: " + err.message, "error");
  } finally {
    mostrarSpinner(false);
  }
}

async function agregarProducto(e) {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const precio = parseFloat(document.getElementById("precio").value);
  const descripcion = document.getElementById("descripcion").value.trim();

  // Validaciones
  if (!nombre || nombre.length < 3) {
    return mostrarMensaje("El nombre debe tener al menos 3 caracteres", "error");
  }
  if (!precio || precio <= 0 || isNaN(precio)) {
    return mostrarMensaje("El precio debe ser mayor que 0", "error");
  }
  if (!descripcion || descripcion.length < 5) {
    return mostrarMensaje("La descripción debe tener al menos 5 caracteres", "error");
  }

  const nuevo = { nombre, precio, descripcion };

  mostrarSpinner(true);
  try {
    const res = await fetch(`${API_URL}/productos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevo)
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.errors ? error.errors[0].msg : "Error al crear producto");
    }
    
    const creado = await res.json();
    productos.push(creado);
    renderProductos();
    e.target.reset();
    mostrarMensaje("Producto añadido correctamente", "ok");
  } catch (err) {
    mostrarMensaje("Error al añadir: " + err.message, "error");
  } finally {
    mostrarSpinner(false);
  }
}

function mostrarSpinner(show) {
  spinner.style.display = show ? "block" : "none";
}

function mostrarMensaje(texto, tipo) {
  mensaje.textContent = texto;
  mensaje.className = "mensaje " + tipo;
  mensaje.style.display = "block";
  setTimeout(() => mensaje.style.display = "none", 3000);
}