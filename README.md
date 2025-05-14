# Figma to &lt;canvas> HTML

> ⚠️ Currently in WIP

Convert your Figma designs into native &lt;canvas> JavaScript drawing instructions.

---

## ✨ Features
- Exports selected Figma elements as native JS canvas code
- Supports shapes, text, gradients, images, and blend modes
- Export as file or copy to clipboard
- Toggle options: hide layers, exclude text, image base64/fixed

---

## 🛠 How to Use

- Run plugin: Plugins → Figma to Canvas HTML
- Select elements in Figma
- Choose your export options
- Download or copy JS code
- Add it to your `.html` file

```html
<canvas id="myCanvas" width="800" height="600"></canvas>
<script src="scene.js"></script>
```