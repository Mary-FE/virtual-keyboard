'use strict';

import json from "../json/keyboard.json" assert { type: "json" };

export function drawKeyboard() {
    let parent = document.createElement("div");
    parent.classList.add('vk-keyboard');

    for (let row in json) {
        console.log(json[row]);
        let div = document.createElement(json[row]['tag']);
        div.classList.add(json[row]['cls']);

        for (let key in json[row]['buttons']) {
            let span = document.createElement(json[row]['buttons'][key]['tag']);
            span.className = json[row]['buttons'][key]['cls'].join(' ');
            span.innerHTML = json[row]['buttons'][key]['text'];

            div.append(span);
        }

        parent.append(div);
    }

    return parent;
}
