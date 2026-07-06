import { createRef } from 'react';

// Global ref — CustomAlert mounted once in App.js holds it
export const alertRef = createRef();

/**
 * Drop-in replacement for Alert.alert.
 * showAlert(title, message?, buttons?, type?)
 *   type: 'success' | 'error' | 'warning' | 'info' | 'confirm'  (auto-detected if omitted)
 */
export const showAlert = (title, message, buttons, type) => {
  alertRef.current?.show({ title, message, buttons, type });
};
