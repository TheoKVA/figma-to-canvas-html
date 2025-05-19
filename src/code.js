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
figma.showUI(__html__, { width: 400, height: 600 });
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
            try {
                const result = await exportSelection(selection);
                postMessage({ type, message: 'success', data: result });
            }
            catch (e) {
                console.error(e);
                console.error(e.message);
                console.error(e.stack);
            }
        }
    }

    if (type === 'selection-update') {
        onSelectionUpdate();
    }

    // We can add more types here
};





// ===============
// 🔥 MAIN CODE 🔥
// ===============

// Our main variables
let code, TOTAL_WIDTH, TOTAL_HEIGHT;
// This will collect base64 strings keyed by image hash or unique ID
const imageData = {};


async function exportSelection(selection) {

    if (selection.length !== 1 || selection[0].type !== 'FRAME') {
        return 'Please select a single frame to export.';
    }

    // At the moment we only check the selection[0] and assume it is a frame
    // Later we will add support to groups and eclectic selection
    const frame = selection[0];
    TOTAL_WIDTH = round(frame.width);
    TOTAL_HEIGHT = round(frame.height);

    console.log(frame);

    // Start the code fresh
    resetCode();

    // We start early, to then later determine the intro
    addCode(`
    // Target canvas
    const canvas = document.getElementById("myCanvas");
    canvas.width = ${TOTAL_WIDTH};
    canvas.height = ${TOTAL_HEIGHT};
    const ctx = canvas.getContext("2d");

    // ------------
    // INSTRUCTIONS
    // ------------`,
    1);

    const frameHasRadius = frame.topLeftRadius || frame.topRightRadius || frame.bottomLeftRadius || frame.bottomRightRadius;
    const frameHasFills = frame.fills.length > 0;
    
    if (frameHasRadius || frameHasFills) {
        addCode(`\n
        // Main frame
        // ========================= `,
        1);
    }

    // We start with the round radius of the frame itself
    if (frameHasRadius) {
        exportRectangleRadius({node: frame, x: 0, y: 0, context: 'ctx', indent:2})
    }

    // Then we do all the fill paints
    if (frameHasFills) {
        for (let i = 0; i < frame.fills.length; i++) {
            await exportPaint({ paint: frame.fills[i], parent: frame, index: i+1, context: 'ctx', indent: 2 });
        }
    }

    // Then we make all the childrens recursivelly
    for(const child of frame.children ) {
        await exportNode({ node: child, parentCtx: 'ctx' })
    }

    // Then we do the stroke of the frame
    if (frame.strokeGeometry.length > 0) {
        addCode(`\n
            // Main frame Stroke
            // =========================` ,
            1);
        await exportStroke({ node: frame, context: 'ctx', indent: 1 });
    }

    addCode(`
    })(); `,
    0)

    // Check if any image was loaded
    if (Object.keys(imageData).length > 0) {
        code = `
// ----------------
// 📀 IMAGE DATA 📀
// ----------------

// You can save this data as an external .json file
const imageData = ${JSON.stringify(imageData, null, 4)};

// Helper function to load the images (from variable or a .json)
async function loadImageData(input) {
    const imageMap = typeof input === "string" ? await fetch(input).then(res => res.json()) : input;
    return Object.fromEntries( await Promise.all(
        Object.entries(imageMap).map(([key, src]) => {
            return new Promise(resolve => {
                const img = new Image();
                img.onload = () => { console.log(\`✅ Image "\${key}" loaded.\`); resolve([key, img]); }
                img.onerror = () => { console.log(\`❌ Image "\${key}" failed to load.\`); resolve([key, null]); };
                img.src = src;
            });
        })
    ) );
}


// ==========================
// 🖌 DRAWING INSTRUCTIONS 🖌
// ==========================

(async () => {

    // Load the images from variable or a .json file
    const images = await loadImageData(imageData);
    // const images = await loadImageData('your-image-data.json');
` + code
    } else {
        // ❌ imageData is empty
        code = `
// ==========================
// 🖌 DRAWING INSTRUCTIONS 🖌
// ==========================

(async () => { 
` + code
    }
    
    return code;
}



// MAIN NODE EXPORT FUNCTIONS

/*
    NODE 'type'
        "BOOLEAN_OPERATION"
        "CODE_BLOCK"
        "COMPONENT"
        "COMPONENT_SET"
        "CONNECTOR"
        "DOCUMENT"
        "ELLIPSE" 👋
        "EMBED"
        "FRAME" 👋
        "GROUP" 👋
        "INSTANCE"
        "LINE" 👋
        "LINK_UNFURL"
        "MEDIA"
        "PAGE"
        "POLYGON" 👋
        "RECTANGLE" ✅
        "SHAPE_WITH_TEXT"
        "SLICE"
        "STAMP"
        "STAR" 🤔
        "STICKY"
        "TABLE"
        "TABLE_CELL"
        "TEXT" ✅
        "TEXT_PATH"
        "TRANSFORM_GROUP"
        "VECTOR" 👋
        "WIDGET"
*/
async function exportNode(input){
    /*
        { 
            node: child,
            parentCtx: 'ctx'
        }
    */

    console.log(input.node);

    addCode(`\n
        // Layer '${input.node.name}'
        // =========================` ,
        1)

    // ----------------------------------
    if(input.node.type == 'RECTANGLE') {
        await exportRectangleNode(input)
    }

    // ----------------------------------
    if(input.node.type == 'TEXT') {
        await exportTextNode(input)
    }


}

async function exportRectangleNode(input) {
    const node = input.node;
    const prefix = input.prefix || '';
    const parentCtx = input.parentCtx || 'ctx';
    const indent = input.indent || 1;

    const { visible, width, height, opacity, blendMode, x, y } = node;

    // If the node is not 'VISIBLE'
    if (!visible) return
    // If the node has no FILLS or no STROKE
    if (node.fills.length === 0 && node.strokeGeometry.length === 0) return

    // We check what we have
    const nodeHasFills = node.fills.length > 0;
    const nodeHasStroke = node.strokeGeometry.length > 0;
    const nodeHasEffects = node.effects.length > 0;
    const nodeHasRadius = node.topLeftRadius || node.topRightRadius || node.bottomLeftRadius || node.bottomRightRadius;
    
    // Canvas LAYER
    const nodeName = prefix + toCamelCase(node.name);
    const nodeCanvas = nodeName + 'Canvas';
    const nodeCtx = nodeCanvas + 'Ctx';
    addCode(`
        const ${nodeCanvas} = document.createElement('canvas');
        ${nodeCanvas}.width = ${TOTAL_WIDTH};
        ${nodeCanvas}.height = ${TOTAL_HEIGHT};
        const ${nodeCtx} = ${nodeCanvas}.getContext('2d'); `,
        indent);

    // FILL
    // --------------------
    if(nodeHasFills && !nodeHasStroke) {
        // We start with the round radius of the rectangle
        if (nodeHasRadius) {
            exportRectangleRadius({node: node, context: nodeCtx, indent: indent+1});
        }
        // Then we paint the FILL
        for (let i = 0; i < node.fills.length; i++) {
            await exportPaint({ paint: node.fills[i], parent: node, index: i+1, context: nodeCtx, indent: indent+1});
        }
    }
    if (nodeHasFills && nodeHasStroke) {

        const fillCanvas = nodeName + 'Fill';
        const fillCtx = fillCanvas + 'Ctx';
        addCode(`
            // '${nodeName}' fill
            const ${fillCanvas} = document.createElement('canvas');
            ${fillCanvas}.width = ${round(width)};
            ${fillCanvas}.height = ${round(height)};
            const ${fillCtx} = ${fillCanvas}.getContext('2d'); `,
            indent + 1);

        // We start with the round radius of the rectangle
        if (node.topLeftRadius || node.topRightRadius || node.bottomLeftRadius || node.bottomRightRadius) {
            exportRectangleRadius({node: node, context: fillCtx, indent: indent+2})
        }
        
        // Then we paint the FILL
        for (let i = 0; i < node.fills.length; i++) {
            await exportPaint({ paint: node.fills[i], parent: node, index: i+1, context: fillCtx, indent: indent+2 });
        }

        addCode(`
            // Draw Fill on '${nodeName}'
            ${nodeCtx}.drawImage(${fillCanvas}, ${round(x)}, ${round(y)}); `,
            indent + 2);
    }

    // STROKES
    // --------------------
    if(!nodeHasFills && nodeHasStroke) {
        await exportStroke({ node: node, context: nodeCtx, indent: indent, x: x, y: y });
    }
    if (nodeHasFills && nodeHasStroke) {
        await exportStroke({ node: node, context: nodeCtx, indent: indent+1, x: x, y: y });
    }
    
    // To know which canvas export
    let exportCanvas = nodeCanvas;

    // EFFECTS
    // --------------------
    if (nodeHasEffects) {
        const effectCanvas = nodeName + 'CanvasWithEffects';
        const effectCtx = effectCanvas + 'Ctx';
        addCode(`
            // '${nodeName}' effect
            const ${effectCanvas} = document.createElement('canvas');
            ${effectCanvas}.width = ${TOTAL_WIDTH};
            ${effectCanvas}.height = ${TOTAL_HEIGHT};
            const ${effectCtx} = ${effectCanvas}.getContext('2d'); 
            ${effectCtx}.filter = ${convertEffects(node.effects)}
            ${effectCtx}.drawImage(${nodeCanvas}, 0, 0) ;`,
            indent + 1);
        // Change the output canvas
        exportCanvas = effectCanvas;
    }

    // EXPORT
    // --------------------
    addCode(`\n${parentCtx}.save();`, indent);

    // BLEND MODE
    if (blendMode != 'NORMAL') {
        const composite = convertBlendMode(blendMode);
        if (composite !== 'source-over' && composite !== 'unsupported') {
            addCode(`${parentCtx}.globalCompositeOperation = '${composite}';`, indent);
        }
        else if(composite == 'unsupported'){
            addCode(`// ⚠️ Blend mode "${blendMode}" is not supported in canvas. Using "source-over" (default) as fallback.`, indent);
        }
    }
    // OPACITY
    if (opacity != 1) addCode(`${parentCtx}.globalAlpha = ${round(opacity)};`, indent);

    // TARGET CANVAS
    addCode(`${parentCtx}.drawImage(${exportCanvas}, 0, 0);`, indent);
    addCode(`${parentCtx}.restore();`, indent);
}

async function exportTextNode(input) {
    const node = input.node;
    const prefix = input.prefix || '';
    const parentCtx = input.parentCtx || 'ctx';
    const indent = input.indent || 1;

    const { visible, width, height, opacity, blendMode, x, y, strokeGeometry, fillGeometry, fills } = node;
    
    // If the node is not 'VISIBLE'
    if (!visible) return
    // If the node has no FILLS or no STROKE
    if (node.fills.length === 0 && strokeGeometry.length === 0) return

    // First we initiate the canvas LAYER
    const nodeName = 'text_' + prefix + toCamelCase(node.name);
    const nodeCanvas = nodeName + 'Canvas';
    const nodeCtx = nodeCanvas + 'Ctx';
    addCode(`
        const ${nodeCanvas} = document.createElement('canvas');
        ${nodeCanvas}.width = ${TOTAL_WIDTH};
        ${nodeCanvas}.height = ${TOTAL_HEIGHT};
        const ${nodeCtx} = ${nodeCanvas}.getContext('2d'); `,
        indent);
        
    // STROKE (IF 'OUTSIDE' IT GOES BELOW)
    // --------------------
    if (node.strokeGeometry.length > 0 && node.strokeAlign === 'OUTSIDE') {
        await exportStroke({ node: node, context: nodeCtx, indent: indent+1, x: x, y: y });
    }

    // FILL
    // --------------------
    if (node.fills.length > 0) {

        const fillCanvas = nodeName + 'Fill';
        const fillCtx = fillCanvas + 'Ctx';
        addCode(`
            // '${nodeName}' fill
            const ${fillCanvas} = document.createElement('canvas');
            ${fillCanvas}.width = ${round(width)};
            ${fillCanvas}.height = ${round(height)};
            const ${fillCtx} = ${fillCanvas}.getContext('2d'); 
            
            // clip with the text shape
            const ${nodeName}Path = new Path2D("${fillGeometry[0].data}");
            ${fillCtx}.clip(${nodeName}Path); `,
            indent + 1);
            // ${nodeCtx}.translate(${deltaX/2}, ${deltaY/2});

        // Then we paint the FILL
        for (let i = 0; i < fills.length; i++) {
            await exportPaint({ paint: fills[i], parent: node, index: i+1, width:width, height:height, x:0, y:0, context: fillCtx, indent: indent+2 });
        }

        addCode(`
            // Draw Fills on parent
            ${nodeCtx}.drawImage(${fillCanvas}, ${round(x)}, ${round(y)}); `,
            indent + 2);
    }

    // STROKE (IF NOT 'OUTSIDE')
    // --------------------
    if (node.strokeGeometry.length > 0  && node.strokeAlign !== 'OUTSIDE') {
        await exportStroke({ node: node, context: nodeCtx, indent: indent+1, x: x, y: y });
    }
    
    // To know which canvas export
    let exportCanvas = nodeCanvas;

    // EFFECTS
    // --------------------
    if (node.effects.length > 0) {
        const effectCanvas = nodeName + 'CanvasWithEffects';
        const effectCtx = effectCanvas + 'Ctx';
        addCode(`
            // '${nodeName}' effect
            const ${effectCanvas} = document.createElement('canvas');
            ${effectCanvas}.width = ${TOTAL_WIDTH};
            ${effectCanvas}.height = ${TOTAL_HEIGHT};
            const ${effectCtx} = ${effectCanvas}.getContext('2d'); 
            ${effectCtx}.filter = ${convertEffects(node.effects)}
            ${effectCtx}.drawImage(${nodeCanvas}, 0, 0) ;`,
            indent + 1);
        // Change the output canvas
        exportCanvas = effectCanvas;
    }

    // EXPORT
    // --------------------
    addCode(`\n${parentCtx}.save();`, indent);

    // BLEND MODE
    if (blendMode != 'NORMAL') {
        const composite = convertBlendMode(blendMode);
        if (composite !== 'source-over' && composite !== 'unsupported') {
            addCode(`${parentCtx}.globalCompositeOperation = '${composite}';`, indent);
        }
        else if(composite == 'unsupported'){
            addCode(`// ⚠️ Blend mode "${blendMode}" is not supported in canvas. Using "source-over" (default) as fallback.`, indent);
        }
    }
    // OPACITY
    if (opacity != 1) addCode(`${parentCtx}.globalAlpha = ${round(opacity)}`, indent);

    // TARGET CANVAS
    addCode(`${parentCtx}.drawImage(${exportCanvas}, 0, 0);`, indent);
    addCode(`${parentCtx}.restore();`, indent);
}

// MAIN EXPORT FUNCTIONS

/*
    PAINT 'type'
        'SOLID' ✅
        'GRADIENT_LINEAR' ✅
        'IMAGE' ✅
        'GRADIENT_RADIAL'
        'GRADIENT_ANGULAR'
        'GRADIENT_DIAMOND'
        'VIDEO'
        'PATTERN'
*/
async function exportPaint(input) {
    const config = {
        paint: input.paint, // Important
        parent: input.parent, // Important
        context: input.context || 'ctx',
        indent: input.indent || 2,
        x: input.x || 0,
        y: input.y || 0,
        width: input.width || input.parent.width || width,
        height: input.height || input.parent.height || height,
        index: input.index || null,
    }

    const { visible, type, opacity, blendMode, color } = config.paint;
    
    let instructions = '';
    
    if (!visible) return
    if (blendMode != 'NORMAL') {
        const composite = convertBlendMode(blendMode);
        if (composite !== 'source-over' && composite !== 'unsupported') {
            instructions += `${config.context}.globalCompositeOperation = '${composite}';\n`;
        }
        else if(composite == 'unsupported'){
            instructions += `// ⚠️ Blend mode "${blendMode}" is not supported in canvas. Using "source-over" (default) as fallback.`
        }
    }
    if (opacity != 1) instructions += `${config.context}.globalAlpha = ${round(opacity)}; \n`;


    // ----------------------------------
    if (type == 'SOLID') {
        // Add the color
        instructions += `${config.context}.fillStyle = "${convertColor(color)}"; \n`;
        instructions += `${config.context}.fillRect(${round(config.x)}, ${round(config.y)}, ${round(config.width)}, ${round(config.height)});`;
    }

    // ----------------------------------
    if (type == 'GRADIENT_LINEAR') {
        // Generate a unique name for the graditent
        let gradientName = `${toCamelCase(config.parent.name)}_gradientFill${config.index}`;
        // Find the x y coordinates of the handles
        let coordinates = convertGradientTransform(config.paint.gradientTransform, config.parent);
        // Add the gradient
        instructions += `const ${gradientName} = ${config.context}.createLinearGradient(${coordinates[0].x}, ${coordinates[0].y}, ${coordinates[1].x}, ${coordinates[1].y}); \n`;
        // Add the colors to the gradient
        for (const stop of config.paint.gradientStops) {
            instructions += `${gradientName}.addColorStop(${Math.round(stop.position * 100) / 100}, "${convertColor(stop.color)}"); \n`;
        }
        // Add the fill
        instructions += `${config.context}.fillStyle = ${gradientName}; \n`;
        instructions += `${config.context}.fillRect(${round(config.x)}, ${round(config.y)}, ${round(config.width)}, ${round(config.height)});`;
    }

    // ----------------------------------
    if (type == 'IMAGE') {
        if (!config.paint.imageHash) {
            instructions += `// ⚠️ Image hash missing for image fill.\n`;
        } else {
            const imageId = `${toCamelCase(config.parent.name)}_${config.index}`;
            // const base64 = await getBase64FromImageFill(config.paint, );
            const base64 = await convertImagePaintToBase64(config.paint, config.width, config.height);

            // Add to global imageData object
            if (!imageData[imageId]) {
                imageData[imageId] = base64;
            }
            // Add the istructions
            instructions += `${config.context}.drawImage(images["${imageId}"], ${round(config.x)}, ${round(config.y)}, ${round(config.width)}, ${round(config.height)});`;
        }
    }

    // Export the code
    addCode(` 
        // ${type.toLowerCase()} paint ${config.index || ''}
        ${config.context}.save();
        ${instructions}
        ${config.context}.restore(); `,
        config.indent)
}

// Function to export the stroke in the code
async function exportStroke(input) {
    const config = {
        node: input.node, // Important
        context: input.context || 'ctx',
        indent: input.indent || 1,
        x: input.x || 0,
        y: input.y || 0,
    }

    const { 
        strokeGeometry, 
        strokes, 
        strokeTopWeight, 
        strokeBottomWeight,
        strokeLeftWeight, 
        strokeRightWeight,
        strokeWeight,
        strokeAlign } = config.node;

    let width, height, x, y, deltaX, deltaY;
    
    // First check the leght of strokes is more than 1, and that in all the strokes, at least one is visbile TRUE
    const visibleStrokes = strokes.filter(stroke => stroke.visible === true);
    if (visibleStrokes.length === 0) return

    // Then check if the strokeAlign is inside, center or outside to determine the canvas size
    // If the strokeAlign is inside, we make the canvas size the same as the node size
    if (strokeAlign == 'INSIDE') {
        deltaX = 0;
        deltaY = 0;
    }
    // If the strokeAlign is center, half to the canvas size
    else if (strokeAlign == 'CENTER') {
        deltaX = strokeLeftWeight ? (strokeLeftWeight + strokeRightWeight)/2 : strokeWeight;
        deltaY = strokeTopWeight ? (strokeTopWeight + strokeBottomWeight)/2 : strokeWeight;
    }
    // If the strokeAlign is outside, we need to add the strokeTopWeight, strokeBottomWeight, strokeLeftWeight and strokeRightWeight to the canvas size
    else if (strokeAlign == 'OUTSIDE') {
        deltaX = strokeLeftWeight ? (strokeLeftWeight + strokeRightWeight) : strokeWeight*2;
        deltaY = strokeTopWeight ? (strokeTopWeight + strokeBottomWeight) : strokeWeight*2;
    }
    width = config.node.width + deltaX;
    height = config.node.height + deltaY;
    x = config.x - deltaX / 2;
    y = config.y - deltaY / 2;

    // We create the canvas and context
    const name = toCamelCase(config.node.name) + 'Stroke';
    const nodeCanvas = name + 'Canvas';
    const nodeCtx = nodeCanvas + 'Ctx';
    addCode(`
        // '${config.node.name}' stroke
        const ${nodeCanvas} = document.createElement('canvas');
        ${nodeCanvas}.width = ${round(width)};
        ${nodeCanvas}.height = ${round(height)};
        const ${nodeCtx} = ${nodeCanvas}.getContext('2d'); `,
        config.indent);

    // First we clip the canvas based on the path at strokeGeometry[0].data with Path2D(pathData);
    const path = strokeGeometry[0].data;
    addCode(`
        // clip with the stroke shape
        const ${name}Path = new Path2D("${path}");
        ${nodeCtx}.translate(${deltaX/2}, ${deltaY/2});
        ${nodeCtx}.clip(${name}Path);`,
        config.indent + 1);

    // Then we fill it successively with all the strokes paints
    for (let i = 0; i < strokes.length; i++) {
        await exportPaint({ paint: strokes[i], parent: config.node, index: i+1, width:width, height:height, x:-deltaX/2, y:-deltaX/2, context: nodeCtx, indent: config.indent + 1 });
    }

    addCode(`
        // Draw Stroke on parent
        ${config.context}.drawImage(${nodeCanvas}, ${round(x)}, ${round(y)}); `,
        config.indent + 1);
}

// Set clip() for RECTANGLES with round radius
function exportRectangleRadius(input) {
    const config = {
        context: input.context || 'ctx',
        indent: input.indent || 2,
        node: input.node,
        x: input.x || 0,
        y: input.y || 0,
        width: input.width || input.node.width || width,
        height: input.height || input.node.height || height,
    }

    const rTL = round(config.node.topLeftRadius);
    const rTR = round(config.node.topRightRadius);
    const rBR = round(config.node.bottomRightRadius);
    const rBL = round(config.node.bottomLeftRadius);
    const allEqual = rTL === rTR && rTL === rBR && rTL === rBL;

    // If the four corner are the same
    if (allEqual) {
        // Uniform border-radius → use roundRect
        addCode(`
            // Clipped content (round radius)
            ${config.context}.beginPath();
            ${config.context}.roundRect(${round(config.x)}, ${round(config.y)}, ${round(config.width)}, ${round(config.height)}, ${rTL});
            ${config.context}.clip(); `,
            config.indent);
    }
    // If the four corners are differents
    else {
        addCode(`
            // Clipped content (round radius)
            ${config.context}.beginPath();
            ${config.context}.moveTo(${config.x + rTL}, ${config.y});
            ${config.context}.lineTo(${config.x + config.width - rTR}, ${config.y});
            ${config.context}.quadraticCurveTo(${config.x + config.width}, ${config.y}, ${config.x + config.width}, ${config.y + rTR});
            ${config.context}.lineTo(${config.x + config.width}, ${config.y + config.height - rBL});
            ${config.context}.quadraticCurveTo(${config.x + config.width}, ${config.y + config.height}, ${config.x + config.width - rBL}, ${config.y + config.height});
            ${config.context}.lineTo(${config.x + rBR}, ${config.y + config.height});
            ${config.context}.quadraticCurveTo(${config.x}, ${config.y + config.height}, ${config.x}, ${config.y + config.height - rBR});
            ${config.context}.lineTo(${config.x}, ${config.y + rTL});
            ${config.context}.quadraticCurveTo(${config.x}, ${config.y}, ${config.x + rTL}, ${config.y});
            ${config.context}.closePath();
            ${config.context}.clip(); `,
            config.indent);
    }
}


// ---------------------
// 😱 HELPER FUNCTIONS 😱
// ---------------------

// To convert {r: g: b: (a:)} to CSS 'rgba()'
function convertColor(color) {
    if (color.a !== undefined) return `rgba(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)}, ${round(color.a)})`
    else return `rgb(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)})`;
}
// To convert blendMode to CSS blend modes
function convertBlendMode(blendMode) {
    switch (blendMode) {
        case 'NORMAL':
        case 'PASS_THROUGH':
            return 'source-over';
        case 'MULTIPLY':
            return 'multiply';
        case 'SCREEN':
            return 'screen';
        case 'OVERLAY':
            return 'overlay';
        case 'DARKEN':
            return 'darken';
        case 'LIGHTEN':
            return 'lighten';
        case 'COLOR_DODGE':
        case 'LINEAR_DODGE': // Figma: Plus lighter
            return 'color-dodge';
        case 'COLOR_BURN':
        case 'LINEAR_BURN': // Figma: Plus darker
            return 'color-burn';
        case 'HARD_LIGHT':
            return 'hard-light';
        case 'SOFT_LIGHT':
            return 'soft-light';
        case 'DIFFERENCE':
            return 'difference';
        case 'EXCLUSION':
            return 'exclusion';
        // Unsupported modes in canvas:
        case 'HUE':
        case 'SATURATION':
        case 'COLOR':
        case 'LUMINOSITY':
        default:
            return 'unsupported';
    }
}
// To convert effects to CSS filter string
function convertEffects(effects) {
    if (!effects || effects.length === 0) return '';

    const filters = [];
    const comments = [];

    for (const effect of effects) {
        if (!effect.visible) continue;

        switch (effect.type) {
            case 'LAYER_BLUR':
                filters.push(`blur(${round(effect.radius)}px)`);
                break;

            case 'DROP_SHADOW':
                const dx = round(effect.offset.x);
                const dy = round(effect.offset.y);
                const blur = round(effect.radius);
                const spread = 0; // Figma doesn't expose spread directly
                const color = convertColor(effect.color);
                filters.push(`drop-shadow(${dx}px ${dy}px ${blur}px ${color})`);
                break;

            case 'BACKGROUND_BLUR':
            case 'INNER_SHADOW':
            default:
                comments.push(`// ⚠️ ${effect.type} not supported in canvas/CSS`);
                break;
        }
    }

    const filterStr = filters.length ? `'${filters.join(' ')}';` : '';
    const commentStr = comments.length ? comments.join('\n') : '';

    let finalString = ''
    if (filterStr) finalString += filterStr;
    if (commentStr && filterStr) finalString += '\n';
    if (commentStr) finalString += commentStr;

    return finalString;
}
// Convert gradientTransform matrix to x y coordinates
function convertGradientTransform(transform, node) {
    // transform is a 2x3 matrix:
    // [[a, c, e],
    //  [b, d, f]]

    // First, build the full 3x3 affine matrix so we can invert it
    const a = transform[0][0];
    const c = transform[0][1];
    const e = transform[0][2];
    const b = transform[1][0];
    const d = transform[1][1];
    const f = transform[1][2];

    const matrix = [
        [a, c, e],
        [b, d, f],
        [0, 0, 1]
    ];

    const inv = invert3x3(matrix);

    // Identity matrix handle positions in 3x3 form
    const identityMatrixHandlePositions = [
        [0, 1, 0],
        [0.5, 0.5, 1],
        [1, 1, 1]
    ]

    // Apply the inverse gradient transform to standard gradient handle positions
    const transformedHandles = multiply3x3(inv, identityMatrixHandlePositions);

    // Extract the transformed handles and convert from relative [0–1] to absolute canvas coordinates
    const startHandle = {
        x: Math.round(transformedHandles[0][0] * node.width),
        y: Math.round(transformedHandles[1][0] * node.height)
    };

    const endHandle = {
        x: Math.round(transformedHandles[0][1] * node.width),
        y: Math.round(transformedHandles[1][1] * node.height)
    };

    const centerHandle = {
        x: Math.round(transformedHandles[0][2] * node.width),
        y: Math.round(transformedHandles[1][2] * node.height)
    };

    // Return the 3 key handle positions used for gradient construction
    return [startHandle, endHandle, centerHandle];
}
function invert3x3(m) {
    const [
        [a, b, c],
        [d, e, f],
        [g, h, i]
    ] = m;

    const A = e * i - f * h;
    const B = -(d * i - f * g);
    const C = d * h - e * g;
    const D = -(b * i - c * h);
    const E = a * i - c * g;
    const F = -(a * h - b * g);
    const G = b * f - c * e;
    const H = -(a * f - c * d);
    const I = a * e - b * d;

    const det = a * A + b * B + c * C;

    if (det === 0) throw new Error('Matrix not invertible');

    const invDet = 1 / det;

    return [
        [A * invDet, D * invDet, G * invDet],
        [B * invDet, E * invDet, H * invDet],
        [C * invDet, F * invDet, I * invDet]
    ];
}
function multiply3x3(a, b) {
    const result = Array(3).fill(0).map(() => Array(3).fill(0));
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            for (let k = 0; k < 3; k++) {
                result[row][col] += a[row][k] * b[k][col];
            }
        }
    }
    return result;
}
// Convert Image paint to Base64 string
async function convertImagePaintToBase64(paint, width, height) {
    if (paint.type !== 'IMAGE' || !paint.imageHash) {
        console.log("Invalid image paint");
    }

    // 1. Create a temporary rectangle
    const tempNode = figma.createRectangle();
    tempNode.visible = true;
    tempNode.resize(width, height);
    tempNode.fills = [paint];

    // 2. Export it
    const bytes = await tempNode.exportAsync({ format: 'PNG' });
    const base64 = uint8ToBase64(bytes);

    // 3. Remove from document
    tempNode.remove();

    // 4. Return base64 string
    return `data:image/png;base64,${base64}`;
}
// Helper to convert uint8 to Base64
function uint8ToBase64(bytes) {
    let binary = '';
    const chunkSize = 8192; // Avoid call stack overflow
    for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.slice(i, i + chunkSize);
        binary += String.fromCharCode(...chunk);
    }
    return base64Encode(binary);
}
// Tiny base64 polyfill (only used if nothing else is available)
function base64Encode(str) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';
    let i = 0;
    while (i < str.length) {
        const chr1 = str.charCodeAt(i++);
        const chr2 = str.charCodeAt(i++);
        const chr3 = str.charCodeAt(i++);
        const enc1 = chr1 >> 2;
        const enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        const enc3 = isNaN(chr2) ? 64 : ((chr2 & 15) << 2) | (chr3 >> 6);
        const enc4 = isNaN(chr3) ? 64 : (chr3 & 63);
        output += chars.charAt(enc1) + chars.charAt(enc2) +
                  chars.charAt(enc3) + chars.charAt(enc4);
    }
    return output;
}

// For texts
function toCamelCase(name) {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 5)
        .map((word, i) => {
            const clean = word.replace(/[^a-zA-Z0-9]/g, '');
            if (i === 0) return clean.toLowerCase();
            return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
        })
        .join('');
}
// To round the numbers to the precision decimal
function round(num, precision = 2) {
    return Number (Math.round(num * Math.pow(10, precision)) / Math.pow(10, precision));
}




// ===============
// 📠 WRITE CODE 📠
// ===============

function resetCode() {
    code = ''
}
function addCode(text, indent = 1, atBeginning = false) {
    const lines = text.split('\n');
    const indentStr = '    '.repeat(indent);
    const formatted = lines.map(line => indentStr + line.trim()).join('\n') + '\n';

    if (atBeginning) {
        code = formatted + code;
    } else {
        code += formatted;
    }
}


// ===================
// 👇 USER SELECTION 👇
// ===================

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