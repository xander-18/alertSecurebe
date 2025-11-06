export const mockUser = {
  email: "admin@blackrock.com",
  password: "demo123",
  nombre: "Administrador",
}

export const mockUltimaMedicion = {
  sensor: "Sensor Entrada Principal",
  ubicacion: "Puerta Principal",
  tipo: "Normal" as const,
  timestamp: "2025-10-10 14:30:25",
  estado: "activo",
}

export const mockEventos = [
  {
    id: 1,
    sensor: "Sensor Entrada",
    ubicacion: "Puerta Principal",
    tipo: "Intrusión" as const,
    fecha: "2025-10-10 14:30:00",
  },
  {
    id: 2,
    sensor: "Cámara Jardín",
    ubicacion: "Jardín Trasero",
    tipo: "Falso positivo" as const,
    fecha: "2025-10-10 12:15:00",
  },
  {
    id: 3,
    sensor: "Sensor Ventana",
    ubicacion: "Ventana Lateral",
    tipo: "Normal" as const,
    fecha: "2025-10-10 11:45:00",
  },
  {
    id: 4,
    sensor: "Cámara Entrada",
    ubicacion: "Puerta Principal",
    tipo: "Intrusión" as const,
    fecha: "2025-10-10 10:20:00",
  },
  {
    id: 5,
    sensor: "Sensor Garaje",
    ubicacion: "Garaje",
    tipo: "Normal" as const,
    fecha: "2025-10-10 09:15:00",
  },
  {
    id: 6,
    sensor: "Cámara Patio",
    ubicacion: "Patio Trasero",
    tipo: "Falso positivo" as const,
    fecha: "2025-10-10 08:30:00",
  },
]

export const mockGraficoMensual = {
  labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
  intrusiones: [0, 1, 0, 2, 1, 0, 0, 1, 0, 1],
  falsos: [2, 1, 3, 1, 2, 1, 0, 2, 1, 1],
  normales: [15, 18, 20, 17, 19, 22, 16, 18, 20, 19],
}

export type EventType = "Intrusión" | "Falso positivo" | "Normal"
