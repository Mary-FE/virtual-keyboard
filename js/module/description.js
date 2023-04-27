'use strict';

import json from "../json/description.json" assert { type: "json" };

export function drawDescription() {
    let parent = document.createElement("div");

    parent.classList.add('vk-description');

    for (let key in json) {
        let element = document.createElement(json[key]['tag']);
        element.innerHTML = json[key]['value'];

        if (json[key]['attr']) {
            for (const [prop, value] of Object.entries(json[key]['attr'])) {
                element.setAttribute(prop, value);
            }
        }
        
        parent.append(element);
    }

    return parent;
}