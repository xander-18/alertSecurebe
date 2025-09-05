// ApiServiceCard.js
import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react'; 

const ApiServiceCard = ({ service }) => {
  const { name, requests, responseTime, icon: Icon, color, description } = service;

  const StatusIcon = requests === 1 ? AlertTriangle : CheckCircle;

  return (
    <div className={`api-card ${color === 'red' ? 'alert' : ''}`}>
      <div className="api-card-header">
        <div className={`api-card-icon ${color}`}>
          <StatusIcon className="icon-lg" />
        </div>
        <span className={`api-card-status ${color === 'red' ? 'status-alert' : 'status-ok'}`}>
          {requests === 1 ? 'ALERTA DETECTADA' : 'SISTEMA NORMAL'}
        </span>
      </div>
      
      <div className="api-card-body">
        <h3 className="api-card-title">{name}</h3>
        <p className="api-card-description">{description}</p>
        <div className="api-card-stats">
          <p><strong>Fecha:</strong> {responseTime}</p>
        </div>
      </div>
    </div>
  );
};

export default ApiServiceCard;