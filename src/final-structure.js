// ----------
// IMAGE DATA
// ----------

// You can save it in an external .json file
const imageData = {
    "bg": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "icon": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
  
// Helper function to load the images
// Either on object or a .json
async function loadImageData(input) {
    const imageMap = typeof input === "string" ? await fetch(input).then(res => res.json()) : input;
    const entries = await Promise.all(
        Object.entries(imageMap).map(([key, src]) => {
            return new Promise(resolve => {
                const img = new Image();
                img.onload = () => {
                    console.log(`✅ Image "${key}" loaded.`);
                    resolve([key, img]);
                }
                img.onerror = () => {
                    console.log(`❌ Image "${key}" failed to load.`);
                    resolve([key, null]); // or skip it depending on our use case
                };
                img.src = src;
            });
        })
    );
    return Object.fromEntries(entries);
}


// ====================
// DRAWING INSTRUCTIONS
// ====================

(async () => {

    // Load the external images
    const images = await loadImageData(imageData);
    // const images = await loadImageData('your-image-data.json');

    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Rect
    ctx.fillStyle = "#3498db";
    ctx.fillRect(100, 100, 150, 100);

    // Text
    ctx.fillStyle = "#222";
    ctx.font = "16px Arial";
    ctx.fillText("From Figma!", 120, 130);

    // Image
    ctx.drawImage(images["icon"], 300, 100, 64, 64);

})();