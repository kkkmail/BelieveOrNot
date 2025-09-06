// js/utils/showHtmlModal.js
export async function showHtmlModal(config) {
    console.log(`Loading ${config.name} modal...`);
    
    try {
        // Load the HTML content
        const response = await fetch(config.htmlFile);
        const html = await response.text();
        
        // Extract the content from the specified container
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const container = doc.querySelector(config.contentSelector);
        
        if (!container) {
            throw new Error(`${config.name} content not found`);
        }
        
        // Remove the back button if it exists
        const backButton = container.querySelector(config.backButtonSelector);
        if (backButton) {
            backButton.remove();
        }
        
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.id = `${config.modalId}Overlay`;
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
            padding: 20px;
            box-sizing: border-box;
        `;
        
        // Create modal panel
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white;
            border-radius: 15px;
            box-shadow: 0 15px 50px rgba(0, 0, 0, 0.5);
            max-width: ${config.maxWidth || '900px'};
            width: 100%;
            max-height: ${config.maxHeight || '90vh'};
            overflow-y: auto;
            transform: scale(0.7);
            transition: transform 0.3s ease;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        `;
        
        // Create header
        const header = document.createElement('div');
        header.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 15px 15px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        
        const title = document.createElement('h2');
        title.innerHTML = config.title;
        title.style.cssText = 'margin: 0; font-size: 24px;';
        
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '✕';
        closeButton.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background 0.2s;
        `;
        closeButton.addEventListener('mouseenter', () => {
            closeButton.style.background = 'rgba(255,255,255,0.2)';
        });
        closeButton.addEventListener('mouseleave', () => {
            closeButton.style.background = 'none';
        });
        
        header.appendChild(title);
        header.appendChild(closeButton);
        
        // Create body with content
        const body = document.createElement('div');
        body.style.cssText = config.bodyStyle || 'padding: 30px; overflow-y: auto;';
        body.innerHTML = container.innerHTML;
        
        // Assemble modal
        modal.appendChild(header);
        modal.appendChild(body);
        overlay.appendChild(modal);
        
        // Add to page with animation
        document.body.appendChild(overlay);
        
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            modal.style.transform = 'scale(1)';
        });
        
        // Close handlers
        const closeModal = () => {
            overlay.style.opacity = '0';
            modal.style.transform = 'scale(0.7)';
            setTimeout(() => {
                if (document.body.contains(overlay)) {
                    document.body.removeChild(overlay);
                }
            }, 300);
        };
        
        closeButton.addEventListener('click', closeModal);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal();
            }
        });
        
        // Handle ESC key
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                document.removeEventListener('keydown', handleEsc);
                closeModal();
            }
        };
        document.addEventListener('keydown', handleEsc);
        
        console.log(`${config.name} modal displayed successfully`);
        
    } catch (error) {
        console.error(`Failed to load ${config.name} content:`, error);
        alert(`Failed to load ${config.name} content. Please try again.`);
    }
}