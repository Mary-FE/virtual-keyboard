import { drawDescription } from './module/description.js';
import { drawKeyboard } from './module/keyboard.js';

// Create parent NODE for APP
let keyboard = document.createElement('section');

keyboard.classList.add('virtual-keyboard');
document.body.append(keyboard);

// Append Description
keyboard.append(drawDescription());

// Append Keyboard
keyboard.append(drawKeyboard());
