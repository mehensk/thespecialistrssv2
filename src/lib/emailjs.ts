/**
 * EmailJS Utility
 * Handles sending emails via EmailJS service
 */

import emailjs from '@emailjs/browser';

// Initialize EmailJS with public key
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;

if (EMAILJS_PUBLIC_KEY) {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

export interface ContactFormData {
  fullName: string;
  email: string;
  phone: string;
  interest: string;
  message: string;
}

/**
 * Sends contact form data via EmailJS
 * @param formData - The contact form data
 * @returns Promise that resolves when email is sent
 */
export async function sendContactEmail(formData: ContactFormData): Promise<void> {
  if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID) {
    throw new Error('EmailJS is not properly configured. Please check your environment variables.');
  }

  const templateParams = {
    from_name: formData.fullName,
    from_email: formData.email,
    phone: formData.phone,
    interest: formData.interest,
    message: formData.message,
    to_email: 'thespecialistrss@gmail.com', // Your email address
  };

  try {
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    if (response.status !== 200) {
      throw new Error(`EmailJS returned status ${response.status}`);
    }
  } catch (error) {
    console.error('EmailJS error:', error);
    throw new Error(
      error instanceof Error
        ? `Failed to send email: ${error.message}`
        : 'Failed to send email. Please try again.'
    );
  }
}

