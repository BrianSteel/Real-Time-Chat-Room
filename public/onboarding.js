/* ============================================================
   Onboarding Tutorial — Shared Engine + Home Page Steps
   ============================================================ */

(function () {
    'use strict';

    var _highlight = null;
    var _tooltip   = null;
    var _steps     = [];
    var _index     = 0;
    var _onDone    = null;

    function _createDOM() {
        if (document.getElementById('onboarding-highlight')) return;

        var hl = document.createElement('div');
        hl.id = 'onboarding-highlight';
        document.body.appendChild(hl);
        _highlight = hl;

        var tt = document.createElement('div');
        tt.id = 'onboarding-tooltip';
        tt.innerHTML =
            '<div id="onboarding-step-counter"></div>' +
            '<div id="onboarding-title"></div>'        +
            '<p   id="onboarding-description"></p>'   +
            '<div id="onboarding-buttons">'            +
            '  <button id="onboarding-skip-btn">Skip</button>' +
            '  <button id="onboarding-next-btn">Next</button>' +
            '</div>';
        document.body.appendChild(tt);
        _tooltip = tt;

        document.getElementById('onboarding-skip-btn').addEventListener('click', _dismiss);
        document.getElementById('onboarding-next-btn').addEventListener('click', _advance);
    }

    function _positionHighlight(el) {
        var r   = el.getBoundingClientRect();
        var pad = 4;
        _highlight.style.top    = (r.top    - pad) + 'px';
        _highlight.style.left   = (r.left   - pad) + 'px';
        _highlight.style.width  = (r.width  + pad * 2) + 'px';
        _highlight.style.height = (r.height + pad * 2) + 'px';
    }

    function _positionTooltip(el) {
        var r   = el.getBoundingClientRect();
        var pad = 4;
        var gap = 14;
        var vpH = window.innerHeight;
        var vpW = window.innerWidth;
        var ttW = 260;
        var ttH = _tooltip.offsetHeight || 150;

        var inBottomHalf = (r.top + r.height / 2) > vpH / 2;

        _tooltip.classList.remove('arrow-up', 'arrow-down', 'arrow-right');

        var top, left;

        if (inBottomHalf) {
            top = r.top - pad - gap - ttH;
            _tooltip.classList.add('arrow-down');
        } else {
            top = r.bottom + pad + gap;
            _tooltip.classList.add('arrow-up');
        }

        left = r.left - pad;

        if ((left + ttW) > (vpW - 16)) {
            left = r.right + pad - ttW;
            _tooltip.classList.add('arrow-right');
        }

        if (left < 8) left = 8;
        if (top  < 8) top  = 8;
        if (top + ttH > vpH - 8) top = vpH - ttH - 8;

        _tooltip.style.top  = top + 'px';
        _tooltip.style.left = left + 'px';
    }

    function _renderStep(i) {
        var step = _steps[i];
        var el = typeof step.selector === 'string'
            ? document.querySelector(step.selector)
            : step.selector;

        if (!el) { _advance(); return; }

        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        document.getElementById('onboarding-step-counter').textContent = (i + 1) + ' / ' + _steps.length;
        document.getElementById('onboarding-title').textContent       = step.title;
        document.getElementById('onboarding-description').textContent = step.description;
        document.getElementById('onboarding-next-btn').textContent    = (i === _steps.length - 1) ? 'Done' : 'Next';

        _tooltip.classList.remove('visible');

        setTimeout(function () {
            _positionHighlight(el);
            _positionTooltip(el);
            _highlight.classList.add('visible');
            _tooltip.classList.add('visible');
        }, 60);
    }

    function _runBeforeHook(step) {
        return new Promise(function (resolve) {
            if (typeof step.before === 'function') {
                step.before(resolve);
            } else {
                resolve();
            }
        });
    }

    function _advance() {
        var currentStep = _steps[_index];
        if (currentStep && typeof currentStep.onLeave === 'function') {
            currentStep.onLeave();
        }

        var nextIndex = _index + 1;
        if (nextIndex >= _steps.length) {
            _dismiss(true);
            return;
        }

        _index = nextIndex;
        _runBeforeHook(_steps[_index]).then(function () {
            _renderStep(_index);
        });
    }

    function _dismiss(done) {
        _highlight.classList.add('fading');
        _tooltip.classList.add('fading');

        setTimeout(function () {
            _highlight.classList.remove('visible', 'fading');
            _tooltip.classList.remove('visible', 'fading');
            if (typeof _onDone === 'function') _onDone(!!done);
        }, 280);
    }

    function startOnboarding(steps, onDone) {
        _createDOM();
        _steps  = steps;
        _index  = 0;
        _onDone = onDone || null;

        _runBeforeHook(_steps[0]).then(function () {
            _renderStep(0);
        });
    }

    window.startOnboarding = startOnboarding;


    /* ----------------------------------------------------------
       Home page steps
    ---------------------------------------------------------- */

    var HOME_STORAGE_KEY = 'home_onboarding_done';
    if (localStorage.getItem(HOME_STORAGE_KEY) === 'true') return;

    function _showJoinForm(resolve) {
        var form = document.getElementById('join-room-container');
        var list = document.getElementById('chat-list-container');
        if (form && list) {
            list.classList.add('display');
            form.classList.remove('display');
        }
        setTimeout(resolve, 120);
    }

    var homeSteps = [
        {
            selector:    '#chat-list-container',
            title:       'Active Rooms',
            description: 'These are rooms currently open. Click JOIN to enter one.'
        },
        {
            selector:    '.btn',
            title:       'Create a Room',
            description: 'Click + to create your own chat room.'
        },
        {
            selector:    'input[name="name"]',
            title:       'Your Name',
            description: 'Enter the name others will see you as.',
            before:      _showJoinForm
        },
        {
            selector:    '#room-name-input',
            title:       'Room Name',
            description: 'Give your room a name or enter an existing one.'
        },
        {
            selector:    '.submit-btn',
            title:       'Enter the Chat',
            description: 'Hit Scoop In when you\'re ready to join.',
            onLeave: function () {
                localStorage.setItem(HOME_STORAGE_KEY, 'true');
                localStorage.setItem('chat_onboarding_done', 'false');
            }
        }
    ];

    function _initHome() {
        // Mark done immediately so returning to this page never reruns it
        localStorage.setItem(HOME_STORAGE_KEY, 'true');
        startOnboarding(homeSteps, function () {});
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', _initHome);
    } else {
        _initHome();
    }

})();
