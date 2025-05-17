
// ----------------
// 📀 IMAGE DATA 📀
// ----------------

// You can save this data as an external .json file
const imageData = {
    "image5_image1": "data:image/png;base64,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"
};

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
    canvas.width = 500;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    
    // ------------
    // INSTRUCTIONS
    // ------------
    
    // Main frame
    // =========================
        
        // Clipped content (round radius)
        ctx.beginPath();
        ctx.roundRect(0, 0, 500, 300, 50);
        ctx.clip();
        
        // solid paint 1
        ctx.save();
        ctx.fillStyle = "rgb(255, 87, 205)";
        ctx.fillRect(0, 0, 500, 300);
        ctx.restore();
        
        // solid paint 2
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = "rgb(0, 0, 0)";
        ctx.fillRect(0, 0, 500, 300);
        ctx.restore();
        
        // gradient_linear paint 3
        ctx.save();
        ctx.globalAlpha = 0.6;
        const Frame44_gradientFill3 = ctx.createLinearGradient(250, 150, 500, 0);
        Frame44_gradientFill3.addColorStop(0, "rgba(0, 0, 0, 0)");
        Frame44_gradientFill3.addColorStop(0.25, "rgba(4, 0, 255, 0.6)");
        ctx.fillStyle = Frame44_gradientFill3;
        ctx.fillRect(0, 0, 500, 300);
        ctx.restore();
    
    
    // Layer 'Rectangle 22'
    // =========================
    
    const Rectangle22Canvas = document.createElement('canvas');
    Rectangle22Canvas.width = 500;
    Rectangle22Canvas.height = 300;
    const Rectangle22CanvasCtx = Rectangle22Canvas.getContext('2d');
        
        // 'Rectangle22' fill
        const Rectangle22Fill = document.createElement('canvas');
        Rectangle22Fill.width = 100;
        Rectangle22Fill.height = 100;
        const Rectangle22FillCtx = Rectangle22Fill.getContext('2d');
            
            // solid paint 1
            Rectangle22FillCtx.save();
            Rectangle22FillCtx.fillStyle = "rgb(255, 0, 0)";
            Rectangle22FillCtx.fillRect(0, 0, 100, 100);
            Rectangle22FillCtx.restore();
            
            // Draw Fill on 'Rectangle22'
            Rectangle22CanvasCtx.drawImage(Rectangle22Fill, 50, 50);
        
        // 'Rectangle 22' stroke
        const Rectangle22StrokeCanvas = document.createElement('canvas');
        Rectangle22StrokeCanvas.width = 110;
        Rectangle22StrokeCanvas.height = 110;
        const Rectangle22StrokeCanvasCtx = Rectangle22StrokeCanvas.getContext('2d');
            
            // clip with the stroke shape
            const Rectangle22StrokePath = new Path2D("M0 0 L0 -5 L-5 -5 L-5 0 L0 0 Z M100 0 L105 0 L105 -5 L100 -5 L100 0 Z M100 100 L100 105 L105 105 L105 100 L100 100 Z M0 100 L-5 100 L-5 105 L0 105 L0 100 Z M0 0 L0 5 L100 5 L100 0 L100 -5 L0 -5 L0 0 Z M100 0 L95 0 L95 100 L100 100 L105 100 L105 0 L100 0 Z M100 100 L100 95 L0 95 L0 100 L0 105 L100 105 L100 100 Z M0 100 L5 100 L5 0 L0 0 L-5 0 L-5 100 L0 100 Z");
            Rectangle22StrokeCanvasCtx.translate(5, 5);
            Rectangle22StrokeCanvasCtx.clip(Rectangle22StrokePath);
            
            // solid paint 1
            Rectangle22StrokeCanvasCtx.save();
            Rectangle22StrokeCanvasCtx.globalAlpha = 0.2;
            Rectangle22StrokeCanvasCtx.fillStyle = "rgb(0, 0, 0)";
            Rectangle22StrokeCanvasCtx.fillRect(-5, -5, 110, 110);
            Rectangle22StrokeCanvasCtx.restore();
            
            // Draw Stroke on parent
            Rectangle22CanvasCtx.drawImage(Rectangle22StrokeCanvas, 45, 45);
        
        // 'Rectangle22' effect
        const Rectangle22CanvasWithEffects = document.createElement('canvas');
        Rectangle22CanvasWithEffects.width = 500;
        Rectangle22CanvasWithEffects.height = 300;
        const Rectangle22CanvasWithEffectsCtx = Rectangle22CanvasWithEffects.getContext('2d');
        Rectangle22CanvasWithEffectsCtx.filter = 'drop-shadow(-10px 10px 0px rgba(0, 0, 0, 1))';
        Rectangle22CanvasWithEffectsCtx.drawImage(Rectangle22Canvas, 0, 0) ;
    
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.drawImage(Rectangle22CanvasWithEffects, 0, 0);
    ctx.restore();
    
    
    // Layer 'Rectangle 23'
    // =========================
    
    const Rectangle23Canvas = document.createElement('canvas');
    Rectangle23Canvas.width = 500;
    Rectangle23Canvas.height = 300;
    const Rectangle23CanvasCtx = Rectangle23Canvas.getContext('2d');
        
        // 'Rectangle23' fill
        const Rectangle23Fill = document.createElement('canvas');
        Rectangle23Fill.width = 100;
        Rectangle23Fill.height = 100;
        const Rectangle23FillCtx = Rectangle23Fill.getContext('2d');
            
            // Clipped content (round radius)
            Rectangle23FillCtx.beginPath();
            Rectangle23FillCtx.roundRect(0, 0, 100, 100, 30);
            Rectangle23FillCtx.clip();
            
            // solid paint 1
            Rectangle23FillCtx.save();
            Rectangle23FillCtx.fillStyle = "rgb(0, 0, 255)";
            Rectangle23FillCtx.fillRect(0, 0, 100, 100);
            Rectangle23FillCtx.restore();
            
            // Draw Fill on 'Rectangle23'
            Rectangle23CanvasCtx.drawImage(Rectangle23Fill, 100, 100);
    
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.drawImage(Rectangle23Canvas, 0, 0);
    ctx.restore();
    
    
    // Layer 'image 5'
    // =========================
    
    const image5Canvas = document.createElement('canvas');
    image5Canvas.width = 500;
    image5Canvas.height = 300;
    const image5CanvasCtx = image5Canvas.getContext('2d');
        
        // 'image5' fill
        const image5Fill = document.createElement('canvas');
        image5Fill.width = 43;
        image5Fill.height = 53;
        const image5FillCtx = image5Fill.getContext('2d');
            
            // image paint 1
            image5FillCtx.save();
            image5FillCtx.drawImage(images["image5_image1"], 0, 0, 43, 53);
            image5FillCtx.restore();
            
            // Draw Fill on 'image5'
            image5CanvasCtx.drawImage(image5Fill, 250, 97);
    
    ctx.save();
    ctx.drawImage(image5Canvas, 0, 0);
    ctx.restore();
    
    
    // Main frame Stroke
    // =========================
    
    // 'Frame 44' stroke
    const Frame44StrokeCanvas = document.createElement('canvas');
    Frame44StrokeCanvas.width = 500;
    Frame44StrokeCanvas.height = 300;
    const Frame44StrokeCanvasCtx = Frame44StrokeCanvas.getContext('2d');
        
        // clip with the stroke shape
        const Frame44StrokePath = new Path2D("M-30 50 C-30 5.81722 5.81722 -30 50 -30 L420 -30 C464.183 -30 500 5.81722 500 50 C500 38.9543 477.614 30 450 30 L50 30 C38.9543 30 30 38.9543 30 50 L-30 50 Z M500 300 L0 300 L500 300 Z M50 300 C5.81722 300 -30 264.183 -30 220 L-30 50 C-30 5.81722 5.81722 -30 50 -30 L50 30 C38.9543 30 30 38.9543 30 50 L30 250 C30 277.614 38.9543 300 50 300 Z M500 0 L500 300 L500 0 Z");
        Frame44StrokeCanvasCtx.translate(0, 0);
        Frame44StrokeCanvasCtx.clip(Frame44StrokePath);
        
        // solid paint 1
        Frame44StrokeCanvasCtx.save();
        Frame44StrokeCanvasCtx.globalAlpha = 0.2;
        Frame44StrokeCanvasCtx.fillStyle = "rgb(0, 0, 0)";
        Frame44StrokeCanvasCtx.fillRect(0, 0, 500, 300);
        Frame44StrokeCanvasCtx.restore();
        
        // gradient_linear paint 2
        Frame44StrokeCanvasCtx.save();
        Frame44StrokeCanvasCtx.globalAlpha = 0.5;
        const Frame44_gradientFill2 = Frame44StrokeCanvasCtx.createLinearGradient(500, 150, 0, 150);
        Frame44_gradientFill2.addColorStop(0, "rgba(0, 4, 255, 1)");
        Frame44_gradientFill2.addColorStop(1, "rgba(255, 0, 0, 1)");
        Frame44StrokeCanvasCtx.fillStyle = Frame44_gradientFill2;
        Frame44StrokeCanvasCtx.fillRect(0, 0, 500, 300);
        Frame44StrokeCanvasCtx.restore();
        
        // Draw Stroke on parent
        ctx.drawImage(Frame44StrokeCanvas, 0, 0);

})();
