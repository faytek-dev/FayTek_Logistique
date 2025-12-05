import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
        <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
        />
    </React.StrictMode>
);

// Enregistrer le service worker pour PWA
serviceWorkerRegistration.register({
    onSuccess: () => console.log('✅ Service Worker registered successfully'),
    onUpdate: (registration) => {
        console.log('🔄 New content available, please refresh');
        if (window.confirm('Une nouvelle version est disponible. Recharger ?')) {
            window.location.reload();
        }
    }
});

// Demander la permission pour les notifications
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
            console.log('✅ Notification permission granted');
        }
    });
}
