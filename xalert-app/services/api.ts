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

  consultaIASensores: async (pregunta: string, incluirDatos?: string[]) => {
    try {
      const res = await fetch(`${API_URL}/ai/consulta-alerts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pregunta,
          incluirDatos: incluirDatos || ["sensores", "mediciones", "alertas"]
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al consultar la IA de sensores');
      }

      return res.json();
    } catch (error) {
      console.error('Error en consultaIASensores:', error);
      throw error;
    }
  },

  analisisSensores: async (tipo: 'estado_general' | 'mediciones_recientes' | 'alertas_criticas' | 'resumen_completo' | 'tendencias') => {
    try {
      const res = await fetch(`${API_URL}/ai/analisis-alerts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tipo })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al realizar análisis de sensores');
      }

      return res.json();
    } catch (error) {
      console.error('Error en analisisSensores:', error);
      throw error;
    }
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

export interface IASensoresResponse {
  status: string;
  pregunta: string;
  respuesta: string;
  timestamp: string;
}

export interface AnalisisSensoresResponse {
  status: string;
  tipo: string;
  pregunta: string;
  respuesta: string;
  timestamp: string;
}