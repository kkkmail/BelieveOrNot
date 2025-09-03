import {customConfirm} from "./customConfirm.js";

export function initCustomConfirm() {
    // Add the required CSS styles for confirm dialog
    if (!document.getElementById('custom-confirm-styles')) {
        const style = document.createElement('style');
        style.id = 'custom-confirm-styles';
        style.textContent = `
            .custom-confirm-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10001;
                opacity: 0;
                transition: opacity 0.2s ease;
            }

            .custom-confirm-overlay.show {
                opacity: 1;
            }

            .custom-confirm {
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
                max-width: 450px;
                width: 90%;
                padding: 0;
                transform: scale(0.7);
                transition: transform 0.2s ease;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }

            .custom-confirm-overlay.show .custom-confirm {
                transform: scale(1);
            }

            .custom-confirm-header {
                padding: 20px 24px 16px;
                border-bottom: 1px solid #eee;
            }

            .custom-confirm-title {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
                color: #333;
                display: flex;
                align-items: center;
            }

            .custom-confirm-icon {
                margin-right: 12px;
                font-size: 20px;
            }

            .custom-confirm-body {
                padding: 20px 24px;
            }

            .custom-confirm-message {
                margin: 0;
                font-size: 14px;
                line-height: 1.5;
                color: #555;
                white-space: pre-line;
            }

            .custom-confirm-footer {
                padding: 16px 24px 24px;
                text-align: right;
                display: flex;
                gap: 12px;
                justify-content: flex-end;
            }

            .custom-confirm-button {
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: background 0.2s ease;
                min-width: 80px;
            }

            .custom-confirm-button.cancel {
                background: #6c757d;
                color: white;
            }

            .custom-confirm-button.cancel:hover {
                background: #5a6268;
            }

            .custom-confirm-button.confirm {
                background: #007bff;
                color: white;
            }

            .custom-confirm-button.confirm:hover {
                background: #0056b3;
            }

            .custom-confirm-button:focus {
                outline: 2px solid #007bff;
                outline-offset: 2px;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Override the global confirm function
    window.confirm = customConfirm;
}