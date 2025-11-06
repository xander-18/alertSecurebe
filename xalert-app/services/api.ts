// lib/api.ts
const API_URL = 'https://alertsecurebe.onrender.com';

export const api = {
  getSensores: async () => {
    const res = await fetch(`${API_URL}/sensor`);
    return res.json();
  },

  getUltimaMedicion: async (sensorId: string) => {
    const res = await fetch(`${API_URL}/ultima/${sensorId}`);
    return res.json();
  },
  getMediciones: async () => {
    const res = await fetch(`${API_URL}/mediciones`);
    return res.json();
  },

  getHistoricoSensor: async (sensorId: string) => {
    const res = await fetch(`${API_URL}/historico/${sensorId}`);
    return res.json();
  },
};

export interface Sensor {
  id: string;
  name: string;
  type: string;
  location: string;
  status: string;
  lastActivity: string;
}

export interface Medicion {
  id: string;
  sensorId: string;
  valor: number;
  movimiento: string;
  fecha: any;
}