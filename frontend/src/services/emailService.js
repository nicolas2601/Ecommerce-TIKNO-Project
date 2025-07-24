import emailjs from '@emailjs/browser';

// Configuración de EmailJS
const EMAILJS_SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID || 'service_xyedtcf';
const EMAILJS_TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID || 'template_spa9mzi';
const EMAILJS_CONTACT_TEMPLATE_ID = process.env.REACT_APP_EMAILJS_CONTACT_TEMPLATE_ID || 'template_yoyhrrg';
const EMAILJS_PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

// Inicializar EmailJS
if (EMAILJS_PUBLIC_KEY) {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

/**
 * Envía un email de bienvenida al newsletter
 * @param {string} email - Email del usuario
 * @param {string} name - Nombre del usuario (opcional)
 * @returns {Promise} - Promesa con el resultado del envío
 */
export const sendNewsletterWelcome = async (email, name = 'Usuario') => {
  try {
    // Validar que EmailJS esté configurado
    if (!EMAILJS_PUBLIC_KEY) {
      throw new Error('EmailJS no está configurado. Por favor, configura tu clave pública en las variables de entorno.');
    }

    // Parámetros del template
    const templateParams = {
      email: email,
      name: name,
      reply_to: 'ewardelric8@gmail.com',
      from_name: 'TIKNO Ecommerce'
    };

    // Enviar email
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    console.log('Email enviado exitosamente:', response);
    return {
      success: true,
      message: 'Email enviado exitosamente',
      response
    };
  } catch (error) {
    console.error('Error al enviar email:', error);
    return {
      success: false,
      message: error.message || 'Error al enviar el email',
      error
    };
  }
};

/**
 * Configura la clave pública de EmailJS
 * @param {string} publicKey - Clave pública de EmailJS
 */
export const configureEmailJS = (publicKey) => {
  emailjs.init(publicKey);
};

/**
 * Envía un email de contacto
 * @param {Object} contactData - Datos del formulario de contacto
 * @param {string} contactData.name - Nombre del usuario
 * @param {string} contactData.email - Email del usuario
 * @param {string} contactData.phone - Teléfono del usuario (opcional)
 * @param {string} contactData.subject - Asunto del mensaje
 * @param {string} contactData.message - Mensaje del usuario
 * @returns {Promise} - Promesa con el resultado del envío
 */
export const sendContactMessage = async (contactData) => {
  try {
    // Validar que EmailJS esté configurado
    if (!EMAILJS_PUBLIC_KEY) {
      throw new Error('EmailJS no está configurado. Por favor, configura tu clave pública en las variables de entorno.');
    }

    // Parámetros del template de contacto
    const templateParams = {
      name: contactData.name,
      email: contactData.email,
      phone: contactData.phone || 'No proporcionado',
      title: contactData.subject,
      message: contactData.message
    };

    // Enviar email
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_CONTACT_TEMPLATE_ID,
      templateParams
    );

    console.log('Email de contacto enviado exitosamente:', response);
    return {
      success: true,
      message: 'Mensaje de contacto enviado exitosamente',
      response
    };
  } catch (error) {
    console.error('Error al enviar email de contacto:', error);
    return {
      success: false,
      message: error.message || 'Error al enviar el mensaje de contacto',
      error
    };
  }
};

export default {
  sendNewsletterWelcome,
  sendContactMessage,
  configureEmailJS
};