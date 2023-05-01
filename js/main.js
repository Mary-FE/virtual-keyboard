import Description from "./json/description.json" assert { type: "json" };
import Keyboard_EN from "./json/keyboard-en.json" assert { type: "json" };
import Keyboard_RU from "./json/keyboard-ru.json" assert { type: "json" };

let VKApp = {
    controlButtons: [
        'Tab', 'CapsLock', 'Shift', 'Control', 'Meta', 
        'Alt', 'Backspace', 'Delete', 'Enter'
    ],

    focusPos: 0,
    saveFocus: false,

    init() {
        // Create default wrapper for description & keyboard blocks
        let vk_wrapper      = this.createHTML('section', 'virtual-keyboard'),
            vk_description  = this.createHTML('div', 'vk-description'),
            vk_keyboard_en  = this.createHTML('div', 'vk-keyboard vk-en'),
            vk_keyboard_ru  = this.createHTML('div', 'vk-keyboard vk-ru');

        // Insert created HTML into DOM
        document.body.append(vk_wrapper);
        vk_wrapper.append(vk_description);
        vk_wrapper.append(vk_keyboard_en);
        vk_wrapper.append(vk_keyboard_ru);

        // Create & append description
        this.appendFromJSON(vk_description, Description);

        // Create & append keyboard
        this.appendFromJSON(vk_keyboard_en, Keyboard_EN, 'buttons');
        this.appendFromJSON(vk_keyboard_ru, Keyboard_RU, 'buttons');

        // Visible keyboard
        this.setKeyboardLang();

        // Initialize all events
        this.initEvent();
    },

    // Save Language logic
    // =============================================
    setKeyboardLang() {
        if (!localStorage.getItem('app-lang')) {
            localStorage.setItem('app-lang', 'en');
        }

        let keyboards = Array.from(document.querySelectorAll('.vk-keyboard'));
        keyboards.forEach((item) => item.classList.add('hidden'));
        keyboards.forEach((item) => {
            if (item.classList.contains(`vk-${localStorage.getItem('app-lang')}`)) {
                item.classList.remove('hidden');
            }
        });
    },


    // [App Events section]
    // =============================================

    initEvent() {
        const textarea = document.querySelector('textarea');

        this.eventTextArea(textarea);
        this.eventKeyDownCommon(textarea);
        this.eventKeyDownSpecial(textarea);
        this.eventKeyUpGlobal();
    },

    // Additional events for texrarea
    eventTextArea(textarea) {
        textarea.addEventListener("focus", (e) => {
            setTimeout(() => {
                if (this.saveFocus) {
                    e.target.selectionStart = this.focusPos;
                    e.target.selectionEnd = this.focusPos;
                }

                this.saveFocus = false;
                this.focusPos = e.target.selectionStart;
            }, 0);
        });

        textarea.addEventListener("click", () => {
            this.reFocus(textarea);
        });
    },

    // Event for common pressing on keyboard
    eventKeyDownCommon(textarea) {
        document.addEventListener("keydown", (e) => {
            e.preventDefault();

            if (!this.controlButtons.includes(e.key)) {
                // check pressing 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'ArrowDown'
                if (e.key.includes('Arrow')) {
                    if (e.key.includes('Up'))    textarea.value += '▲';
                    if (e.key.includes('Right')) textarea.value += '►';
                    if (e.key.includes('Down'))  textarea.value += '▼';
                    if (e.key.includes('Left'))  textarea.value += '◄';
                    // this.focusPos++;
                } else {
                    let btn = document.querySelector(`.vk-keyboard:not(.hidden) [keycode="${e.keyCode}"]`);
                    this.insertSpecialSymbol(textarea, 0, btn.textContent);
                }

                this.focusPos++;
            }
        });
    },

    // Event for special key pressing
    eventKeyDownSpecial(textarea) {
        document.addEventListener("keydown", (e) => {
            e.preventDefault();

            const BUTTON = document.querySelectorAll(`.vk-keyboard:not(.hidden) [keycode="${e.keyCode}"]`);
            const CAPS = document.querySelectorAll('.capslock');

            // Fix active left/right Ctrl, Alt, Shift pressing
            BUTTON.length > 1 && e.code.includes('Right')
                ? BUTTON[1].classList.add('active')
                : BUTTON[0].classList.add('active');

            // Emulation specials buttons pressing
            if (this.controlButtons.includes(e.key)) {
                if (e.key === 'Enter') this.insertSpecialSymbol(textarea, 1, '\n');
                if (e.key === 'Tab') this.insertSpecialSymbol(textarea, 4, '    ');
                if (e.key === 'Backspace') this.removeSpecialSymbol(textarea, 1);
                if (e.key === 'Delete') this.removeSpecialSymbol(textarea);

                if (e.key === 'Shift') {
                    this.changeKeyRegister('register');
                    this.changeKeyRegister('capslock');

                    BUTTON.length > 1 && e.code.includes('Right')
                        ? BUTTON[1].classList.add('shift-active')
                        : BUTTON[0].classList.add('shift-active');
                }

                if (e.key === 'CapsLock') {
                    CAPS[0].classList.toggle('caps-active');
                    CAPS[1].classList.toggle('caps-active');
                    this.changeKeyRegister('capslock');
                }

                // Change Language
                if (e.key === 'Alt' && e.ctrlKey) {
                    if (localStorage.getItem('app-lang') === 'en') {
                        localStorage.setItem('app-lang', 'ru');
                    } else {
                        localStorage.setItem('app-lang', 'en');
                    }

                    this.setKeyboardLang();
                }
            }
        });
    },

    // Need for clear button active state
    eventKeyUpGlobal() {
        const CAPS = document.querySelector('.vk-keyboard:not(.hidden) .capslock');

        document.addEventListener("keyup", (e) => {
            this.clearActiveState();
            
            if (!CAPS.classList.contains('caps-active') && e.key === 'CapsLock') this.changeKeyRegister('capslock', false);
            if (e.key === 'Shift') this.clearShiftState();
        });
    },

    changeKeyRegister(register, flag = true) {
        let allButtons = Array.from(document.querySelectorAll(`[${register}]`));

        if (flag) {
            allButtons.forEach((btn) => btn.innerHTML = btn.getAttribute(`${register}`));
        } else {
            allButtons.forEach((btn) => btn.innerHTML = btn.getAttribute('defaultreg'));
        }
    },

    // Emulate keypress events by click
    eventClickButton(node) {
        node.addEventListener('mousedown', (e) => {
            let key = '',
                code = '',
                ctrlKey = true;

            if (e.target.textContent === 'Del') key = 'Delete';
            if (e.target.textContent === 'Ctrl') key = 'Control';
            if (e.target.textContent === 'Win') key = 'Meta';
            if (e.target.classList.contains('right')) code = 'Right';
            if (e.target.textContent === 'Alt') ctrlKey = false;

            document.dispatchEvent(new KeyboardEvent('keydown', { 
                'key': key ? key : e.target.textContent, 
                'keyCode': e.target.getAttribute('keycode'),
                'code': code ? code : '',
                'ctrlKey': ctrlKey 
            }));
        });

        node.addEventListener('mouseup', (e) => {
            if (e.target.textContent === 'Shift') this.clearShiftState();
            this.clearActiveState();
        });
    },


    // Create & append DOM
    // =============================================

    /**
     * @param {String} tag 
     * @param {String} className 
     * @param {String / HTML} html 
     * @param {Object} attributes 
     * 
     * @returns Node Element
     */
    createHTML(tag, className, html, attributes) {
        const NODE = document.createElement(tag);

        NODE.className = className ? className : '';
        NODE.innerHTML = html ? html : '';

        if (attributes) {
            for (let [prop, value] of Object.entries(attributes)) {
                NODE.setAttribute(prop, value);
            }
        }

        return NODE;
    },

    /**
     * @param {DOM Element} parent 
     * @param {Object} JSON 
     * @param {String} childKey 
     * @param {Boolean} clickEnable 
     */
    appendFromJSON(parent, JSON, childKey, clickEnable) {
        for (let key in JSON) {
            let nodeTag     = JSON[key]['tag'],
                nodeClass   = JSON[key]['cls']?.join(' '),
                nodeText    = JSON[key]['text'],
                nodeAttr    = JSON[key]['attr'],
                nodeChild   = childKey ? JSON[key][childKey] : null,
                node        = this.createHTML(nodeTag, nodeClass, nodeText, nodeAttr);

            if (clickEnable) this.eventClickButton(node);
            if (nodeChild)  this.appendFromJSON(node, nodeChild, null, true);

            parent.append(node);
        }
    },


    // Helpers
    // =============================================

    clearActiveState() {
        const BUTTONS = Array.from(document.querySelectorAll('.active'));
        BUTTONS.forEach((btn) => btn.classList.remove('active'));
    },

    /**
     * @param {DOM Element} textarea 
     * @description [Helper]: trigger refoucs textarea
     */
    reFocus(textarea) {
        document.querySelector('input[type="text"]').focus();
        textarea.focus();
    },

    /**
     * @param {DOM Element} textarea 
     * @param {Number} shift 
     * @param {String} insert 
     * @description [Helper]: get & insert special symbol
     */
    insertSpecialSymbol(textarea, shift, insert) {
        const TEXT = textarea.value.split('');

        if (TEXT.length) {
            TEXT[this.focusPos - 1] += insert;
            textarea.value = TEXT.join('');
        } else {
            textarea.value += insert;
        }
        
        this.focusPos += shift;
        this.saveFocus = true;
        this.reFocus(textarea);
    },

    removeSpecialSymbol(textarea, shift = 0) {
        textarea.focus();

        setTimeout(() => {
            textarea.value = textarea.value.split('')
                .filter((v, index) => index !== this.focusPos - shift)
                .join('');

            this.focusPos = this.focusPos - shift;
            this.saveFocus = true;
            this.reFocus(textarea);
        }, 10);
    },

    clearShiftState() {
        this.changeKeyRegister('register', false);
        this.changeKeyRegister('capslock', false);

        let shift = Array.from(document.querySelectorAll('.shift-active'));
        shift.forEach((item) => item.classList.remove('shift-active'));
    }
}

VKApp.init();
