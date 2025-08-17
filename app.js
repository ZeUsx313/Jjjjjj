// ChatZEUS Application - Main JavaScript File
class ChatZEUS {
    constructor() {
        this.agents = [];
        this.apiKeys = [];
        this.files = [];
        this.conversations = [];
        this.currentConversation = null;
        this.currentTheme = 'light';
        this.isProcessing = false;
        this.currentKeyIndex = 0;
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.renderAgents();
        this.renderApiKeys();
        this.renderFiles();
        this.renderConversations();
        this.applyTheme();
        this.loadSidebarState();
    }

    // Data Management
    loadData() {
        this.agents = JSON.parse(localStorage.getItem('chatzeus_agents') || '[]');
        this.apiKeys = JSON.parse(localStorage.getItem('chatzeus_apiKeys') || '[]');
        this.files = JSON.parse(localStorage.getItem('chatzeus_files') || '[]');
        this.conversations = JSON.parse(localStorage.getItem('chatzeus_conversations') || '[]');
        this.currentTheme = localStorage.getItem('chatzeus_theme') || 'light';
        
        // Create default agents if none exist
        if (this.agents.length === 0) {
            this.createDefaultAgents();
        }
    }

    saveData() {
        localStorage.setItem('chatzeus_agents', JSON.stringify(this.agents));
        localStorage.setItem('chatzeus_apiKeys', JSON.stringify(this.apiKeys));
        localStorage.setItem('chatzeus_files', JSON.stringify(this.files));
        localStorage.setItem('chatzeus_conversations', JSON.stringify(this.conversations));
        localStorage.setItem('chatzeus_theme', this.currentTheme);
    }

    createDefaultAgents() {
        const defaultAgents = [
            {
                id: 'agent1',
                name: 'CodeMaster',
                role: 'مبرمج',
                persona: 'أنا مبرمج محترف متخصص في حل المشاكل البرمجية. أعمل بدقة وأحب الكود النظيف والمحسن.',
                model: 'gpt-4o',
                avatar: '💻'
            },
            {
                id: 'agent2',
                name: 'Reviewer',
                role: 'مراجع',
                persona: 'أنا مراجع دقيق، أتحقق من الكود والأفكار وأقدم اقتراحات للتحسين.',
                model: 'claude-3.5-sonnet',
                avatar: '🔍'
            },
            {
                id: 'agent3',
                name: 'Analyst',
                role: 'محلل',
                persona: 'أنا محلل استراتيجي، أفهم المتطلبات وأقترح أفضل الحلول.',
                model: 'gemini-1.5-pro',
                avatar: '📊'
            }
        ];

        this.agents = defaultAgents;
        this.saveData();
    }

    // Event Listeners
    setupEventListeners() {
        // Settings modal
        document.getElementById('settingsBtn').addEventListener('click', () => this.showModal('settingsModal'));
        document.getElementById('closeSettingsBtn').addEventListener('click', () => this.hideModal('settingsModal'));
        
        // Add agent modal
        document.getElementById('addAgentBtn').addEventListener('click', () => this.showModal('addAgentModal'));
        document.getElementById('closeAddAgentBtn').addEventListener('click', () => this.hideModal('addAgentModal'));
        document.getElementById('cancelAddAgentBtn').addEventListener('click', () => this.hideModal('addAgentModal'));
        
        // Add key modal
        document.getElementById('addKeyBtn').addEventListener('click', () => this.showModal('addKeyModal'));
        document.getElementById('closeAddKeyBtn').addEventListener('click', () => this.hideModal('addKeyModal'));
        document.getElementById('cancelAddKeyBtn').addEventListener('click', () => this.hideModal('addKeyModal'));
        
        // Add file modal
        document.getElementById('addFileBtn').addEventListener('click', () => this.showModal('addFileModal'));
        document.getElementById('closeAddFileBtn').addEventListener('click', () => this.hideModal('addFileModal'));
        document.getElementById('cancelAddFileBtn').addEventListener('click', () => this.hideModal('addFileModal'));
        
        // Forms
        document.getElementById('addAgentForm').addEventListener('submit', (e) => this.handleAddAgent(e));
        document.getElementById('addKeyForm').addEventListener('submit', (e) => this.handleAddKey(e));
        document.getElementById('addFileForm').addEventListener('submit', (e) => this.handleAddFile(e));
        
        // Chat
        document.getElementById('sendBtn').addEventListener('click', () => this.sendMessage());
        document.getElementById('messageInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // New chat
        document.getElementById('newChatBtn').addEventListener('click', () => this.startNewChat());
        
        // Sidebar toggle
        document.getElementById('toggleSidebarBtn').addEventListener('click', () => this.toggleSidebar());
        
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
        
        // Auto-resize textarea
        document.getElementById('messageInput').addEventListener('input', (e) => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
        });
    }

    // Modal Management
    showModal(modalId) {
        document.getElementById(modalId).classList.add('show');
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
        // Reset forms
        if (modalId === 'addAgentModal') {
            document.getElementById('addAgentForm').reset();
        } else if (modalId === 'addKeyModal') {
            document.getElementById('addKeyForm').reset();
        } else if (modalId === 'addFileModal') {
            document.getElementById('addFileForm').reset();
        }
    }

    switchTab(tabName) {
        // Remove active class from all tabs and contents
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to selected tab and content
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}Tab`).classList.add('active');
    }

    // Sidebar Management
    toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const mainChat = document.querySelector('.main-chat');
        const toggleBtn = document.querySelector('#toggleSidebarBtn i');
        
        sidebar.classList.toggle('collapsed');
        mainChat.classList.toggle('expanded');
        
        if (sidebar.classList.contains('collapsed')) {
            toggleBtn.className = 'fas fa-chevron-left';
        } else {
            toggleBtn.className = 'fas fa-chevron-right';
        }
        
        this.saveSidebarState();
    }
    
    saveSidebarState() {
        const sidebar = document.querySelector('.sidebar');
        const isCollapsed = sidebar.classList.contains('collapsed');
        localStorage.setItem('chatzeus_sidebar_collapsed', isCollapsed);
    }
    
    loadSidebarState() {
        const isCollapsed = localStorage.getItem('chatzeus_sidebar_collapsed') === 'true';
        if (isCollapsed) {
            const sidebar = document.querySelector('.sidebar');
            const mainChat = document.querySelector('.main-chat');
            const toggleBtn = document.querySelector('#toggleSidebarBtn i');
            
            sidebar.classList.add('collapsed');
            mainChat.classList.add('expanded');
            toggleBtn.className = 'fas fa-chevron-left';
        }
    }

    // Theme Management
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        this.saveData();
    }

    applyTheme() {
        document.body.setAttribute('data-theme', this.currentTheme);
        const themeIcon = document.querySelector('#themeToggle i');
        if (this.currentTheme === 'dark') {
            themeIcon.className = 'fas fa-sun';
        } else {
            themeIcon.className = 'fas fa-moon';
        }
    }

    // Agent Management
    handleAddAgent(e) {
        e.preventDefault();
        
        const agentData = {
            id: 'agent_' + Date.now(),
            name: document.getElementById('agentName').value,
            role: document.getElementById('agentRole').value,
            persona: document.getElementById('agentPersona').value,
            model: document.getElementById('agentModel').value,
            avatar: this.generateAvatar(document.getElementById('agentName').value)
        };
        
        this.agents.push(agentData);
        this.saveData();
        this.renderAgents();
        this.hideModal('addAgentModal');
        
        this.showNotification('تم إضافة الوكيل بنجاح!', 'success');
    }

    generateAvatar(name) {
        const avatars = ['🤖', '👨‍💻', '👩‍💻', '🧠', '💡', '🔬', '📚', '🎯', '⚡', '🌟'];
        const index = name.charCodeAt(0) % avatars.length;
        return avatars[index];
    }

    deleteAgent(agentId) {
        if (confirm('هل أنت متأكد من حذف هذا الوكيل؟')) {
            this.agents = this.agents.filter(agent => agent.id !== agentId);
            this.saveData();
            this.renderAgents();
            this.showNotification('تم حذف الوكيل بنجاح!', 'success');
        }
    }

    renderAgents() {
        const agentsList = document.getElementById('agentsList');
        agentsList.innerHTML = '';
        
        this.agents.forEach(agent => {
            const agentElement = document.createElement('div');
            agentElement.className = 'agent-item';
            agentElement.innerHTML = `
                <div class="item-header">
                    <div class="item-title">
                        <span style="font-size: 1.5rem; margin-left: 8px;">${agent.avatar}</span>
                        ${agent.name}
                    </div>
                    <div class="item-actions">
                        <button class="action-btn delete" onclick="app.deleteAgent('${agent.id}')">
                            <i class="fas fa-trash"></i> حذف
                        </button>
                    </div>
                </div>
                <div class="item-details">
                    <strong>الدور:</strong> ${agent.role}<br>
                    <strong>النموذج:</strong> ${agent.model}<br>
                    <strong>الشخصية:</strong> ${agent.persona}
                </div>
            `;
            agentsList.appendChild(agentElement);
        });
    }

    // API Key Management
    handleAddKey(e) {
        e.preventDefault();
        
        const keyData = {
            id: 'key_' + Date.now(),
            provider: document.getElementById('keyProvider').value,
            key: document.getElementById('apiKey').value,
            name: document.getElementById('keyName').value || 'مفتاح جديد',
            createdAt: new Date().toISOString(),
            usage: 0
        };
        
        this.apiKeys.push(keyData);
        this.saveData();
        this.renderApiKeys();
        this.hideModal('addKeyModal');
        
        this.showNotification('تم إضافة المفتاح بنجاح!', 'success');
    }

    deleteKey(keyId) {
        if (confirm('هل أنت متأكد من حذف هذا المفتاح؟')) {
            this.apiKeys = this.apiKeys.filter(key => key.id !== keyId);
            this.saveData();
            this.renderApiKeys();
            this.showNotification('تم حذف المفتاح بنجاح!', 'success');
        }
    }

    renderApiKeys() {
        const keysList = document.getElementById('keysList');
        keysList.innerHTML = '';
        
        this.apiKeys.forEach(key => {
            const keyElement = document.createElement('div');
            keyElement.className = 'key-item';
            keyElement.innerHTML = `
                <div class="item-header">
                    <div class="item-title">${key.name}</div>
                    <div class="item-actions">
                        <button class="action-btn delete" onclick="app.deleteKey('${key.id}')">
                            <i class="fas fa-trash"></i> حذف
                        </button>
                    </div>
                </div>
                <div class="item-details">
                    <strong>المزود:</strong> ${key.provider}<br>
                    <strong>المفتاح:</strong> ${'*'.repeat(20)}<br>
                    <strong>تاريخ الإنشاء:</strong> ${new Date(key.createdAt).toLocaleDateString('ar-SA')}<br>
                    <strong>عدد الاستخدامات:</strong> ${key.usage}
                </div>
            `;
            keysList.appendChild(keyElement);
        });
    }

    // File Management
    handleAddFile(e) {
        e.preventDefault();
        
        const fileData = {
            id: 'file_' + Date.now(),
            name: document.getElementById('fileName').value,
            type: document.getElementById('fileType').value,
            content: document.getElementById('fileContent').value,
            createdAt: new Date().toISOString()
        };
        
        this.files.push(fileData);
        this.saveData();
        this.renderFiles();
        this.hideModal('addFileModal');
        
        this.showNotification('تم إضافة الملف بنجاح!', 'success');
    }

    deleteFile(fileId) {
        if (confirm('هل أنت متأكد من حذف هذا الملف؟')) {
            this.files = this.files.filter(file => file.id !== fileId);
            this.saveData();
            this.renderFiles();
            this.showNotification('تم حذف الملف بنجاح!', 'success');
        }
    }

    renderFiles() {
        const filesList = document.getElementById('filesList');
        filesList.innerHTML = '';
        
        this.files.forEach(file => {
            const fileElement = document.createElement('div');
            fileElement.className = 'file-item';
            fileElement.innerHTML = `
                <div class="item-header">
                    <div class="item-title">
                        <i class="fas fa-file" style="margin-left: 8px;"></i>
                        ${file.name}
                    </div>
                    <div class="item-actions">
                        <button class="action-btn delete" onclick="app.deleteFile('${file.id}')">
                            <i class="fas fa-trash"></i> حذف
                        </button>
                    </div>
                </div>
                <div class="item-details">
                    <strong>النوع:</strong> ${file.type}<br>
                    <strong>تاريخ الإنشاء:</strong> ${new Date(file.createdAt).toLocaleDateString('ar-SA')}<br>
                    <strong>الحجم:</strong> ${file.content.length} حرف
                </div>
            `;
            filesList.appendChild(fileElement);
        });
    }

    // Conversation Management
    startNewChat() {
        this.currentConversation = {
            id: 'conv_' + Date.now(),
            title: 'محادثة جديدة',
            messages: [],
            createdAt: new Date().toISOString()
        };
        
        this.conversations.unshift(this.currentConversation);
        this.saveData();
        this.renderConversations();
        this.renderMessages();
        this.updateChatTitle();
        
        // Clear input
        document.getElementById('messageInput').value = '';
        document.getElementById('messageInput').style.height = 'auto';
    }

    loadConversation(conversationId) {
        this.currentConversation = this.conversations.find(conv => conv.id === conversationId);
        this.renderMessages();
        this.updateChatTitle();
        this.updateActiveConversation();
    }

    updateChatTitle() {
        const titleElement = document.getElementById('currentChatTitle');
        if (this.currentConversation) {
            titleElement.textContent = this.currentConversation.title;
        } else {
            titleElement.textContent = 'محادثة جديدة';
        }
    }

    updateActiveConversation() {
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.remove('active');
        });
        
        if (this.currentConversation) {
            const activeItem = document.querySelector(`[data-conversation-id="${this.currentConversation.id}"]`);
            if (activeItem) {
                activeItem.classList.add('active');
            }
        }
    }

    renderConversations() {
        const conversationsList = document.getElementById('conversationsList');
        conversationsList.innerHTML = '';
        
        this.conversations.forEach(conversation => {
            const conversationElement = document.createElement('div');
            conversationElement.className = 'conversation-item';
            conversationElement.setAttribute('data-conversation-id', conversation.id);
            conversationElement.addEventListener('click', () => this.loadConversation(conversation.id));
            
            const lastMessage = conversation.messages[conversation.messages.length - 1];
            const preview = lastMessage ? lastMessage.text.substring(0, 50) + '...' : 'بدون رسائل';
            
            conversationElement.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 4px;">${conversation.title}</div>
                <div style="font-size: 0.9rem; color: var(--text-secondary);">${preview}</div>
            `;
            
            conversationsList.appendChild(conversationElement);
        });
        
        this.updateActiveConversation();
    }

    renderMessages() {
        const messagesContainer = document.getElementById('messagesContainer');
        
        if (!this.currentConversation || this.currentConversation.messages.length === 0) {
            messagesContainer.innerHTML = `
                <div class="welcome-message">
                    <div class="welcome-icon">
                        <i class="fas fa-robot"></i>
                    </div>
                    <h2>مرحباً بك في ChatZEUS</h2>
                    <p>أنشئ وكلاء ذكاء اصطناعي واتركهم يتناقشون لحل مهامك!</p>
                </div>
            `;
            return;
        }
        
        messagesContainer.innerHTML = '';
        
        this.currentConversation.messages.forEach(message => {
            const messageElement = this.createMessageElement(message);
            messagesContainer.appendChild(messageElement);
        });
        
        this.scrollToBottom();
        this.highlightCode();
    }

    createMessageElement(message) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.sender === 'user' ? 'own' : ''}`;
        
        const avatar = message.sender === 'user' ? '👤' : this.getAgentAvatar(message.sender);
        const senderName = message.sender === 'user' ? 'أنت' : this.getAgentName(message.sender);
        
        messageElement.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-sender">${senderName}</span>
                    <span class="message-time">${this.formatTime(message.timestamp)}</span>
                </div>
                <div class="message-text">${this.formatMessageText(message.text)}</div>
            </div>
        `;
        
        return messageElement;
    }

    getAgentAvatar(agentId) {
        const agent = this.agents.find(a => a.id === agentId);
        return agent ? agent.avatar : '🤖';
    }

    getAgentName(agentId) {
        const agent = this.agents.find(a => a.id === agentId);
        return agent ? agent.name : 'وكيل مجهول';
    }

    formatTime(timestamp) {
        return new Date(timestamp).toLocaleTimeString('ar-SA', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatMessageText(text) {
        // Convert code blocks to proper format
        text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            const language = lang || 'text';
            return `<pre><code class="language-${language}">${this.escapeHtml(code)}</code></pre>`;
        });
        
        // Convert inline code
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Convert line breaks
        text = text.replace(/\n/g, '<br>');
        
        return text;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    highlightCode() {
        if (typeof Prism !== 'undefined') {
            Prism.highlightAll();
        }
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('messagesContainer');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Message Processing
    async sendMessage() {
        const input = document.getElementById('messageInput');
        const message = input.value.trim();
        
        if (!message || this.isProcessing) return;
        
        if (!this.currentConversation) {
            this.startNewChat();
        }
        
        // Add user message
        const userMessage = {
            sender: 'user',
            text: message,
            timestamp: new Date().toISOString()
        };
        
        this.currentConversation.messages.push(userMessage);
        this.currentConversation.title = message.substring(0, 30) + (message.length > 30 ? '...' : '');
        
        this.saveData();
        this.renderMessages();
        this.renderConversations();
        
        // Clear input
        input.value = '';
        input.style.height = 'auto';
        
        // Start agent conversation
        this.isProcessing = true;
        this.updateSendButton();
        
        try {
            await this.startAgentConversation(message);
        } catch (error) {
            console.error('Error in agent conversation:', error);
            this.showNotification('حدث خطأ في المحادثة', 'error');
        } finally {
            this.isProcessing = false;
            this.updateSendButton();
        }
    }

    updateSendButton() {
        const sendBtn = document.getElementById('sendBtn');
        const input = document.getElementById('messageInput');
        
        if (this.isProcessing) {
            sendBtn.disabled = true;
            sendBtn.innerHTML = '<div class="loading"></div>';
            input.disabled = true;
        } else {
            sendBtn.disabled = false;
            sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
            input.disabled = false;
        }
    }

    async startAgentConversation(userTask) {
        if (this.agents.length === 0) {
            this.addSystemMessage('لا توجد وكلاء متاحة. يرجى إضافة وكلاء من الإعدادات أولاً.');
            return;
        }
        
        if (this.apiKeys.length === 0) {
            this.addSystemMessage('لا توجد مفاتيح API متاحة. يرجى إضافة مفاتيح من الإعدادات أولاً.');
            return;
        }
        
        // Add system message
        this.addSystemMessage(`بدء مناقشة تلقائية بين الوكلاء لحل المهمة: "${userTask}"`);
        
        // Start real agent conversation
        await this.startRealAgentDiscussion(userTask);
        
        // Add final summary
        this.addSystemMessage('انتهت المناقشة. تم التوصل إلى نتيجة نهائية.');
    }

    async startRealAgentDiscussion(userTask) {
        const discussionSteps = [
            'تحليل المهمة وتحديد المتطلبات',
            'اقتراح حلول أولية',
            'مناقشة الحلول وتقييمها',
            'اختيار أفضل حل',
            'تطوير الحل بالتفصيل',
            'مراجعة النتيجة النهائية'
        ];
        
        for (let i = 0; i < discussionSteps.length; i++) {
            const step = discussionSteps[i];
            const agent = this.agents[i % this.agents.length];
            
            try {
                // Get real response from AI model
                const response = await this.getAIResponse(agent, step, userTask, discussionSteps.slice(0, i + 1));
                
                // Add agent message
                const agentMessage = {
                    sender: agent.id,
                    text: response,
                    timestamp: new Date().toISOString()
                };
                
                this.currentConversation.messages.push(agentMessage);
                this.renderMessages();
                this.saveData();
                
                // Small delay between responses
                await this.delay(500);
                
            } catch (error) {
                console.error(`Error getting response from ${agent.name}:`, error);
                
                // Fallback to generated response
                const fallbackResponse = this.generateAgentResponse(agent, step, userTask);
                const agentMessage = {
                    sender: agent.id,
                    text: fallbackResponse + '\n\n[ملاحظة: تم استخدام رد احتياطي بسبب خطأ في الاتصال]',
                    timestamp: new Date().toISOString()
                };
                
                this.currentConversation.messages.push(agentMessage);
                this.renderMessages();
                this.saveData();
            }
        }
    }

    async getAIResponse(agent, step, userTask, previousSteps) {
        const apiKey = this.getNextApiKey(agent.model);
        if (!apiKey) {
            throw new Error(`لا يوجد مفتاح API متاح للنموذج: ${agent.model}`);
        }
        
        const prompt = this.buildAgentPrompt(agent, step, userTask, previousSteps);
        
        try {
            if (agent.model.startsWith('gpt')) {
                return await this.callOpenAI(apiKey.key, agent.model, prompt);
            } else if (agent.model.startsWith('claude')) {
                return await this.callAnthropic(apiKey.key, agent.model, prompt);
            } else if (agent.model.startsWith('gemini')) {
                return await this.callGoogle(apiKey.key, agent.model, prompt);
            } else {
                throw new Error(`نموذج غير معروف: ${agent.model}`);
            }
        } catch (error) {
            // Update API key usage
            apiKey.usage++;
            this.saveData();
            throw error;
        }
    }
    
    getNextApiKey(modelType) {
        let availableKeys = [];
        
        if (modelType.startsWith('gpt')) {
            availableKeys = this.apiKeys.filter(key => key.provider === 'openai');
        } else if (modelType.startsWith('claude')) {
            availableKeys = this.apiKeys.filter(key => key.provider === 'anthropic');
        } else if (modelType.startsWith('gemini')) {
            availableKeys = this.apiKeys.filter(key => key.provider === 'google');
        }
        
        if (availableKeys.length === 0) return null;
        
        // Round Robin selection
        const nextKey = availableKeys[this.currentKeyIndex % availableKeys.length];
        this.currentKeyIndex = (this.currentKeyIndex + 1) % availableKeys.length;
        
        return nextKey;
    }
    
    buildAgentPrompt(agent, step, userTask, previousSteps) {
        const context = previousSteps.length > 0 
            ? `\n\nالمناقشة السابقة:\n${previousSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`
            : '';
            
        return `أنت ${agent.name}، ${agent.role} متخصص في ${agent.persona}

المهمة: ${userTask}

الخطوة الحالية: ${step}

${context}

قم بالرد بناءً على تخصصك وشخصيتك. اكتب رداً مفصلاً ومفيداً باللغة العربية. إذا كنت تقدم كود، استخدم تنسيق markdown مع تمييز اللغة المناسبة.`;
    }
    
    async callOpenAI(apiKey, model, prompt) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 2000,
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            throw new Error(`OpenAI API Error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    }
    
    async callAnthropic(apiKey, model, prompt) {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: model,
                max_tokens: 2000,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            })
        });
        
        if (!response.ok) {
            throw new Error(`Anthropic API Error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.content[0].text;
    }
    
    async callGoogle(apiKey, model, prompt) {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: prompt
                            }
                        ]
                    }
                ],
                generationConfig: {
                    maxOutputTokens: 2000,
                    temperature: 0.7
                }
            })
        });
        
        if (!response.ok) {
            throw new Error(`Google API Error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }

    generateAgentResponse(agent, step, userTask) {
        const responses = {
            'تحليل المهمة وتحديد المتطلبات': `أنا ${agent.name}، سأبدأ بتحليل المهمة: "${userTask}". بناءً على تخصصي في ${agent.role}، أرى أننا نحتاج إلى...`,
            'اقتراح حلول أولية': `بناءً على التحليل، أقترح عدة حلول:\n1. الحل الأول: ...\n2. الحل الثاني: ...\n3. الحل الثالث: ...`,
            'مناقشة الحلول وتقييمها': `دعني أقيم الحلول المقترحة:\n- الحل الأول: مميزاته...\n- الحل الثاني: مميزاته...\n- الحل الثالث: مميزاته...`,
            'اختيار أفضل حل': `بعد التقييم الشامل، أعتقد أن الحل الأول هو الأفضل لأنه...`,
            'تطوير الحل بالتفصيل': `سأقوم بتطوير الحل المختار بالتفصيل:\n\n\`\`\`python\n# مثال على التنفيذ\ndef solve_problem():\n    # الكود هنا\n    pass\n\`\`\``,
            'مراجعة النتيجة النهائية': `بعد تطوير الحل، أرى أن النتيجة النهائية هي:\n\n**الخلاصة:**\n- تم حل المشكلة باستخدام...\n- النتيجة: ...\n- التوصيات: ...`
        };
        
        return responses[step] || `أنا ${agent.name}، أتعامل مع: ${step}`;
    }

    addSystemMessage(text) {
        const systemMessage = {
            sender: 'system',
            text: text,
            timestamp: new Date().toISOString()
        };
        
        this.currentConversation.messages.push(systemMessage);
        this.renderMessages();
        this.saveData();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Utility Functions
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--bg-primary);
            color: var(--text-primary);
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: var(--shadow);
            border: 1px solid var(--border-color);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the application
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new ChatZEUS();
});

// Add notification animations to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);