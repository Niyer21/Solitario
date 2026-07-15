// ============================================================
// ARCHIVO: script.js
// LÓGICA CORREGIDA Y COMPLETA – Solitario 2048
// ============================================================

// ----- DETECCIÓN DE IMÁGENES -----
const testImage = new Image();
testImage.src = 'cartas/cartas/carta1.png';
testImage.onerror = () => {
    document.body.classList.add('sin-imagenes');
};

// ----- ESTADO DEL JUEGO -----
const state = {
    columnas: [[], [], [], []], // 4 columnas inicialmente vacías
    cartaActual: 0,             // Valor de la carta en el mazo
    puntuacion: 0,              // Contador de puntos acumulados
    juegoTerminado: false,
    maxCartas: 8                // Límite inferior por columna
};

// ----- ELEMENTOS DOM -----
const elementos = {
    columnas: [],
    contenedoresCartas: [],
    cartaActualDiv: document.getElementById('carta-actual'),
    cartaActualTexto: document.getElementById('valor-carta-actual'),
    puntos: document.getElementById('puntos'),
    mensajeEstado: document.getElementById('mensaje-estado'),
    botonReiniciar: document.getElementById('boton-reiniciar')
};

// Inicializar referencias del DOM
for (let i = 0; i < 4; i++) {
    elementos.columnas[i] = document.getElementById(`columna-${i}`);
    elementos.contenedoresCartas[i] = document.getElementById(`cartas-${i}`);
}

// ----- FUNCIONES DE LÓGICA -----

// Generar una carta aleatoria con probabilidades realistas (2, 4, 8, 16 o 32)
function generarCarta() {
    const rand = Math.random();
    if (rand < 0.45) return 2;
    if (rand < 0.75) return 4;
    if (rand < 0.90) return 8;
    if (rand < 0.98) return 16;
    return 32;
}

// LÓGICA RECURSIVA DE FUSIÓN EN CADENA
function fusionarColumna(indiceColumna, valorNuevo) {
    const columna = state.columnas[indiceColumna];
    
    // Caso base: si la columna está vacía, simplemente colocamos la carta
    if (columna.length === 0) {
        columna.push(valorNuevo);
        return;
    }

    const ultimoValor = columna[columna.length - 1];
    
    // Si la carta soltada es igual a la carta superior, se combinan
    if (ultimoValor === valorNuevo) {
        // Removemos la carta superior con la que se fusionó
        columna.pop();
        
        // El nuevo valor es la suma de ambas
        const nuevoValor = ultimoValor + valorNuevo;
        
        // Sumamos los puntos al marcador
        state.puntuacion += nuevoValor;
        
        // EFECTO ESPECIAL 2048: Si se alcanza el 2048, la columna completa se limpia
        if (nuevoValor === 2048) {
            columna.length = 0; // Se vacía el arreglo de esta columna
            elementos.mensajeEstado.textContent = '⚡ ¡Columna limpia por llegar al 2048! +2048 Pts';
            return;
        }
        
        // RECURSIVIDAD: Intentar fusionar el nuevo número con la carta que quedó debajo
        fusionarColumna(indiceColumna, nuevoValor);
    } else {
        // Si no hay coincidencia, la carta se apila encima de la última
        columna.push(valorNuevo);
    }
}

// ACCIÓN DE SOLTAR LA CARTA EN UNA COLUMNA
function colocarCarta(indiceColumna) {
    if (state.juegoTerminado) {
        alert('El juego ha terminado. Presiona "Reiniciar" para comenzar una nueva partida.');
        return;
    }

    // Resetear mensaje de estado por defecto para el nuevo movimiento
    elementos.mensajeEstado.textContent = '🎯 En curso — coloca tu carta';
    
    const columna = state.columnas[indiceColumna];
    
    // Si la columna ya tiene 8 cartas y la nueva carta NO es igual a la superior, 
    // no se podrá fusionar y excederá el límite (Derrota).
    if (columna.length >= state.maxCartas && columna[columna.length - 1] !== state.cartaActual) {
        // Añadimos la carta para que el usuario visualice el desbordamiento
        columna.push(state.cartaActual);
        state.juegoTerminado = true;
        
        actualizarVistaColumna(indiceColumna);
        elementos.mensajeEstado.textContent = '💀 ¡Game Over! Una columna ha excedido el límite de cartas.';
        return;
    }
    
    // Ejecutamos la lógica de inserción y fusión recursiva
    fusionarColumna(indiceColumna, state.cartaActual);
    
    // Verificar por seguridad si tras las fusiones la columna superó el límite
    if (state.columnas[indiceColumna].length > state.maxCartas) {
        state.juegoTerminado = true;
        actualizarVistaColumna(indiceColumna);
        elementos.mensajeEstado.textContent = '💀 ¡Game Over! Límite de cartas excedido.';
        return;
    }
    
    // Generar la siguiente carta del mazo y actualizar todo el tablero
    state.cartaActual = generarCarta();
    
    actualizarVistaColumna(indiceColumna);
    actualizarVistaMazo();
    actualizarPuntuacion();
    verificarEstadoGeneral();
}

// ----- FUNCIONES DE ACTUALIZACIÓN DOM -----

function actualizarVistaColumna(indiceColumna) {
    const contenedor = elementos.contenedoresCartas[indiceColumna];
    const columna = state.columnas[indiceColumna];
    
    contenedor.innerHTML = '';
    
    // Renderizamos las cartas de la columna
    columna.forEach(valor => {
        const cartaDiv = document.createElement('div');
        cartaDiv.className = 'carta';
        cartaDiv.setAttribute('data-valor', valor); // Permite que el CSS asigne colores
        cartaDiv.textContent = valor;
        contenedor.appendChild(cartaDiv);
    });
}

function actualizarVistaMazo() {
    elementos.cartaActualDiv.setAttribute('data-valor', state.cartaActual);
    elementos.cartaActualTexto.textContent = state.cartaActual;
}

function actualizarPuntuacion() {
    elementos.puntos.textContent = state.puntuacion;
}

// Comprobar si todas las columnas están llenas y no hay jugadas posibles
function verificarEstadoGeneral() {
    if (state.juegoTerminado) return;
    
    let movimientosDisponibles = false;
    
    for (let i = 0; i < 4; i++) {
        const col = state.columnas[i];
        // Si hay espacio en la columna O la carta superior se puede fusionar con la actual
        if (col.length < state.maxCartas || col[col.length - 1] === state.cartaActual) {
            movimientosDisponibles = true;
            break;
        }
    }
    
    if (!movimientosDisponibles) {
        state.juegoTerminado = true;
        elementos.mensajeEstado.textContent = '💀 ¡Game Over! No hay columnas disponibles ni fusiones posibles.';
    } else if (!elementos.mensajeEstado.textContent.includes('⚡')) {
        elementos.mensajeEstado.textContent = '🎯 En curso — selecciona una columna';
    }
}

// ----- INICIALIZACIÓN Y REINICIO -----
function reiniciarJuego() {
    state.columnas = [[], [], [], []]; // Limpiar tablero
    state.puntuacion = 0;
    state.juegoTerminado = false;
    state.cartaActual = generarCarta();
    
    for (let i = 0; i < 4; i++) {
        actualizarVistaColumna(i);
    }
    
    actualizarVistaMazo();
    actualizarPuntuacion();
    elementos.mensajeEstado.textContent = '🎯 En curso — coloca tu carta';
}

// Asignar eventos a las 4 columnas y al botón de reiniciar
for (let i = 0; i < 4; i++) {
    elementos.columnas[i].addEventListener('click', () => colocarCarta(i));
}
elementos.botonReiniciar.addEventListener('click', reiniciarJuego);

// Arrancar el juego al cargar la página
reiniciarJuego();