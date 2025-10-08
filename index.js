
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
