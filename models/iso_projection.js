// isoProjection.js

// Assumes isoBoard.js is loaded!

class IsoProjection {
    /**
     * @param {Array<Plate>} plates
     * @param {number} scale - How much to scale up the projection
     * @param {[number, number]} offset - [x, y] offset of the projection
     */
    constructor(plates, scale = 2, offset = [500, 100]) {
        this.isoPlates = IsoBoard.compute_iso_plates(plates, scale, offset);
        this.scale = scale;
        this.offset = offset;
    }

    // draw_projection(ctx, blitPosition = [500, 0]) {
    //     // 1. Create an offscreen canvas
    //     const width = ctx.canvas.width;
    //     const height = ctx.canvas.height;
    //     const offCanvas = document.createElement("canvas");
    //     offCanvas.width = width;
    //     offCanvas.height = height;
    //     const offCtx = offCanvas.getContext("2d");
    
    //     // 2. Prepare accumulators
    //     const rgbSum = new Float32Array(width * height * 3);
    //     const count = new Uint8Array(width * height);
    
    //     // 3. Draw each plate's polygon, extract pixels, blend as in Python
    //     for (const plate of this.isoPlates) {
    //         // Clear offscreen for each shape
    //         offCtx.clearRect(0, 0, width, height);
    
    //         offCtx.beginPath();
    //         const shape = plate[2];
    //         if (shape.length > 0) {
    //             offCtx.moveTo(shape[0][0] + blitPosition[0], shape[0][1] + blitPosition[1]);
    //             for (let i = 1; i < shape.length; i++) {
    //                 offCtx.lineTo(shape[i][0] + blitPosition[0], shape[i][1] + blitPosition[1]);
    //             }
    //             offCtx.closePath();
    //             offCtx.fillStyle = plate[1];
    //             offCtx.globalAlpha = 1.0; // No alpha, blend manually below
    //             offCtx.fill();
    //         }
    
    //         // Extract RGBA pixels
    //         const imageData = offCtx.getImageData(0, 0, width, height);
    //         const data = imageData.data;
    //         for (let i = 0; i < width * height; i++) {
    //             const alpha = data[i * 4 + 3];
    //             if (alpha > 0) {
    //                 // Additive blend, weighted by alpha (match Python logic)
    //                 rgbSum[i * 3 + 0] += data[i * 4 + 0] * (alpha / 255);
    //                 rgbSum[i * 3 + 1] += data[i * 4 + 1] * (alpha / 255);
    //                 rgbSum[i * 3 + 2] += data[i * 4 + 2] * (alpha / 255);
    //                 count[i] += 1;
    //             }
    //         }
    //     }
    
    //     // 4. Scale colors to max 255 like numpy code
    //     //    (this prevents overflow)
    //     const finalData = ctx.createImageData(width, height);
    //     for (let i = 0; i < width * height; i++) {
    //         let r = rgbSum[i * 3 + 0];
    //         let g = rgbSum[i * 3 + 1];
    //         let b = rgbSum[i * 3 + 2];
    //         let n = count[i];
    
    //         if (n === 0) n = 1; // Avoid div by zero
    //         // Find max channel
    //         const maxVal = Math.max(r, g, b);
    //         let scale = 1;
    //         if (maxVal > 255) scale = 255.0 / maxVal;
    //         r *= scale;
    //         g *= scale;
    //         b *= scale;
    
    //         finalData.data[i * 4 + 0] = Math.min(Math.round(r), 255);
    //         finalData.data[i * 4 + 1] = Math.min(Math.round(g), 255);
    //         finalData.data[i * 4 + 2] = Math.min(Math.round(b), 255);
    //         finalData.data[i * 4 + 3] = 255;
    //     }
    
    //     // 5. Put blended image to main ctx
    //     ctx.putImageData(finalData, blitPosition[0], blitPosition[1]);
    // }
    draw_projection(ctx, blitPosition = [500, 0]) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const offCanvas = document.createElement("canvas");
        offCanvas.width = width;
        offCanvas.height = height;
        const offCtx = offCanvas.getContext("2d");
    
        // Prepare sum and count arrays
        const rgbSum = new Float32Array(width * height * 3);
    
        // For each plate: rasterize and sum pixels
        for (const plate of this.isoPlates) {
            offCtx.clearRect(0, 0, width, height);
    
            offCtx.beginPath();
            const shape = plate[2];
            if (shape.length > 0) {
                offCtx.moveTo(shape[0][0] + blitPosition[0], shape[0][1] + blitPosition[1]);
                for (let i = 1; i < shape.length; i++) {
                    offCtx.lineTo(shape[i][0] + blitPosition[0], shape[i][1] + blitPosition[1]);
                }
                offCtx.closePath();
                offCtx.fillStyle = plate[1]; // e.g., "rgba(239,72,60,0.63)"
                offCtx.globalAlpha = 1.0;
                offCtx.fill();
            }
    
            // Extract pixel data
            const imageData = offCtx.getImageData(0, 0, width, height);
            const data = imageData.data;
            for (let i = 0; i < width * height; i++) {
                const alpha = data[i * 4 + 3];
                if (alpha > 0) {
                    rgbSum[i * 3 + 0] += data[i * 4 + 0];
                    rgbSum[i * 3 + 1] += data[i * 4 + 1];
                    rgbSum[i * 3 + 2] += data[i * 4 + 2];
                }
            }
        }
    
        // Scale if any channel is over 255 at any pixel
        // 1. Find max value at each pixel
        for (let i = 0; i < width * height; i++) {
            const r = rgbSum[i * 3 + 0];
            const g = rgbSum[i * 3 + 1];
            const b = rgbSum[i * 3 + 2];
            const maxVal = Math.max(r, g, b);
            let scale = 1;
            if (maxVal > 255) scale = 255.0 / maxVal;
    
            rgbSum[i * 3 + 0] *= scale;
            rgbSum[i * 3 + 1] *= scale;
            rgbSum[i * 3 + 2] *= scale;
        }
    
        // Output to image
        const finalData = ctx.createImageData(width, height);
        for (let i = 0; i < width * height; i++) {
            finalData.data[i * 4 + 0] = Math.min(Math.round(rgbSum[i * 3 + 0]), 255);
            finalData.data[i * 4 + 1] = Math.min(Math.round(rgbSum[i * 3 + 1]), 255);
            finalData.data[i * 4 + 2] = Math.min(Math.round(rgbSum[i * 3 + 2]), 255);
            finalData.data[i * 4 + 3] = 255;
        }
        ctx.putImageData(finalData, blitPosition[0], blitPosition[1]);
    }
    
    
    
}
