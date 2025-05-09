/**
 * Startup Investment Pitching Platform
 * Chatbot Functionality
 */

class Chatbot {
    constructor() {
        this.chatbotToggleBtn = document.getElementById('chatbot-toggle-btn');
        this.chatbotContainer = document.querySelector('.chatbot-container');
        this.chatbotCloseBtn = document.querySelector('.chatbot-close');
        this.chatbotMessages = document.querySelector('.chatbot-messages');
        this.chatbotInputField = document.getElementById('chatbot-input-field');
        this.chatbotSendBtn = document.getElementById('chatbot-send-btn');

        this.sessionId = null;
        this.loadSessionId();

        this.bindEvents();
    }

    bindEvents() {
        if (this.chatbotToggleBtn) {
            this.chatbotToggleBtn.addEventListener('click', () => {
                this.toggleChatbot();
            });
        }

        if (this.chatbotCloseBtn) {
            this.chatbotCloseBtn.addEventListener('click', () => {
                this.closeChatbot();
            });
        }

        if (this.chatbotSendBtn) {
            this.chatbotSendBtn.addEventListener('click', () => {
                this.sendMessage();
            });
        }

        if (this.chatbotInputField) {
            this.chatbotInputField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }
    }

    toggleChatbot() {
        if (this.chatbotContainer) {
            this.chatbotContainer.classList.toggle('active');

            if (this.chatbotContainer.classList.contains('active')) {
                this.chatbotInputField.focus();
            }
        }
    }

    closeChatbot() {
        if (this.chatbotContainer) {
            this.chatbotContainer.classList.remove('active');
        }
    }

    loadSessionId() {
        // Try to load from localStorage
        this.sessionId = localStorage.getItem('chatSessionId');

        // If no session ID exists, create a new one
        if (!this.sessionId) {
            this.sessionId = this.generateSessionId();
            localStorage.setItem('chatSessionId', this.sessionId);
        }
    }

    generateSessionId() {
        return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    sendMessage() {
        const message = this.chatbotInputField.value.trim();

        if (!message) return;

        // Add user message to the chat
        this.addMessage('user', message);
        this.chatbotInputField.value = '';

        // Show typing indicator
        this.addTypingIndicator();

        // Send to backend API
        this.sendMessageToAPI(message);
    }

    addMessage(role, content) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', role);

        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');

        const paragraph = document.createElement('p');
        paragraph.textContent = content;

        messageContent.appendChild(paragraph);
        messageElement.appendChild(messageContent);

        this.chatbotMessages.appendChild(messageElement);
        this.scrollToBottom();
    }

    addTypingIndicator() {
        const typingElement = document.createElement('div');
        typingElement.classList.add('message', 'assistant', 'typing');

        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');

        const dots = document.createElement('div');
        dots.classList.add('typing-dots');

        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('span');
            dots.appendChild(dot);
        }

        messageContent.appendChild(dots);
        typingElement.appendChild(messageContent);

        this.chatbotMessages.appendChild(typingElement);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        const typingIndicator = this.chatbotMessages.querySelector('.typing');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    scrollToBottom() {
        this.chatbotMessages.scrollTop = this.chatbotMessages.scrollHeight;
    }

    sendMessageToAPI(message) {
        // In a real app, replace with actual API call
        // For demo purposes, we'll simulate a response

        // For a real implementation, use:
        /*
        fetch('/api/chatbot/message/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': this.getCSRFToken(), // Make sure to implement this
            },
            body: JSON.stringify({
                session_id: this.sessionId,
                message: message
            })
        })
        .then(response => response.json())
        .then(data => {
            this.removeTypingIndicator();
            this.addMessage('assistant', data.message);
        })
        .catch(error => {
            console.error('Error:', error);
            this.removeTypingIndicator();
            this.addMessage('system', 'Sorry, I encountered an error. Please try again later.');
        });
        */

        // Simulate API delay
        setTimeout(() => {
            this.removeTypingIndicator();

            // Simulate response based on message content
            let response;

            const lowercaseMessage = message.toLowerCase();

            if (lowercaseMessage.includes('hello') || lowercaseMessage.includes('hi')) {
                response = "Hello! I'm your startup investment assistant. How can I help you today?";
            } else if (lowercaseMessage.includes('pitch') || lowercaseMessage.includes('startup')) {
                response = "Creating a compelling pitch is crucial for attracting investors. Make sure to clearly communicate your value proposition, market opportunity, traction, and team expertise. Would you like tips on specific aspects of your pitch?";
            } else if (lowercaseMessage.includes('investor') || lowercaseMessage.includes('funding')) {
                response = "Finding the right investors for your startup is about alignment. Look for investors who have experience in your industry and share your vision. Our platform helps match you with investors based on your business model and funding stage.";
            } else if (lowercaseMessage.includes('valuation')) {
                response = "Valuation is a complex topic. Early-stage startups often use methods like comparable analysis, discounted cash flow, or venture capital method. Remember, valuation is as much an art as it is a science, and it often reflects your negotiating position with investors.";
            } else if (lowercaseMessage.includes('business model') || lowercaseMessage.includes('revenue')) {
                response = "A strong business model clearly shows how your company makes money. Investors look for scalable, sustainable models with clear revenue streams. Would you like to discuss specific business models like SaaS, marketplace, or subscription?";
            } else if (lowercaseMessage.includes('help')) {
                response = "I can help you with various aspects of startup investment, including pitch creation, finding investors, business models, valuation, and funding strategies. Feel free to ask about any of these topics!";
            } else {
                response = "That's an interesting question. As your startup investment assistant, I can help with pitching, valuation, finding investors, and building your business model. Could you provide more details about what specific area you'd like guidance on?";
            }

            this.addMessage('assistant', response);
        }, 1500);
    }

    getCSRFToken() {
        // Get CSRF token from cookies
        const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];

        return cookieValue;
    }
}

// Initialize websocket connection for real-time chat (for future implementation)
class ChatWebSocket {
    constructor(sessionId) {
        this.sessionId = sessionId;
        this.socket = null;
        this.messageCallbacks = [];
        this.connected = false;

        // In a real implementation, we would connect to the WebSocket server
        // this.connect();
    }

    connect() {
        // Replace with actual WebSocket URL
        const wsUrl = `ws://${window.location.host}/ws/chat/${this.sessionId}/`;

        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
            console.log('WebSocket connected');
            this.connected = true;
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('WebSocket message received:', data);

            // Notify all callbacks
            this.messageCallbacks.forEach(callback => {
                callback(data);
            });
        };

        this.socket.onclose = () => {
            console.log('WebSocket disconnected');
            this.connected = false;

            // Attempt to reconnect after a delay
            setTimeout(() => {
                this.connect();
            }, 3000);
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    sendMessage(message) {
        if (this.connected && this.socket) {
            this.socket.send(JSON.stringify({
                message: message
            }));
        } else {
            console.error('WebSocket not connected');
        }
    }

    addMessageListener(callback) {
        this.messageCallbacks.push(callback);
    }
}

// Initialize chatbot when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const chatbot = new Chatbot();
});
