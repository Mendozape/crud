import lodash from 'lodash'; // Load lodash library
window._ = lodash;

import jQuery from 'jquery'; // Load jQuery library
window.$ = jQuery;

import Swal from 'sweetalert2'; // Load SweetAlert2 library for alerts
window.Swal = Swal;

import * as Popper from '@popperjs/core'; // Load Popper.js for Bootstrap tooltips and popovers
window.Popper = Popper;

import 'bootstrap'; // Load Bootstrap JS

/**
 * Load axios HTTP library to send requests to Laravel backend.
 * It automatically sends CSRF token in headers.
 */
import axios from 'axios';
window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

/**
 * Laravel Echo exposes an API to subscribe to channels and listen
 * for events broadcast by Laravel in real-time.
 */
import Echo from 'laravel-echo'; // Import Echo for real-time events
import Pusher from 'pusher-js'; // Import Pusher JS client

Pusher.logToConsole = true; // Enable Pusher debug logging in console

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher', // Use Pusher as broadcaster
    key: import.meta.env.VITE_PUSHER_APP_KEY, // Pusher app key from env
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER, // Pusher cluster from env
    forceTLS: true // Use TLS for secure connection
});

/**
 * Listen to notifications channel for UserRegistered event
 * Increment the bell badge automatically and dispatch a custom event.
 */
window.Echo.channel('notifications')
    .listen('.UserRegistered', (e) => {
        console.log('Notification received:', e);

        const badge = document.getElementById('notification-count');
        if (badge) {
            let count = parseInt(badge.textContent) || 0;
            badge.textContent = count + 1;
        }

        // Notificar a React si quieres que también lo sepa
        window.dispatchEvent(new CustomEvent('notification-updated', { detail: e }));
    });


