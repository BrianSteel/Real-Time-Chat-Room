/* ============================================================
   Onboarding Tutorial — Chat Page Steps
   Depends on: /onboarding.css  (styles)
               /onboarding.js   (startOnboarding engine)
   ============================================================ */

(function () {
    'use strict';

    var CHAT_STORAGE_KEY = 'chat_onboarding_done';

    /* Only show if the home page primed it (value is 'false')
       or if it has never been set at all (first-ever visit direct
       to chat, which shouldn't happen normally but is handled
       gracefully here). */
    var stored = localStorage.getItem(CHAT_STORAGE_KEY);
    if (stored === 'true') return;   /* already seen — bail out */

    var chatSteps = [
        {
            selector:    '#messages-window-wrapper',
            title:       'Chat Window',
            description: 'Messages from everyone in the room appear here.'
        },
        {
            selector:    '#user-list-wrapper',
            title:       'Active Users',
            description: 'Everyone currently in this room.'
        },
        {
            selector:    '#message',
            title:       'Send a Message',
            description: 'Type here and hit Submit or press Enter.'
        },
        {
            selector:    '#text-msg-btn',
            title:       'Submit',
            description: 'Send your message to the room.'
        },
        {
            selector:    '.return-btn',
            title:       'Leave Room',
            description: 'Click Return to go back to the room list.',
            onLeave: function () {
                localStorage.setItem(CHAT_STORAGE_KEY, 'true');
            }
        }
    ];

    function _initChat() {
        if (typeof startOnboarding !== 'function') {
            console.warn('chat-onboarding: startOnboarding engine not found.');
            return;
        }

        // Mark done immediately so returning to chat never reruns it
        localStorage.setItem(CHAT_STORAGE_KEY, 'true');
        startOnboarding(chatSteps, function () {});
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', _initChat);
    } else {
        _initChat();
    }

})();
