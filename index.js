
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

    // Verificar si el cliente existe
    const clienteRef = db.collection(CLIENTE_COLLECTION).doc(id);
    const clienteDoc = await clienteRef.get();

    if (!clienteDoc.exists) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    // Actualizar campo is_potential
    await clienteRef.update({
      is_potential: true,
      updated_at: new Date(),
    });

    res.json({
      status: "ok",
      message: "Cliente marcado como potencial correctamente",
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
