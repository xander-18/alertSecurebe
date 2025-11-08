// import axios from 'axios';
import Swal from 'sweetalert2';

const API_HOST = "https://alertsecurebe.onrender.com/";

export const API_URL_LOGIN = API_HOST + 'login';
export const API_URL_REGISTER = API_HOST + 'register';
export const API_URL_USERS = API_HOST + 'usuarios';
export const API_URL_LEADS = API_HOST + 'leads';
export const API_URL_CLIENTES = API_HOST + 'clientes';
export const API_URL_DEPARTAMENTOS = API_HOST + 'departamentos';
export const API_URL_VENTAS = API_HOST + 'ventas';
export const API_URL_GEMINI = API_HOST + 'ai/consulta';
export const API_URL_GEMINI_ANALISIS = API_HOST + 'ai/analisis';
// export function getSession(key) {
//   const sessionData = localStorage.getItem(key);
//   if (sessionData) {
//     return JSON.parse(sessionData);
//   }
//   return null;
// }
export const getSession = (key) => {
  const item = localStorage.getItem(key)
  try {
    return item ? JSON.parse(item) : null
  } catch {
    return null
  }
}


export function updateSession(key, value) {
  if (getSession(key)) {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

export function deleteSession(key) {
  localStorage.removeItem(key);
}
export function redirectToRelativePage(relativePath) {
  const currentPath = window.location.pathname;

  if (currentPath !== relativePath) {
    window.location.href = relativePath;
  }
}

export function notificationSwal(icon, title) {
  Swal.fire({
    position: 'top-end',
    icon: icon,
    title: title,
    showConfirmButton: false,
    timer: 3000
  });
}
export async function editarSwal(api, id, updatedData, onSuccessCallback) {
  if (!api || !id || !updatedData) {
    notificationSwal('error', 'Parámetros inválidos');
    return;
  }
  // console.log('updatedData:', updatedData);

  // Verificar si hay una imagen antes de intentar convertirla a base64
  const imageBase64 = updatedData.image ? await readFileAsBase64(updatedData.image) : null;
  const receiptBase64 = updatedData.receipt ? await readFileAsBase64(updatedData.receipt) : null;

  const requestOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ...updatedData,
      // Incluir image solo si hay una imagen
      image: imageBase64 || null,
      receipt: receiptBase64 || null
    })
  };

  // console.log('requestOptions:', requestOptions);

  try {
    const response = await fetch(api + '/' + id, requestOptions);

    if (response.ok) {
      notificationSwal('success', 'Actualizado con éxito');
      if (typeof onSuccessCallback === 'function') {
        onSuccessCallback();
      }
    } else {
      if (response.status === 404) {
        notificationSwal('error', 'Recurso no encontrado');
      } else {
        notificationSwal('error', 'Error al actualizar');
      }
    }
  } catch (error) {
    notificationSwal('error', 'Error en la solicitud: ' + error.message);
  }
}

export function convertToQueryStringGET(jsonObject) {
  const queryString = Object.keys(jsonObject)
    .filter((key) => jsonObject[key] !== null && jsonObject[key] !== undefined)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(jsonObject[key])}`)
    .join('&');
  return `?${queryString}`;
}

export function jsonToFormData(datosEnviar) {
  const formdata = new FormData();

  for (const key in datosEnviar) {
    if (datosEnviar[key] !== null && datosEnviar[key] !== '') {
      if (key === 'images' && Array.isArray(datosEnviar[key])) {
        datosEnviar[key].forEach((file, index) => {
          // Agregar cada archivo con un nombre único
          formdata.append(`${key}[${index}]`, file);
        });
      } else {
        formdata.append(key, datosEnviar[key]);
      }
    }
  }

  return formdata;
}

// export async function fetchAPIAsync(url, filter, method) {
//   try {
//     let urlApi = url;
//     let requestOptions = {
//       method: method,
//        headers: {
//         "Content-Type": "application/json", 
//       },
//       redirect: 'follow',
//     };

//     if (method === 'GET') {
//       urlApi = urlApi + convertToQueryStringGET(filter);
//     } else if (method === 'POST') {
//       requestOptions.body = jsonToFormData(filter);
//     }
//     const response = await fetch(urlApi, requestOptions);
//     if (!response.ok) {
//       throw new Error(`Error en la solicitud: ${response.statusText}`);
//     }

//     const result = await response.json();
//     return result;
//   } catch (error) {
//     notificationSwal('error', error);
//     throw error;
//   }
// }
export async function fetchAPIAsync(url, data, method = "POST") {
  try {
    let urlApi = url;
    let requestOptions = {
      method,
      headers: {
        "Content-Type": "application/json", // ✅ IMPORTANTE
      },
      redirect: "follow",
    };

    if (method === "GET") {
      urlApi = urlApi + convertToQueryStringGET(data);
    } else {
      requestOptions.body = JSON.stringify(data); // ✅ Enviar como JSON
    }

    const response = await fetch(urlApi, requestOptions);

    if (!response.ok) {
      throw new Error(`Error en la solicitud: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    notificationSwal("error", error);
    throw error;
  }
}

export async function postData(url, data) {
  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: JSON.stringify(data),
    redirect: 'follow'
  };

  try {
    const response = await fetch(url, requestOptions);
    if (response.ok) {
      const result = await response.json();
      return result;
    } else {
      notificationSwal('error', response.statusText);
      throw response.statusText;
    }
  } catch (error) {
    notificationSwal('error', error);
    throw error;
  }
}

export function eliminarSwal(id, api, onSuccessCallback) {
  Swal.fire({
    title: '¿Estás seguro?',
    text: 'Una vez eliminado no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      const apiUrl = `${api}/${id}`;
      var requestOptions = {
        method: 'DELETE',
        redirect: 'follow'
      };
      fetch(apiUrl, requestOptions)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
          }
          return response.json();
        })
        .then((result) => {
          if (result && result.message) {
            notificationSwal('success', result.message);
            if (typeof onSuccessCallback === 'function') {
              onSuccessCallback();
            }
          } else {
            throw new Error('Respuesta inesperada del servidor');
          }
        })
        .catch((error) => {
          console.error('Error al eliminar:', error);
          notificationSwal('error', 'No se pudo eliminar');
        });
    }
  });
}

export async function descargarDocumento(url, nombreArchivo) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const urlBlob = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = urlBlob;

    // Generar un nombre único basado en la fecha si no se proporciona un nombre de archivo
    const fechaActual = new Date();
    const nombreDescarga = nombreArchivo + `_${fechaActual.toISOString()}.pdf`;

    a.download = nombreDescarga;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    window.URL.revokeObjectURL(urlBlob);
  } catch (error) {
    console.error('Error al descargar el documento:', error);
  }
}
export function navigateTo(url) {
  window.location.href = URL + '#/admin/' + url;
}

