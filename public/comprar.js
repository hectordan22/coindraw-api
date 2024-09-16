// constantes 
// botn del submit
const btn_submit = document.getElementById('btn_submit')
//inputs del formulario
const input_name = document.getElementById('nombre')
const input_lastname = document.getElementById('apellido')
const input_cedula = document.getElementById('cedula')
const input_phone = document.getElementById('telefono')

// btn del popup cuando se compra 
const buttonBuyPopup = document.getElementById('btn-buy-popup')
// contendedor del popup de compra
const container_popup = document.getElementById('container_popup')
// Mensaje del popup de compra
const messagePopupBuy = document.getElementById('message-popup-buy')
// titulo del Popup de compra
const titlePopupBuy = document.getElementById('title-popup-buy')
// icono del Popup de compra
const iconBuyPopup = document.getElementById('icon-buy-popup')



/**
 * Funcion que captura los datos del Formulario y crea un Objeto
 * De momento no hace validaciones de campo
 */
btn_submit.addEventListener('click', (e) => {
  e.preventDefault()
  // obtengo el formulario
  const form = document.formBuyTicket
  // estraigos todos los inputs a traves de su atributo name
  const { nombre, apellido, cedula, telefono, boleto, num_afiliate } = form
  // creo array que contiene todos los campos
  const fields = [nombre, apellido, cedula, telefono]
  // variable que permite el envio o no del formulario
  let submit = 0
  // Recorro los campos y por cada uno valido si esta vacio
  for (let i = 0; i < fields.length; i++) {
    const item = fields[i];
    submit += validateDataEmpty(item, i)
  }
  
  const ticket = JSON.parse(boleto.value)
  console.log(ticket)

  const data = {
    nombre: nombre.value,
    apellido: apellido.value,
    cedula: cedula.value,
    telefono: telefono.value,
    boleto: ticket,
    num_afiliate: num_afiliate.value
  }
  // Si todos los datos estan llenos envio el formulario
  
  if (submit === 4) {
    // desactivo el estilo del boton del Formulario
    btn_submit.className = 'button-buy-desactive'
    //Desactivo el Boton para evitar un Doble Submit
    btn_submit.disabled = true
    //Hago la peticion Post del Formulario
    fetching(data)
  } 

})

/**
 * @method validateDataEmpty
 * @param {Object} item El campo con sus respectivos valores de name y value
 * @param {number} i representa la posicion en la iteracion
*/
const validateDataEmpty = (campo, position) => {
  if (campo.value === '') {
    document.getElementsByClassName('alert_input')[position].innerText = `${campo.name} es Obligatorio`
    return 0
  } else {
    // Si no cada uno entra en validacion 
    switch (campo.name) {
      case 'nombre':
        let nombreAlert = validateLetters(campo.value, campo.name)
        document.getElementsByClassName('alert_input')[position].innerText = nombreAlert
        if (nombreAlert != '') {
          return 0
        }
        return 1
      case 'apellido':
        let apellidoAlert = validateLetters(campo.value, campo.name)
        document.getElementsByClassName('alert_input')[position].innerText = apellidoAlert
        if (apellidoAlert != '') {
          return 0
        }
        return 1
      case 'cedula':
        let cedulaAlert = validateNumbers(campo.value,campo.name)
        document.getElementsByClassName('alert_input')[position].innerText = cedulaAlert
        if (cedulaAlert != '') {
          return 0
        }
        return 1
      case 'telefono':
        let telefonoAlert = validateNumbers(campo.value, campo.name)
        document.getElementsByClassName('alert_input')[position].innerText = telefonoAlert
        if (telefonoAlert != '') {
          return 0
        }
        return 1
    }
  }
}


function validateLetters(value, name) {
  let justLetters = /[^a-zA-Z ]+/g;
  let resulLetters = justLetters.test(value);
  if (resulLetters) {
    return `${name} no acepta numeros ni signos`
  }
  return ''

}


function validateNumbers(value,name) {
  let justNumber = /[^0-9]+/g;
  let resultNumbers = justNumber.test(value);
  if (resultNumbers) {
    return 'No coloques puntos ni signos'
  }
  if (name === 'cedula' && value.length < 8) {
    return 'La cedula debe tener 8 digitos'
  }
  if (name === 'telefono' && value.length < 11) {
    return 'El telefono debe tener 11 digitos contando el 0 a la izquierda'
  }
  return ''
}


/**
 * Evento que verifica  el valor del Nombre y muestra Alerta
 */

input_name.addEventListener('keyup', () => {
  const form = document.formBuyTicket
  const { nombre } = form
  const message = validateLetters(nombre.value, nombre.name)
  document.getElementsByClassName('alert_input')[0].innerText = message

})

/**
 * Evento que verifica  el valor del Apellido y muestra Alerta
 */
input_lastname.addEventListener('keyup', () => {
  const form = document.formBuyTicket
  const { apellido } = form
  const message = validateLetters(apellido.value, apellido.name)
  document.getElementsByClassName('alert_input')[1].innerText = message
})

/**
 * Evento que verifica  el valor de Cedula y muestra Alerta
 */
input_cedula.addEventListener('keyup', () => {
  const form = document.formBuyTicket
  const { cedula } = form
  const message = validateNumbers(cedula.value)
  document.getElementsByClassName('alert_input')[2].innerText = message
})

/**
 * Evento que verifica  el valor del Telefono y muestra Alerta
 */
input_phone.addEventListener('keyup', () => {
  const form = document.formBuyTicket
  const { telefono } = form
  const message = validateNumbers(telefono.value)
  document.getElementsByClassName('alert_input')[3].innerText = message
})

/**
 * Evento que oculta el contenedor del Popup cuando se le da Click
 */
buttonBuyPopup.addEventListener('click', () => {
  container_popup.style.display = 'none'
  window.location.replace('http://localhost:5173/');
})

/**
 * @method ShowPopup Configura y muestra el Popup 
 * @param {Object} config contiene las propiedades de Configuracion del Popup
 * @param {string} type es un string que nos ayuda a saber que tipo de popup se va a mostrar
 */

function ShowPopup(config,type) {
  const { icon, title, message, titleButton } = config

  // btn del popup cuando se compra 
 buttonBuyPopup.innerText = titleButton
// Mensaje del popup de compra
 messagePopupBuy.innerText = message
// titulo del Popup de compra
 titlePopupBuy.innerText = title 
// icono del Popup de compra
 iconBuyPopup.src = icon
 // Muestro el contenedor del Popup
 container_popup.style.display = 'flex'

  // Vacio los campos si se trata de una Compra Exitosa
  if (type === 'success') {
      // obtengo el formulario
    const form = document.formBuyTicket
    // estraigos todos los inputs a traves de su atributo name
    const { nombre, apellido, cedula, telefono, boleto} = form
    // creo array que contiene todos los campos
    const fields = [nombre, apellido, cedula, telefono, boleto]
    // Vacio los campos
    for (let i = 0; i < fields.length; i++) {
      fields[i].value = ''
    }
  }

}


/**
 * @method fetching Realiza el llamado al endPoint que registra la compra 
 * @param {string} url la url del servicio
 * @param {object} body la data que queremos enviar
 */
const fetching = async (data) => {
  fetch('http://localhost:3000/api/coindraw/insertCustomer', {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(response => response.json())
    .then(info => {
      console.log(info);
      // Caundo apenas Exista Una Respuesta activo el Boton de Envio Nuevamente
       // activo el estilo del boton del Formulario
       btn_submit.className = 'button-buy-active'
       //activo el Boton para evitar un Doble Submit
       btn_submit.disabled = false
      // si error es false
      if (!info.error && info.status === 200) {
        // Configuracion del Popup
        const config = {
          icon: '/images/icon-success.png',
          title: '¡Felicidades!',
          message: info.message,
          titleButton: 'Aceptar'
        }
        // llamo funcion que muestra al Popup
        ShowPopup(config, 'success')
      }
      else if(info.error && info.status === 200){
        /* En caso de que el Boleto ya se haya Registrado o curra un error
         Configuracion del Popup */
        const config = {
          icon: '/images/icon-warning.png',
          title: '¡Vaya! a ocurrido un error',
          message: info.message,
          titleButton: 'Intentar de Nuevo'
        }
        // llamo funcion que muestra al Popup
        ShowPopup(config, 'fail')
      }else{
        // Si es cualquier otro error que no sea de estado 200
        const config = {
          icon: '/images/icon-fail.png',
          title: '¡Vaya! a ocurrido un error',
          message: info.message,
          titleButton: 'Intentar de Nuevo'
        }
         // llamo funcion que muestra al Popup
        ShowPopup(config, 'fail')
      }
    })
    .catch(err => {
      /* En caso de que ocurra un error en el Servidor 
        Configuracion del Popup
      */
      const config = {
        icon: '/images/icon-fail.png',
        title: '¡Vaya! a ocurrido un error',
        message: err.message,
        titleButton: 'Intentar de Nuevo'
      }
       // llamo funcion que muestra al Popup
      ShowPopup(config, 'fail')
    })
}
