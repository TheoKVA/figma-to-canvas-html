/* === code.js === */
// Main plugin logic (runs in Figma editor)

/*
    [Figma Editor]
        |
        |---> plugin-code.js (runs in Figma's backend context)
        |<---> ui.html (runs in a browser-like sandboxed iframe, similar to a frontend)
*/

// ---------------
// 🚀 START UI 🚀
// ---------------
figma.showUI(__html__, { width: 300, height: 400 });
console.clear();
console.log('🤖 Figma to <canvas> HTML backend');


// -----------------------
// ✉️ SEND A SMS TO UI ✉️
// -----------------------
function postMessage(config) {
    figma.ui.postMessage(config);
}


// ---------------------------
// 📥 RECEIVED SMS FROM UI 📥
// ---------------------------
figma.ui.onmessage = async (msg) => {
    const { type } = msg;
    console.log('🤖 > NEW MESSAGE', type);

    if (type === 'export-selection') {
        const selection = figma.currentPage.selection;
        if (!selection.length) {
            postMessage({ type, message: 'error', data: 'Nothing selected.' });
        }
        else {
            // Generate export code from selected nodes
            const result = exportToCanvas(selection);
            postMessage({ type, message: 'success', data: result });
        }
    }

    if (type === 'selection-update') {
        onSelectionUpdate();
    }

    // We can add more types here like 'get-fonts', 'settings-save', etc.
};






function exportToCanvas(nodes) {
    let jsCode = 'const canvas = document.getElementById("myCanvas");\n';
    jsCode += 'const ctx = canvas.getContext("2d");\n';

    for (const node of nodes) {
        jsCode += exportNode(node);
    }

    return jsCode;
}

function exportNode(node) {
    if (node.type === 'RECTANGLE') {
        const { x, y, width, height } = node;
        const fill = node.fills[0];

        let code = `ctx.fillStyle = "${fill.color ? rgbToCss(fill.color) : '#000'}";\n`;
        code += `ctx.fillRect(${x}, ${y}, ${width}, ${height});\n`;
        return code;
    } else if (node.type === 'TEXT') {
        return `// TEXT: "${node.characters}" at (${node.x}, ${node.y})\n`;
    }
    return `// Unsupported node type: ${node.type}\n`;
}

function rgbToCss(color) {
    return `rgb(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)})`;
}



// ==============
// USER SELECTION
// ==============

figma.on("selectionchange", () => onSelectionUpdate());

function onSelectionUpdate() {
    const selection = figma.currentPage.selection;
    if (selection.length === 0) {
        console.log("🤖 > NO SELECTION");
        postMessage({ type: 'selection-update', message: 'NO SELECTION' });
    }
    else {
        console.log("🤖 > SELECTION");
        for (const node of selection) {
            logNodeStructure(node);
        }
        postMessage({ type: 'selection-update', message: 'SELECTION' });
    }
}

function logNodeStructure(node, depth = 0) {
    // console.log() the structure
    const indent = "  ".repeat(depth);
    console.log(`${indent}- ${node.type} (name: ${node.name})`);
    if ("children" in node) {
        for (const child of node.children) {
            logNodeStructure(child, depth + 1);
        }
    }
}