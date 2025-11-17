
import express from "express";
import cors from "cors";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import dotenv from "dotenv";

dotenv.config();

// Inicializar Firebase con ruta desde .env
const app = express();
app.use(cors());
app.use(express.json());

// Configuración con .env
initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
});



const db = getFirestore();
const SENSOR_COLLECTION = "sensores";
const MEDICION_COLLECTION = "mediciones"; 
const USUARIO_COLLECTION = "usuarios";
const LEAD_COLLECTION = "leads";
const CLIENTE_COLLECTION = "clientes";
const DEPARTAMENTO_COLLECTION = "departamentos";
const VENTA_COLLECTION = "ventas";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = process.env.GEMINI_API_URL;

app.post("/ai/consulta", async (req, res) => {
  try {
    const { pregunta, incluirDatos } = req.body;
    
    if (!pregunta) {
      return res.status(400).json({ error: "La pregunta es requerida" });
    }

    let contexto = "Información disponible:\n\n";
    
    const datosAIncluir = incluirDatos || ["ventas", "clientes", "departamentos", "leads"];
    
    if (datosAIncluir.includes("ventas")) {
      const ventasSnapshot = await db.collection(VENTA_COLLECTION).orderBy("created_at", "desc").limit(50).get();
      const ventas = ventasSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      contexto += `VENTAS (${ventas.length} registros):\n${JSON.stringify(ventas, null, 2)}\n\n`;
    }
    
    if (datosAIncluir.includes("clientes")) {
      const clientesSnapshot = await db.collection(CLIENTE_COLLECTION).orderBy("created_at", "desc").limit(50).get();
      const clientes = clientesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      contexto += `CLIENTES (${clientes.length} registros):\n${JSON.stringify(clientes, null, 2)}\n\n`;
    }
    
    if (datosAIncluir.includes("departamentos")) {
      const deptosSnapshot = await db.collection(DEPARTAMENTO_COLLECTION).orderBy("created_at", "desc").limit(50).get();
      const departamentos = deptosSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      contexto += `DEPARTAMENTOS (${departamentos.length} registros):\n${JSON.stringify(departamentos, null, 2)}\n\n`;
    }
    
    if (datosAIncluir.includes("leads")) {
      const leadsSnapshot = await db.collection(LEAD_COLLECTION).orderBy("fecha_registro", "desc").limit(50).get();
      const leads = leadsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      contexto += `LEADS (${leads.length} registros):\n${JSON.stringify(leads, null, 2)}\n\n`;
    }

    const promptCompleto = `Eres un asistente de CRM inmobiliario. Analiza los datos y responde de forma BREVE y DIRECTA.

${contexto}

PREGUNTA: ${pregunta}

REGLAS CRÍTICAS:
- Responde en máximo 2-3 oraciones cortas
- NO uses markdown (nada de **, ##, -, *, listas, etc.)
- NO uses emojis ni símbolos decorativos
- Responde en texto plano simple
- Ve directo al grano, sin introducciones
- Si mencionas nombres o IDs, hazlo en texto normal
- Formatea fechas de manera simple (ej: 15 de enero 2024)
- Si no hay datos, di simplemente "No hay información disponible"

Responde:`;

    const geminiResponse = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: promptCompleto,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          topK: 20,
          topP: 0.8,
          maxOutputTokens: 300,
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.text();
      throw new Error(`Error de Gemini API: ${geminiResponse.status} - ${errorData}`);
    }

    const geminiData = await geminiResponse.json();
    
    let respuestaIA = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "No se pudo generar una respuesta";
    
    // Limpiar cualquier markdown que se haya colado
    respuestaIA = respuestaIA
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#{1,6}\s/g, '')
      .replace(/`{1,3}/g, '')
      .replace(/^[-•]\s/gm, '')
      .trim();

    res.json({
      status: "ok",
      pregunta: pregunta,
      respuesta: respuestaIA,
      timestamp: new Date().toISOString(),
    });

  } catch (err) {
    console.error("Error en consulta AI:", err);
    res.status(500).json({ 
      error: err.message,
      details: "Error al procesar la consulta con IA"
    });
  }
});

// ==================== ENDPOINT ALTERNATIVO: CONSULTA ESPECÍFICA ====================
app.post("/ai/analisis", async (req, res) => {
  try {
    const { tipo, periodo } = req.body;
    
    let pregunta = "";
    let datosAIncluir = [];
    
    switch(tipo) {
      case "ventas_mes":
        pregunta = "¿Cuántas ventas se realizaron este mes y cuál es el monto total?";
        datosAIncluir = ["ventas"];
        break;
      case "clientes_potenciales":
        pregunta = "¿Cuántos clientes potenciales tenemos y cuál es su perfil?";
        datosAIncluir = ["clientes"];
        break;
      case "departamentos_disponibles":
        pregunta = "¿Qué departamentos están disponibles y cuáles son sus características principales?";
        datosAIncluir = ["departamentos"];
        break;
      case "resumen_general":
        pregunta = "Dame un resumen general del negocio: ventas, clientes, departamentos y leads";
        datosAIncluir = ["ventas", "clientes", "departamentos", "leads"];
        break;
      default:
        return res.status(400).json({ error: "Tipo de análisis no válido" });
    }

    const response = await fetch(`/ai/consulta`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pregunta, incluirDatos: datosAIncluir }),
    });

    const data = await response.json();
    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/ai/test", async (req, res) => {
  try {
    const testResponse = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Responde solo con 'OK' si puedes leer este mensaje",
              },
            ],
          },
        ],
      }),
    });

    const data = await testResponse.json();
    res.json({ 
      status: "Conexión exitosa con Gemini", 
      response: data 
    });
  } catch (err) {
    res.status(500).json({ 
      error: "Error conectando con Gemini",
      details: err.message 
    });
  }
});

// ==================== ENDPOINT IA PARA SENSORES Y ALERTAS ====================
app.post("/ai/consulta-alerts", async (req, res) => {
  try {
    const { pregunta, incluirDatos } = req.body;
    
    if (!pregunta) {
      return res.status(400).json({ error: "La pregunta es requerida" });
    }

    let contexto = "Información del sistema de sensores:\n\n";
    
    const datosAIncluir = incluirDatos || ["sensores", "mediciones", "alertas"];
    
    if (datosAIncluir.includes("sensores")) {
      const sensoresSnapshot = await db.collection(SENSOR_COLLECTION).get();
      const sensores = sensoresSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      contexto += `SENSORES (${sensores.length} registros):\n${JSON.stringify(sensores, null, 2)}\n\n`;
    }
    
    if (datosAIncluir.includes("mediciones")) {
      const medicionesSnapshot = await db.collection(MEDICION_COLLECTION)
        .orderBy("fecha", "desc")
        .limit(100)
        .get();
      const mediciones = medicionesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      contexto += `MEDICIONES RECIENTES (${mediciones.length} registros):\n${JSON.stringify(mediciones, null, 2)}\n\n`;
    }
    
    if (datosAIncluir.includes("alertas")) {
      const sensoresSnapshot = await db.collection(SENSOR_COLLECTION).get();
      const alertas = [];
      const ahora = new Date();
      
      sensoresSnapshot.docs.forEach((doc) => {
        const sensor = doc.data();
        if (sensor.status === "inactive" || sensor.status === "warning") {
          alertas.push({
            id: doc.id,
            nombre: sensor.name,
            tipo: sensor.type,
            ubicacion: sensor.location,
            estado: sensor.status,
            ultimaActividad: sensor.lastActivity
          });
        }
        
        if (sensor.lastActivity) {
          const ultimaActividad = new Date(sensor.lastActivity);
          const diferenciaHoras = (ahora - ultimaActividad) / (1000 * 60 * 60);
          if (diferenciaHoras > 1) {
            alertas.push({
              id: doc.id,
              nombre: sensor.name,
              tipo: "inactividad",
              mensaje: `Sin actividad desde hace ${diferenciaHoras.toFixed(1)} horas`,
              ultimaActividad: sensor.lastActivity
            });
          }
        }
      });
      
      contexto += `ALERTAS DETECTADAS (${alertas.length} alertas):\n${JSON.stringify(alertas, null, 2)}\n\n`;
    }

    const promptCompleto = `Eres un asistente de monitoreo IoT. Analiza los datos y responde de forma BREVE y DIRECTA.

${contexto}

PREGUNTA: ${pregunta}

REGLAS CRÍTICAS:
- Responde en máximo 2-3 oraciones cortas
- NO uses markdown (nada de **, ##, -, *, listas, etc.)
- NO uses emojis ni símbolos decorativos
- Responde en texto plano simple
- Ve directo al grano, sin introducciones
- Si hay alertas, menciónalas directamente sin formato
- Formatea fechas de manera simple
- Si no hay problemas, di simplemente "Todo normal"

Responde:`;

    const geminiResponse = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: promptCompleto,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          topK: 20,
          topP: 0.8,
          maxOutputTokens: 300,
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.text();
      throw new Error(`Error de Gemini API: ${geminiResponse.status} - ${errorData}`);
    }

    const geminiData = await geminiResponse.json();
    
    let respuestaIA = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "No se pudo generar una respuesta";
    
    // Limpiar cualquier markdown que se haya colado
    respuestaIA = respuestaIA
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#{1,6}\s/g, '')
      .replace(/`{1,3}/g, '')
      .replace(/^[-•]\s/gm, '')
      .trim();

    res.json({
      status: "ok",
      pregunta: pregunta,
      respuesta: respuestaIA,
      timestamp: new Date().toISOString(),
    });

  } catch (err) {
    console.error("Error en consulta AI de sensores:", err);
    res.status(500).json({ 
      error: err.message,
      details: "Error al procesar la consulta con IA"
    });
  }
});

app.get("/sensor", async (req, res) => {
  try {
    const snapshot = await db.collection(SENSOR_COLLECTION).get();
    const sensors = snapshot.docs.map((doc) => doc.data());
    res.json(sensors);
  } catch (err) {
    res.status(500).json({ error: err.message }); // ✅ Corregido
  }
})

app.post("/store/sensor", async (req, res) => {
  try {
    const { id, name, type, location, status, lastActivity } = req.body;
    if (!id || !name || !type || !location || !status) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }
    await db.collection(SENSOR_COLLECTION).doc(id).set({
      id,
      name,
      type,
      location,
      status,
      lastActivity: lastActivity || new Date().toISOString(),
    });
    res.json({ status: "ok" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/sensor/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection(SENSOR_COLLECTION).doc(id).delete();
    res.json({ status: "ok", message: "Sensor eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/register", async (req, res) => {
  try {
    const { email, password, nombre, rol } = req.body;
    
    if (!email || !password || !nombre) {
      return res.status(400).json({ error: "Email, password y nombre son requeridos" });
    }
    
    const userExists = await db.collection(USUARIO_COLLECTION).where("email", "==", email).get();
    if (!userExists.empty) {
      return res.status(400).json({ error: "El usuario ya existe" });
    }
    
    const docRef = await db.collection(USUARIO_COLLECTION).add({
      email,
      password, 
      nombre,
      fechaRegistro: new Date(),
    });
    
    res.json({ 
      id: docRef.id, 
      status: "ok",
      message: "Usuario registrado correctamente" 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email y password son requeridos" });
    }
    
    const snapshot = await db.collection(USUARIO_COLLECTION)
      .where("email", "==", email)
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }
    
    const userData = snapshot.docs[0].data();
    const userId = snapshot.docs[0].id;
    
    if (userData.password !== password) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }
    
    // Login exitoso
    res.json({
      status: "ok",
      message: "Login exitoso",
      usuario: {
        id: userId,
        email: userData.email,
        nombre: userData.nombre,
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para obtener todos los usuarios (opcional)
app.get("/usuarios", async (req, res) => {
  try {
    const snapshot = await db.collection(USUARIO_COLLECTION).get();
    const usuarios = snapshot.docs.map((doc) => ({
      id: doc.id,
      email: doc.data().email,
      nombre: doc.data().nombre,
      rol: doc.data().rol,
      fechaRegistro: doc.data().fechaRegistro,
      // No devolver la contraseña por seguridad
    }));
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/leads", async (req, res) => {
  try {
    const snapshot = await db.collection(LEAD_COLLECTION).orderBy("fecha_registro", "desc").get();
    const leads = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/leads", async (req, res) => {
  try {
    const { nombre, telefono, email, origen, estado, fuente, observaciones, usuario_id } = req.body;
    
    if (!nombre || !telefono || !email) {
      return res.status(400).json({ error: "Nombre, teléfono y email son requeridos" });
    }
    
    const docRef = await db.collection(LEAD_COLLECTION).add({
      nombre,
      telefono,
      email,
      origen: origen || "",
      estado: estado || "nuevo",
      fuente: fuente || "",
      observaciones: observaciones || "",
      usuario_id: usuario_id || null,
      fecha_registro: new Date(),
    });
    
    res.json({ id: docRef.id, status: "ok", message: "Lead creado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/leads/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    await db.collection(LEAD_COLLECTION).doc(id).update(updateData);
    res.json({ status: "ok", message: "Lead actualizado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/leads/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection(LEAD_COLLECTION).doc(id).delete();
    res.json({ status: "ok", message: "Lead eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== CLIENTES ====================
app.get("/clientes", async (req, res) => {
  try {
    const snapshot = await db.collection(CLIENTE_COLLECTION).orderBy("created_at", "desc").get();
    const clientes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(clientes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/clientes", async (req, res) => {
  try {
    const { dni, name, apellido, phone, email, estado_civil, presupuesto, profesion, 
            fuente, fecha_naci, direccion, observacion, is_potential, estado_proceso, usuario_id } = req.body;
    
    if (!dni || !name || !email) {
      return res.status(400).json({ error: "DNI, nombre y email son requeridos" });
    }
    
    const docRef = await db.collection(CLIENTE_COLLECTION).add({
      dni,
      name,
      apellido: apellido || "",
      phone: phone || "",
      email,
      estado_civil: estado_civil || "",
      presupuesto: presupuesto || "",
      profesion: profesion || "",
      fuente: fuente || "",
      fecha_naci: fecha_naci || "",
      direccion: direccion || "",
      observacion: observacion || "",
      is_potential: is_potential || false,
      estado_proceso: estado_proceso || "prospecto",
      usuario_id: usuario_id || null,
      created_at: new Date(),
      updated_at: new Date(),
    });
    
    res.json({ id: docRef.id, status: "ok", message: "Cliente creado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/clientes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_at: new Date() };
    
    await db.collection(CLIENTE_COLLECTION).doc(id).update(updateData);
    res.json({ status: "ok", message: "Cliente actualizado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/clientes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection(CLIENTE_COLLECTION).doc(id).delete();
    res.json({ status: "ok", message: "Cliente eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/clientes/:id/potencial", async (req, res) => {
  try {
    const { id } = req.params;
    const { is_potential } = req.body; 

    const clienteRef = db.collection(CLIENTE_COLLECTION).doc(id);
    const clienteDoc = await clienteRef.get();

    if (!clienteDoc.exists) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    await clienteRef.update({
      is_potential: is_potential, 
      updated_at: new Date(),
    });

    res.json({
      status: "ok",
      message: `Cliente ${is_potential ? "marcado como" : "removido de"} potencial correctamente`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== DEPARTAMENTOS ====================
app.get("/departamentos", async (req, res) => {
  try {
    const snapshot = await db.collection(DEPARTAMENTO_COLLECTION).orderBy("created_at", "desc").get();
    const departamentos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(departamentos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/departamentos", async (req, res) => {
  try {
    const { precio, habitaciones, banos, area_m2, direccion, tipo, estado, descripcion } = req.body;
    
    if (!precio || !direccion || !tipo) {
      return res.status(400).json({ error: "Precio, dirección y tipo son requeridos" });
    }
    
    const docRef = await db.collection(DEPARTAMENTO_COLLECTION).add({
      precio: parseFloat(precio),
      habitaciones: parseInt(habitaciones) || 0,
      banos: parseInt(banos) || 0,
      area_m2: parseFloat(area_m2) || 0,
      direccion,
      tipo,
      estado: estado || "disponible",
      descripcion: descripcion || "",
      fecha_publicacion: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    });
    
    res.json({ id: docRef.id, status: "ok", message: "Departamento creado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/departamentos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_at: new Date() };
    
    await db.collection(DEPARTAMENTO_COLLECTION).doc(id).update(updateData);
    res.json({ status: "ok", message: "Departamento actualizado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/departamentos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection(DEPARTAMENTO_COLLECTION).doc(id).delete();
    res.json({ status: "ok", message: "Departamento eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== VENTAS ====================
app.get("/ventas", async (req, res) => {
  try {
    const snapshot = await db.collection(VENTA_COLLECTION).orderBy("created_at", "desc").get();
    const ventas = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(ventas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/ventas", async (req, res) => {
  try {
    const { cliente_id, departamento_id, usuario_id, precio, fecha_venta, fecha_escritura,
            estado_venta, metodo_pago, monto_inicial, plazo_meses, observaciones } = req.body;
    
    if (!cliente_id || !departamento_id || !precio) {
      return res.status(400).json({ error: "Cliente, departamento y precio son requeridos" });
    }
    
    const docRef = await db.collection(VENTA_COLLECTION).add({
      cliente_id,
      departamento_id,
      usuario_id: usuario_id || null,
      precio: parseFloat(precio),
      fecha_venta: fecha_venta || new Date(),
      fecha_escritura: fecha_escritura || null,
      estado_venta: estado_venta || "reservado",
      metodo_pago: metodo_pago || "contado",
      monto_inicial: parseFloat(monto_inicial) || 0,
      plazo_meses: parseInt(plazo_meses) || 0,
      observaciones: observaciones || "",
      created_at: new Date(),
      updated_at: new Date(),
    });
    
    // Actualizar estado del departamento a "vendido"
    await db.collection(DEPARTAMENTO_COLLECTION).doc(departamento_id).update({
      estado: "vendido",
      updated_at: new Date(),
    });
    
    res.json({ id: docRef.id, status: "ok", message: "Venta registrada correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/ventas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_at: new Date() };
    
    await db.collection(VENTA_COLLECTION).doc(id).update(updateData);
    res.json({ status: "ok", message: "Venta actualizada correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/ventas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection(VENTA_COLLECTION).doc(id).delete();
    res.json({ status: "ok", message: "Venta eliminada correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/medicion", async (req, res) => {
  try {
    const { sensorId, valor, movimiento } = req.body;
    
    if (!sensorId) {
      return res.status(400).json({ error: "sensorId es requerido" });
    }
    
    const docRef = await db.collection(MEDICION_COLLECTION).add({
      sensorId,
      valor: valor || 0,
      movimiento: movimiento || "",
      fecha: new Date(),
    });
    
    // Actualizar lastActivity del sensor
    await db.collection(SENSOR_COLLECTION).doc(sensorId).update({
      lastActivity: new Date().toISOString().slice(0, 19).replace("T", " "),
    });
    
    res.json({ id: docRef.id, status: "ok" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/ultima/:sensorId", async (req, res) => {
  try {
    const { sensorId } = req.params;
    const snapshot = await db
      .collection(MEDICION_COLLECTION)
      .where("sensorId", "==", sensorId)
      .orderBy("fecha", "desc")
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.json({ msg: "Sin datos" });
    }

    const data = snapshot.docs[0].data();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/historico/:sensorId", async (req, res) => {
  try {
    const { sensorId } = req.params;
    const snapshot = await db
      .collection(MEDICION_COLLECTION)
      .where("sensorId", "==", sensorId)
      .orderBy("fecha", "asc")
      .get();

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/mediciones", async (req, res) => {
  try {
    const snapshot = await db
      .collection(MEDICION_COLLECTION)
      .orderBy("fecha", "desc")
      .limit(100)
      .get();

    const mediciones = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    res.json(mediciones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 API corriendo en puerto ${PORT}`));
