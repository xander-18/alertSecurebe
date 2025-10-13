import Swal from 'sweetalert2';

export const API_HOST = "https://alertsecurebe.onrender.com";
export const API_URL = API_HOST + "/";

export const API_URL_SENSORES = API_URL + "sensor";
export const API_URL_STORE_SENSOR = API_URL + "store/sensor";
export const API_URL_MEDICION = API_URL + "medicion";
export const API_URL_ULTIMA = API_URL + "ultima/";
export const API_URL_HISTORICO = API_URL + "historico/";
export const API_URL_REGISTER = API_URL + "register/";
export const API_URL_LOGIN = API_URL + "login/";
export const API_URL_USERS = API_URL + "usuarios/";

export function getSession(key) {
  const sessionData = localStorage.getItem(key);
  if (sessionData) {
    return JSON.parse(sessionData);
  }
  return null;
}

export function setSession(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function updateSession(key, value) {
  if (getSession(key)) {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

export function deleteSession(key) {
  localStorage.removeItem(key);
}

export function notificationSwal(icon, title, text = '') {
  Swal.fire({
    position: 'top-end',
    icon: icon,
    title: title,
    text: text,
    showConfirmButton: false,
    timer: 3000
  });
}

export function confirmSwal(title, text, onConfirm) {
  Swal.fire({
    title: title,
    text: text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, continuar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed && typeof onConfirm === 'function') {
      onConfirm();
    }
  });
}

export async function fetchAPI(url, method = 'GET', data = null) {
  try {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }   

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error en fetchAPI:', error);
    notificationSwal('error', 'Error en la solicitud', error.message);
    throw error;
  }
}