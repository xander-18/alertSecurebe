import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

interface Alert {
  id: string;
  sensorId: string;
  movimiento: string;
  fecha: any;
  valor: number;
  sensorName?: string;
  sensorLocation?: string;
}

interface AlertContextType {
  currentAlert: Alert | null;
  showAlert: boolean;
  dismissAlert: () => void;
}

const AlertContext = createContext<AlertContextType>({
  currentAlert: null,
  showAlert: false,
  dismissAlert: () => {},
});

export const useAlerts = () => useContext(AlertContext);

const API_URL = 'https://alertsecurebe.onrender.com';

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentAlert, setCurrentAlert] = useState<Alert | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [lastProcessedId, setLastProcessedId] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log('🔵 AlertProvider: Iniciando sistema de alertas');
    
    const fetchLastAlert = async () => {
      try {
        const sensorId = 'PIR-001';
        console.log('🔄 Consultando última medición para:', sensorId);
        
        const response = await fetch(`${API_URL}/ultima/${sensorId}`);
        
        if (!response.ok) {
          console.log('❌ Error en respuesta:', response.status);
          return;
        }
        
        const data = await response.json();
        
        if (data.msg === 'Sin datos') {
          console.log('ℹ️ No se encontraron datos para este sensor');
          return;
        }

        // Crear un ID único usando el timestamp
        const alertId = `${data.sensorId}-${data.fecha._seconds}-${data.fecha._nanoseconds}`;
        data.id = alertId;

        console.log('📦 Última medición recibida:', data);
        console.log('   - ID generado:', alertId);
        console.log('   - Valor:', data.valor);
        console.log('   - Movimiento:', data.movimiento);
        console.log('   - Último ID procesado:', lastProcessedId);

        // Verificar si es una nueva alerta con movimiento
        const isNewMovement = data.valor === 1 && alertId !== lastProcessedId;

        if (isNewMovement) {
          console.log('🎉 ¡NUEVA ALERTA DETECTADA!');
          console.log('   - ID:', data.id);
          console.log('   - Sensor:', data.sensorId);
          console.log('   - Movimiento:', data.movimiento);
          
          setLastProcessedId(data.id);

          // Obtener información del sensor
          try {
            console.log('🔍 Consultando información del sensor...');
            const sensorResponse = await fetch(`${API_URL}/sensor`);
            if (sensorResponse.ok) {
              const sensores = await sensorResponse.json();
              const sensor = sensores.find((s: any) => s.id === data.sensorId);
              
              if (sensor) {
                console.log('✅ Sensor encontrado:', sensor.name, '-', sensor.location);
                data.sensorName = sensor.name;
                data.sensorLocation = sensor.location;
              } else {
                console.log('⚠️ Sensor no encontrado en la lista');
              }
            }
          } catch (error) {
            console.error('❌ Error al obtener información del sensor:', error);
          }

          // Establecer la alerta actual y mostrarla
          setCurrentAlert(data);
          setShowAlert(true);
          console.log('✨ Mostrando alerta...');

          // Auto-ocultar después de 10 segundos
          setTimeout(() => {
            console.log('⏰ Auto-ocultando alerta después de 10 segundos');
            setShowAlert(false);
          }, 10000);
        } else {
          if (data.valor === 0) {
            console.log('ℹ️ Sin movimiento detectado (valor: 0)');
          } else if (data.id === lastProcessedId) {
            console.log('ℹ️ La alerta ya fue procesada anteriormente');
          }
        }
      } catch (error) {
        console.error('❌ Error al obtener última alerta:', error);
      }
    };

    // Hacer la primera consulta inmediatamente
    console.log('▶️ Ejecutando primera consulta...');
    fetchLastAlert();

    // Configurar polling cada 5 segundos
    console.log('⏰ Configurando polling cada 5 segundos');
    intervalRef.current = setInterval(() => {
      console.log('⏰ Polling automático ejecutándose...');
      fetchLastAlert();
    }, 5000);

    return () => {
      console.log('🛑 Deteniendo sistema de alertas');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [lastProcessedId]);

  const dismissAlert = () => {
    console.log('❌ Usuario cerró la alerta manualmente');
    setShowAlert(false);
  };

  return (
    <AlertContext.Provider value={{ currentAlert, showAlert, dismissAlert }}>
      {children}
    </AlertContext.Provider>
  );
};