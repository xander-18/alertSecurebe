// Dashboard.js
import React, { useState, useEffect } from 'react';
import ApiServiceCard from '../components/apiService';
import { ShieldAlert } from 'lucide-react'; 

const Dashboard = () => {
  const [sensorData, setSensorData] = useState(null);

  useEffect(() => {
    const fetchLastSensorData = async () => {
      try {
        const sensorId = "PIR-001";
        const response = await fetch(`https://alertsecurebe.onrender.com/ultima/${sensorId}`);
        
        if (!response.ok) {
          throw new Error('La respuesta de la red no fue correcta');
        }

        const data = await response.json();

        if (data.msg === "Sin datos") {
            console.log("No se encontraron datos para este sensor.");
            return;
        }

        setSensorData(data);
      } catch (error) {
        console.error("Error al obtener los últimos datos del sensor:", error);
      }
    };

    fetchLastSensorData();
    
    const intervalId = setInterval(fetchLastSensorData, 10000);
    return () => clearInterval(intervalId);

  }, []);

  return (
    <main className="dashboard">
      <h2 className="dashboard-title">Último Estado del Sensor</h2>
      <div className="cards-grid">
        {sensorData ? (
          <ApiServiceCard
            service={{
              name: `Sensor ID: ${sensorData.sensorId}`,
              requests: sensorData.valor,
              responseTime: new Date(sensorData.fecha._seconds * 1000).toLocaleString(),
              description: sensorData.movimiento,
              icon: ShieldAlert,
              color: sensorData.valor === 1 ? 'red' : 'green' 
            }} 
          />
        ) : (
          <p>Cargando último estado del sensor...</p>
        )}
      </div>
    </main>
  );
};

export default Dashboard;