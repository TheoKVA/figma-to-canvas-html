/* === code.js === */
// Main plugin logic (runs in Figma editor)

/*
    [Figma Editor]
        |
        |---> code.js (runs in Figma's backend context)
        |<---> ui.html (runs in a browser-like sandboxed iframe, similar to a frontend)
*/

// ---------------
// 🚀 START UI 🚀
// ---------------
figma.showUI(__html__, { width: 400, height: 500 });
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
            try{
                const result = await exportSelection(selection);
                postMessage({ type, message: 'success', data: result });
            }
            catch(e) {
                console.error(e);
                console.error(e.message);
                console.error(e.stack);
            }
        }
    }

    if (type === 'selection-update') {
        onSelectionUpdate();
    }

    // We can add more types here like 'get-fonts', 'settings-save', etc.
};

let finalCode = '';

async function exportSelection(selection) {

    if (selection.length !== 1 || selection[0].type !== 'FRAME') {
        return 'Please select a single frame to export.';
    }

    // At the moment we only check the selection[0] and assume it is a frame
    // Later we will add support to groups and eclectic selection
    const frame = selection[0]
    console.log(frame);

    // Start fresh
    resetCode();
    console.log('1');

    addCode(`
        // ==========================
        // 🖌 DRAWING INSTRUCTIONS 🖌
        // ==========================

        (async () => {`, 0
    );
    console.log('2');

    addCode(`
        // Load the images from variable or a .json file
        const images = await loadImageData(imageData);
        // const images = await loadImageData('your-image-data.json');

        // Target <canvas>
        const canvas = document.getElementById("myCanvas");
        const ctx = canvas.getContext("2d");
        canvas.width = ${frame.width};
        canvas.height = ${frame.height};

        // ------------
        // INSTRUCTIONS
        // ------------

        // ${frame.name}
        // -----------------------`
    );

    console.log('starting radius');


    // We start with the round radius of the frame itself
    if (frame.topLeftRadius || frame.topRightRadius || frame.bottomLeftRadius || frame.bottomRightRadius) {
        let x = 0;
        let y = 0;
        addCode(`
        // ${frame.name} CornerRadius clip
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(${x + frame.topLeftRadius}, ${y});
        ctx.lineTo(${x + frame.width - frame.topRightRadius}, ${y});
        ctx.quadraticCurveTo(${x + frame.width}, ${y}, ${x + frame.width}, ${y + frame.topRightRadius});
        ctx.lineTo(${x + frame.width}, ${y + frame.height - frame.bottomRightRadius});
        ctx.quadraticCurveTo(${x + frame.width}, ${y + frame.height}, ${x + frame.width - frame.bottomRightRadius}, ${y + frame.height});
        ctx.lineTo(${x + frame.bottomLeftRadius}, ${y + frame.height});
        ctx.quadraticCurveTo(${x}, ${y + frame.height}, ${x}, ${y + frame.height - frame.bottomLeftRadius});
        ctx.lineTo(${x}, ${y + frame.topLeftRadius});
        ctx.quadraticCurveTo(${x}, ${y}, ${x + frame.topLeftRadius}, ${y});
        ctx.closePath();
        ctx.clip();`);
    }

    console.log('starting fills');


    // Then we do all the fills
    if(frame.fills.length > 0) {
        addCode(`
            // ${frame.name} Fills
            const frameFill = document.createElement('canvas');
            frameFill.width = ${frame.width};
            frameFill.height = ${frame.height};
            const frameFillCtx = frameFill.getContext('2d');`
        );

        for (let i=0; i<frame.fills.length; i++) {
            addCode(`
                // ${frame.name} Fill #${i}`
            );
            
            const fill = frame.fills[i];
            if (fill.type === 'SOLID' && fill.opacity === 1 && fill.blendMode === 'NORMAL') {
                const color = solidPaintToCanvasColor(fill);
                addCode(`
                    frameFillCtx.fillStyle = '${color}';
                    frameFillCtx.fillRect(0, 0, ${frame.width}, ${frame.height});`
                );
            }

            else {
                // Composite on an offscreen canvas
                const id = `frameFill${i}`;
                addCode(`
                    const ${id} = document.createElement('canvas');
                    ${id}.width = ${frame.width};
                    ${id}.height = ${frame.height};
                    const ${id}Ctx = ${id}.getContext('2d');`
                );

                if (fill.type === 'SOLID') {
                    const color = solidPaintToCanvasColor(fill);
                    addCode(`
                        ${id}Ctx.fillStyle = '${color}';
                        ${id}Ctx.globalAlpha = ${fill.opacity !== undefined ? fill.opacity : 1};
                        ${id}Ctx.fillRect(0, 0, ${frame.width}, ${frame.height});`
                    );
                }
                // TODO: add gradient/image support

                
                    // frameFillCtx.globalAlpha = ${opacity};
                    // frameFillCtx.globalCompositeOperation = '${blendMode.toLowerCase()}';
                addCode(`
                    frameFillCtx.save();
                    frameFillCtx.drawImage(${id}, 0, 0);
                    frameFillCtx.restore();`
                );
            }
        }

        // We draw the fills on the canvas
        addCode(`
            ctx.drawImage(frameFillCtx, 0, 0);`
        );

    }

    console.log('fills ok');


    console.log(finalCode);

    return finalCode;
}



function getAbsolutePosition(node) {
    const transform = node.absoluteTransform;
    const x = transform[0][2];
    const y = transform[1][2];
    return { x, y };
}

function solidPaintToCanvasColor(paint) {
    const r = Math.round(paint.color.r * 255);
    const g = Math.round(paint.color.g * 255);
    const b = Math.round(paint.color.b * 255);
    const a = paint.opacity !== undefined ? paint.opacity : 1;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}




// Helper function to add code to the finalCode
function resetCode() {
    finalCode = ''
}
function addCode(text, indent = 1) {
    const lines = text.split('\n');
    const indentStr = '    '.repeat(indent);
    for (const line of lines) {
        finalCode += indentStr + line.trimEnd() + '\n';
    }
}



async function exportToCanvas_old(nodes) {

    const children = frame.children
        .filter(node => node.visible)

    // node.type === 'RECTANGLE'
    for (const rect of children) {
        const { x, y } = getAbsolutePosition(rect);
        const width = rect.width;
        const height = rect.height;
        const opacity = rect.opacity !== undefined ? rect.opacity : 1;
        const blendMode = rect.blendMode || "NORMAL";

        const fills = rect.fills;
        if (!fills || fills.length === 0) continue;

        // If it's a simple solid fill, normal blend, full opacity
        if (fills.length === 1 && fills[0].type === 'SOLID' && opacity === 1 && blendMode === 'NORMAL') {
            const fill = fills[0];
            const color = solidPaintToCanvasColor(fill);
            output += `
ctx.fillStyle = '${color}';
ctx.fillRect(${x}, ${y}, ${width}, ${height});
`;
        } else {
            // Composite on an offscreen canvas
            const id = `tempCanvas_${rect.id.replace(/[^a-zA-Z0-9]/g, '')}`;
            output += `
const ${id} = document.createElement('canvas');
${id}.width = ${width};
${id}.height = ${height};
const ${id}Ctx = ${id}.getContext('2d');
`;

            for (const fill of fills) {
                if (fill.type === 'SOLID') {
                    const color = solidPaintToCanvasColor(fill);
                    output += `
${id}Ctx.fillStyle = '${color}';
${id}Ctx.globalAlpha = ${fill.opacity !== undefined ? fill.opacity : 1};
${id}Ctx.fillRect(0, 0, ${width}, ${height});
`;
                }
                // TODO: add gradient/image support
            }

            // Blend onto main canvas
            output += `
ctx.save();
ctx.globalAlpha = ${opacity};
ctx.globalCompositeOperation = '${blendMode.toLowerCase()}';
ctx.drawImage(${id}, ${x}, ${y});
ctx.restore();
`;
        }
    }

    console.log(output)
    return output;
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

// Helper to console.log() the structure, with its depth
function logNodeStructure(node, depth = 0) {
    const indent = "  ".repeat(depth);
    console.log(`${indent}- ${node.type} (name: ${node.name})`);
    if ("children" in node) {
        for (const child of node.children) {
            logNodeStructure(child, depth + 1);
        }
    }
}