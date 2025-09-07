// js/utils/initCustomAlert.js
import {customAlert} from "./customAlert.js";

export function initCustomAlert() {
    // Add the required CSS styles
    if (!document.getElementById('custom-alert-styles')) {
        const style = document.createElement('style');
        style.id = 'custom-alert-styles';
        style.textContent = `
            .custom-alert-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.2s ease;
            }

            .custom-alert-overlay.show {
                opacity: 1;
            }

            .custom-alert {
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
                max-width: 400px;
                width: 90%;
                padding: 0;
                transform: scale(0.7);
                transition: transform 0.2s ease;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }

            .custom-alert-overlay.show .custom-alert {
                transform: scale(1);
            }

            .custom-alert-header {
                padding: 20px 24px 16px;
                border-bottom: 1px solid #eee;
            }

            .custom-alert-title {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
                color: #333;
                display: flex;
                align-items: center;
            }

            .custom-alert-icon {
                margin-right: 12px;
                font-size: 20px;
            }

            .custom-alert-body {
                padding: 20px 24px;
            }

            .custom-alert-message {
                margin: 0;
                font-size: 14px;
                line-height: 1.5;
                color: #555;
            }

            .custom-alert-footer {
                padding: 16px 24px 24px;
                text-align: right;
            }

            .custom-alert-button {
                background: #007bff;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: background 0.2s ease;
                min-width: 80px;
            }

            .custom-alert-button:hover {
                background: #0056b3;
            }

            .custom-alert-button:focus {
                outline: 2px solid #007bff;
                outline-offset: 2px;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Override the global alert function
    window.alert = customAlert;
}
