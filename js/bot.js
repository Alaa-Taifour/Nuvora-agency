/* ============================================================
   NUVORA — AI CHAT BOT
   Floating chat widget powered by Claude API
   Conversations saved to Supabase
   ============================================================ */

(function () {
  'use strict';

  // ─── Config ───────────────────────────────────────────────
  const BOT_CONFIG = {
    name: 'Nuvora AI',
    avatar: 'N',
    welcomeMessage: "Hi! I'm Nuvora's AI assistant. I can help you learn about our services, pricing, and how we can help grow your business. What are you looking for?",
    typingDelay: 800,
  };

  const SYSTEM_PROMPT = `You are the AI assistant for Nuvora Agency — a full-service digital agency based in Syria and Dubai, serving clients worldwide.

Your role is to help website visitors understand our services, answer questions, and collect their contact information when they're ready to start a project.

## About Nuvora
- Founded by Alaa Taifour (Agency Director)
- Team: Alaa (Director), Nader (Creative Lead), Saif (Outreach & Marketing), Ammar Shalghin (Social Media & Contracts)
- Tagline: "We Build What's Next"
- Contact: latyfwr10@gmail.com | WhatsApp: +971562935388

## Services & Pricing
1. AI & Automation — From $150 (chatbots, workflow automation, AI integrations)
2. Web Design & Development — From $100 (landing pages, full websites, SEO)
3. Digital Marketing — From $120/mo (social media management, content calendars)
4. Content Creation — From $60 (blog posts, social content, brand storytelling)
5. CV & Resume Design — From $25 (ATS-friendly CVs, cover letters)
6. Graphic Design — From $40 (logos, brand kits, social media graphics)

## Pricing Tiers
- Basic / Standard / Premium for each service
- Bundle deals available
- 50% deposit required to start, 50% on delivery
- Payments via Payoneer, Wise, USDT, Bank Transfer

## Guidelines
- Be friendly, professional, and concise
- Always respond in the same language the user writes in (Arabic or English)
- If asked about pricing, give ranges and suggest they contact us for a custom quote
- If the user wants to start a project, ask for: their name, email/WhatsApp, and project description
- Keep responses SHORT — 2-4 sentences max unless they ask for details
- Don't make up information not listed above
- If you don't know something, say "I'll connect you with Alaa directly for that"`;

  let sessionId = null;
  let conversationHistory = [];
  let isOpen = false;
  let isTyping = false;

  // ─── Initialize ───────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    sessionId = getOrCreateSession();
    injectBotStyles();
    createBotWidget();
    setTimeout(showWelcomePulse, 3000);
  });

  // ─── Session management ───────────────────────────────────
  function getOrCreateSession() {
    let id = sessionStorage.getItem('nuvora_bot_session');
    if (!id) {
      id = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('nuvora_bot_session', id);
    }
    return id;
  }

  // ─── Create widget HTML ───────────────────────────────────
  function createBotWidget() {
    const widget = document.createElement('div');
    widget.id = 'nuvora-bot';
    widget.innerHTML = `
      <!-- Toggle Button -->
      <button id="bot-toggle" aria-label="Open AI Chat">
        <div class="bot-toggle-icon bot-icon-chat">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div class="bot-toggle-icon bot-icon-close" style="display:none">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </div>
        <div class="bot-pulse"></div>
      </button>

      <!-- Chat Window -->
      <div id="bot-window" style="display:none">
        <!-- Header -->
        <div class="bot-header">
          <div class="bot-header-avatar">${BOT_CONFIG.avatar}</div>
          <div class="bot-header-info">
            <div class="bot-header-name">${BOT_CONFIG.name}</div>
            <div class="bot-header-status">
              <span class="bot-status-dot"></span>
              Online — replies instantly
            </div>
          </div>
          <button class="bot-close-btn" id="bot-close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Messages -->
        <div class="bot-messages" id="bot-messages"></div>

        <!-- Input -->
        <div class="bot-input-area">
          <div class="bot-quick-replies" id="bot-quick-replies">
            <button class="bot-quick-btn" data-msg="What services do you offer?">Services</button>
            <button class="bot-quick-btn" data-msg="What are your prices?">Pricing</button>
            <button class="bot-quick-btn" data-msg="I want to start a project">Start Project</button>
          </div>
          <div class="bot-input-row">
            <textarea id="bot-input" placeholder="Type your message..." rows="1"></textarea>
            <button id="bot-send" aria-label="Send">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                <path d="m22 2-7 20-4-9-9-4 20-7z"/>
                <path d="M22 2 11 13"/>
              </svg>
            </button>
          </div>
          <div class="bot-footer-note">Powered by Claude AI · Nuvora Agency</div>
        </div>
      </div>
    `;
    document.body.appendChild(widget);

    // Events
    document.getElementById('bot-toggle').addEventListener('click', toggleBot);
    document.getElementById('bot-close').addEventListener('click', closeBot);
    document.getElementById('bot-send').addEventListener('click', sendMessage);
    document.getElementById('bot-input').addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
    document.querySelectorAll('.bot-quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('bot-quick-replies').style.display = 'none';
        sendMessage(btn.dataset.msg);
      });
    });

    // Add welcome message
    addMessage('assistant', BOT_CONFIG.welcomeMessage);
  }

  // ─── Toggle / Open / Close ────────────────────────────────
  function toggleBot() {
    isOpen ? closeBot() : openBot();
  }

  function openBot() {
    isOpen = true;
    document.getElementById('bot-window').style.display = 'flex';
    document.querySelector('.bot-icon-chat').style.display = 'none';
    document.querySelector('.bot-icon-close').style.display = 'flex';
    document.querySelector('.bot-pulse').style.display = 'none';
    document.getElementById('bot-input').focus();
  }

  function closeBot() {
    isOpen = false;
    document.getElementById('bot-window').style.display = 'none';
    document.querySelector('.bot-icon-chat').style.display = 'flex';
    document.querySelector('.bot-icon-close').style.display = 'none';
  }

  function showWelcomePulse() {
    if (!isOpen) {
      document.querySelector('.bot-pulse').style.display = 'block';
    }
  }

  // ─── Add message to UI ────────────────────────────────────
  function addMessage(role, content) {
    const messages = document.getElementById('bot-messages');
    const div = document.createElement('div');
    div.className = `bot-message bot-message-${role}`;
    div.innerHTML = `
      ${role === 'assistant' ? `<div class="bot-msg-avatar">${BOT_CONFIG.avatar}</div>` : ''}
      <div class="bot-msg-bubble">${escapeHtml(content).replace(/\n/g, '<br>')}</div>
    `;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  // ─── Typing indicator ─────────────────────────────────────
  function showTyping() {
    const messages = document.getElementById('bot-messages');
    const div = document.createElement('div');
    div.className = 'bot-message bot-message-assistant bot-typing-indicator';
    div.id = 'bot-typing';
    div.innerHTML = `
      <div class="bot-msg-avatar">${BOT_CONFIG.avatar}</div>
      <div class="bot-msg-bubble">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    `;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function hideTyping() {
    document.getElementById('bot-typing')?.remove();
  }

  // ─── Send message ─────────────────────────────────────────
  async function sendMessage(text) {
    const input = document.getElementById('bot-input');
    const content = text || input.value.trim();
    if (!content || isTyping) return;

    input.value = '';
    input.style.height = 'auto';

    // Add user message
    addMessage('user', content);
    conversationHistory.push({ role: 'user', content });

    // Save to Supabase
    if (typeof supabase !== 'undefined') {
      supabase.insert('bot_conversations', {
        session_id: sessionId,
        role: 'user',
        content
      });
    }

    // Show typing
    isTyping = true;
    showTyping();

    try {
      const reply = await callClaudeAPI(content);
      hideTyping();
      addMessage('assistant', reply);
      conversationHistory.push({ role: 'assistant', content: reply });

      // Save bot reply to Supabase
      if (typeof supabase !== 'undefined') {
        supabase.insert('bot_conversations', {
          session_id: sessionId,
          role: 'assistant',
          content: reply
        });
      }
    } catch (err) {
      hideTyping();
      addMessage('assistant', "Sorry, I'm having a connection issue. Please reach us directly on WhatsApp: +971 562 935 388");
    }

    isTyping = false;
  }

  // ─── Call Claude API ──────────────────────────────────────
  async function callClaudeAPI(userMessage) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: conversationHistory.slice(-10) // Last 10 messages for context
      })
    });

    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    return data.content[0]?.text || "I couldn't process that. Please contact us directly.";
  }

  // ─── Escape HTML ──────────────────────────────────────────
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ─── Inject styles ────────────────────────────────────────
  function injectBotStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* ── Bot Widget ── */
      #nuvora-bot {
        position: fixed; bottom: 2rem; right: 2rem;
        z-index: 1000; font-family: var(--font-body, 'DM Sans', sans-serif);
      }

      /* Toggle Button */
      #bot-toggle {
        width: 60px; height: 60px; border-radius: 50%;
        background: linear-gradient(135deg, #7B2FBE, #00D4FF);
        border: none; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 4px 30px rgba(123,47,190,0.5);
        transition: transform 0.3s, box-shadow 0.3s;
        position: relative;
        color: #F4F6F9;
      }
      #bot-toggle:hover { transform: scale(1.08); box-shadow: 0 8px 40px rgba(123,47,190,0.6); }
      .bot-toggle-icon { display: flex; align-items: center; justify-content: center; }
      .bot-toggle-icon svg { width: 26px; height: 26px; }

      .bot-pulse {
        position: absolute; top: -3px; right: -3px;
        width: 16px; height: 16px; border-radius: 50%;
        background: #00D4FF;
        animation: botPulse 2s ease-in-out infinite;
        display: none;
      }
      @keyframes botPulse {
        0%,100%{transform:scale(1);opacity:1}
        50%{transform:scale(1.4);opacity:0.7}
      }

      /* Chat Window */
      #bot-window {
        position: absolute; bottom: 75px; right: 0;
        width: 360px; max-height: 520px;
        background: #0D1B2A;
        border: 1px solid rgba(0,212,255,0.15);
        border-radius: 16px;
        flex-direction: column;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(123,47,190,0.1);
        animation: botOpen 0.3s cubic-bezier(0.16,1,0.3,1) forwards;
      }
      @keyframes botOpen {
        from{opacity:0;transform:translateY(20px) scale(0.95)}
        to{opacity:1;transform:translateY(0) scale(1)}
      }

      @media (max-width: 480px) {
        #bot-window {
          position: fixed; bottom: 0; right: 0; left: 0;
          width: 100%; border-radius: 16px 16px 0 0;
          max-height: 70vh;
        }
        #nuvora-bot { bottom: 1rem; right: 1rem; }
      }

      /* Header */
      .bot-header {
        display: flex; align-items: center; gap: 0.8rem;
        padding: 1rem 1.2rem;
        background: linear-gradient(135deg, rgba(123,47,190,0.15), rgba(0,212,255,0.08));
        border-bottom: 1px solid rgba(255,255,255,0.06);
        flex-shrink: 0;
      }
      .bot-header-avatar {
        width: 40px; height: 40px; border-radius: 50%;
        background: linear-gradient(135deg, #7B2FBE, #00D4FF);
        display: flex; align-items: center; justify-content: center;
        font-family: 'Syne', sans-serif; font-weight: 800;
        font-size: 1rem; color: #0D1B2A; flex-shrink: 0;
      }
      .bot-header-info { flex: 1; }
      .bot-header-name {
        font-family: 'Syne', sans-serif; font-weight: 700;
        font-size: 0.9rem; color: #F4F6F9;
      }
      .bot-header-status {
        font-size: 0.7rem; color: #8892A4;
        display: flex; align-items: center; gap: 0.4rem;
        margin-top: 0.15rem;
      }
      .bot-status-dot {
        width: 6px; height: 6px; border-radius: 50%;
        background: #00D4FF; animation: botPulse 2s infinite;
      }
      .bot-close-btn {
        background: none; border: none; cursor: pointer;
        color: #8892A4; padding: 4px;
        transition: color 0.2s;
      }
      .bot-close-btn:hover { color: #F4F6F9; }

      /* Messages */
      .bot-messages {
        flex: 1; overflow-y: auto; padding: 1rem;
        display: flex; flex-direction: column; gap: 0.8rem;
        scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent;
      }
      .bot-message {
        display: flex; align-items: flex-end; gap: 0.5rem;
        animation: msgIn 0.3s ease forwards;
      }
      @keyframes msgIn {
        from{opacity:0;transform:translateY(8px)}
        to{opacity:1;transform:translateY(0)}
      }
      .bot-message-user { flex-direction: row-reverse; }
      .bot-msg-avatar {
        width: 28px; height: 28px; border-radius: 50%;
        background: linear-gradient(135deg, #7B2FBE, #00D4FF);
        display: flex; align-items: center; justify-content: center;
        font-weight: 800; font-size: 0.7rem; color: #0D1B2A;
        flex-shrink: 0;
      }
      .bot-msg-bubble {
        max-width: 80%; padding: 0.7rem 0.9rem;
        border-radius: 12px; font-size: 0.85rem; line-height: 1.6;
      }
      .bot-message-assistant .bot-msg-bubble {
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.07);
        color: #b8c0ce;
        border-radius: 4px 12px 12px 12px;
      }
      .bot-message-user .bot-msg-bubble {
        background: linear-gradient(135deg, rgba(123,47,190,0.3), rgba(0,212,255,0.2));
        border: 1px solid rgba(0,212,255,0.15);
        color: #F4F6F9;
        border-radius: 12px 4px 12px 12px;
      }

      /* Typing dots */
      .bot-typing-indicator .bot-msg-bubble {
        display: flex; align-items: center; gap: 4px; padding: 0.8rem;
      }
      .typing-dot {
        width: 6px; height: 6px; border-radius: 50%;
        background: #8892A4;
        animation: typingBounce 1.2s infinite;
        display: inline-block;
      }
      .typing-dot:nth-child(2) { animation-delay: 0.2s; }
      .typing-dot:nth-child(3) { animation-delay: 0.4s; }
      @keyframes typingBounce {
        0%,60%,100%{transform:translateY(0)}
        30%{transform:translateY(-6px);background:#00D4FF}
      }

      /* Input */
      .bot-input-area {
        border-top: 1px solid rgba(255,255,255,0.06);
        padding: 0.8rem;
        flex-shrink: 0;
      }
      .bot-quick-replies {
        display: flex; gap: 0.4rem; flex-wrap: wrap;
        margin-bottom: 0.6rem;
      }
      .bot-quick-btn {
        padding: 0.3rem 0.8rem;
        border: 1px solid rgba(0,212,255,0.2);
        background: rgba(0,212,255,0.05);
        color: #00D4FF; border-radius: 100px;
        font-size: 0.72rem; cursor: pointer;
        font-family: 'JetBrains Mono', monospace;
        letter-spacing: 0.05em;
        transition: all 0.2s;
      }
      .bot-quick-btn:hover {
        background: rgba(0,212,255,0.1);
        border-color: #00D4FF;
      }
      .bot-input-row {
        display: flex; gap: 0.5rem; align-items: flex-end;
      }
      #bot-input {
        flex: 1; padding: 0.7rem 0.9rem;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.08);
        color: #F4F6F9; border-radius: 8px;
        font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
        outline: none; resize: none; max-height: 100px;
        transition: border-color 0.2s;
        line-height: 1.5;
      }
      #bot-input:focus { border-color: rgba(0,212,255,0.3); }
      #bot-input::placeholder { color: #8892A4; }
      #bot-send {
        width: 38px; height: 38px; flex-shrink: 0;
        background: linear-gradient(135deg, #7B2FBE, #00D4FF);
        border: none; border-radius: 8px; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        color: #F4F6F9; transition: transform 0.2s, box-shadow 0.2s;
        box-shadow: 0 2px 15px rgba(123,47,190,0.4);
      }
      #bot-send:hover { transform: scale(1.05); box-shadow: 0 4px 20px rgba(123,47,190,0.5); }
      .bot-footer-note {
        text-align: center; margin-top: 0.5rem;
        font-size: 0.6rem; color: rgba(136,146,164,0.5);
        font-family: 'JetBrains Mono', monospace; letter-spacing: 0.1em;
      }
    `;
    document.head.appendChild(style);
  }

})();
