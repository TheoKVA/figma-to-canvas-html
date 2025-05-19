// ----------------
// 📀 IMAGE DATA 📀
// ----------------

// You can save this data as an external .json file
const imageData = {
    "bg": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "icon": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
}
  
// Helper function to load the images (from varibale or a .json)
async function loadImageData(input) {
    const imageMap = typeof input === "string" ? await fetch(input).then(res => res.json()) : input;
    return Object.fromEntries( await Promise.all(
        Object.entries(imageMap).map(([key, src]) => {
            return new Promise(resolve => {
                const img = new Image();
                img.onload = () => { console.log(`✅ Image "${key}" loaded.`); resolve([key, img]); }
                img.onerror = () => { console.log(`❌ Image "${key}" failed to load.`); resolve([key, null]); };
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

    // Target canvas
    const canvas = document.getElementById("myCanvas");
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext("2d");

    // ------------
    // INSTRUCTIONS
    // ------------

    // Main frame
    // =========================

        // Round radius
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 0);
        ctx.quadraticCurveTo(50, 0, 50, 0);
        ctx.lineTo(0, 0);
        ctx.quadraticCurveTo(50, 0, 50, 0);
        ctx.lineTo(0, 0);
        ctx.quadraticCurveTo(50, 0, 50, 0);
        ctx.lineTo(0, 0);
        ctx.quadraticCurveTo(50, 0, 50, 0);
        ctx.clip();

        // solid fill 1
        ctx.save();
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.restore();

        // solid fill 2
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.restore();

        // linear_gradient fill 3
        ctx.save();
        const gradient = ctx.createLinearGradient(20, 0, 220, 0);
        gradient.addColorStop(0, "green");
        gradient.addColorStop(0.5, "cyan");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();

        // image fill 4
        ctx.save();
        ctx.globalAlpha = 0.75; // Image opacity
        ctx.drawImage(images["icon"], 300, 100, 64, 64);
        ctx.restore();


    // Layer 'rect 1'
    // =========================

        const rect1Canvas = document.createElement('canvas');
        rect1Canvas.width = 100;
        rect1Canvas.height = 100;
        const rect1Ctx = rect1Canvas.getContext('2d');

            // Fill image
            rect1Ctx.save();
            rect1Ctx.globalAlpha = 1; // Image opacity
            rect1Ctx.drawImage(images["icon"], 300, 100, 64, 64);
            rect1Ctx.restore();

            // Fill Gradient
            const rect1gradient = rect1Ctx.createLinearGradient(20, 0, 220, 0);
            rect1gradient.addColorStop(0, "green");
            rect1gradient.addColorStop(0.5, "cyan");
            rect1Ctx.save();
            rect1Ctx.globalCompositeOperation = "lighter";
            rect1Ctx.fillStyle = rect1gradient;
            rect1Ctx.fillRect(0, 0, width, height);
            rect1Ctx.restore();
        
        // Draw 'rect 1' back on the main canvas
        ctx.save();
        ctx.globalAlpha = 0.5; // Rectangle Opacity
        ctx.drawImage(rect1Canvas, 0, 0);
        ctx.restore();


    // Layer 'group 1'
    // =========================

        const group2Canvas = document.createElement('canvas');
        group2Canvas.width = 100;
        group2Canvas.height = 100;
        const group2Ctx = group2Canvas.getContext('2d');

            // > 'group 1 > Rect 1'
            // -------------------------
            const group2rect1Canvas = document.createElement('canvas');
            group2rect1Canvas.width = 100;
            group2rect1Canvas.height = 100;
            const group2rect1Ctx = group2rect1Canvas.getContext('2d');

                // Draw fills of the rectangle
                // ....

            // Draw 'group 1 > Rect 1' back on 'group 1'
            group2Ctx.save();
            group2Ctx.globalAlpha = 0.5; // Content Opacity
            group2Ctx.drawImage(group2rect1Canvas, 0, 0);
            group2Ctx.restore();


            // > 'group 1 > Rect 2'
            // -------------------------
            const group2rect2Canvas = document.createElement('canvas');
            group2rect2Canvas.width = 100;
            group2rect2Canvas.height = 100;
            const group2rect2Ctx = group2rect2Canvas.getContext('2d');

                // Draw fills of the rectangle
                // ....

            // Draw 'group 1 > Rect 2' back on 'group 1'
            group2Ctx.save();
            group2Ctx.globalAlpha = 0.5; // Content Opacity
            group2Ctx.drawImage(group2rect2Canvas, 0, 0);
            group2Ctx.restore();


        // Draw 'group 1' back on the main canvas
        ctx.save();
        ctx.globalAlpha = 0.5; // Mask Opacity
        ctx.drawImage(group2Canvas, 0, 0);
        ctx.restore();


    // Layer 'mask group 3'
    // =========================

        const maskgroup3Canvas = document.createElement('canvas');
        maskgroup3Canvas.width = 100;
        maskgroup3Canvas.height = 100;
        const maskgroup3Ctx = maskgroup3Canvas.getContext('2d');

            // > 'mask group 3' content
            const maskgroup3ContentCanvas = document.createElement('canvas');
            maskgroup3ContentCanvas.width = 100;
            maskgroup3ContentCanvas.height = 100;
            const maskgroup3ContentCtx = maskgroup3ContentCanvas.getContext('2d');

                // Draw
                // ....


            // > 'mask group 3' Mask
            const maskgroup3MaskCanvas = document.createElement('canvas');
            maskgroup3MaskCanvas.width = 100;
            maskgroup3MaskCanvas.height = 100;
            const maskgroup3MaskCtx = maskgroup3MaskCanvas.getContext('2d');


                // Draw
                // ....

            // 'mask group 3' Fusion
            maskgroup3Ctx.save();
            maskgroup3Ctx.globalAlpha = 0.5; // Content Opacity
            maskgroup3Ctx.drawImage(maskgroup3ContentCanvas, 0, 0);
            maskgroup3Ctx.restore();
            maskgroup3Ctx.globalCompositeOperation = "destination-in";
            maskgroup3Ctx.globalAlpha = 0.5; // Content Opacity
            maskgroup3Ctx.drawImage(maskgroup3MaskCanvas, 0, 0);


        // Draw 'mask group 3' on the main canvas
        ctx.save();
        ctx.globalAlpha = 0.5; // Mask Opacity
        ctx.drawImage(maskgroup3Canvas, 0, 0);
        ctx.restore();


    // Layer 'text 4'
    // =========================

    // To do


})();

// Faire que un canvas si que un fill ou un stroke

// Faire les groupes
// Faire les masks
// Finir les textes
    // Commenter la position etc pour remettre manuellement ?

// LATER
//
// Faire les autres shapes
// Faire les dégradés radiaux
// Faire les strokes !
    // Toujours au dessus
        // Dessus les fills
    // inside | outside |  middle
// Draw des SVG aussi