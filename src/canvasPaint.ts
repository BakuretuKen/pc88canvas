// import { colors } from './colors';
import { formatLineText } from './loadData';
import { colorPalette } from './canvasPalette';

// 極小ウェイト用スリープ関数
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export default async function canvasPaint(canvas: HTMLCanvasElement, allLines: string[]): Promise<void>
{
    const ctx = canvas.getContext("2d", { willReadFrequently: true }) as CanvasRenderingContext2D;
    const w = canvas.width, h = canvas.height;

    // ピクセル単位の正確な描画のための設定
    ctx.imageSmoothingEnabled = false;
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;

    if (allLines) await paintAreas(allLines);

    async function floodFillJ(sx: number, sy: number, fillColor1: number[], fillColor2: number[], delay: number) {
        const img = ctx.getImageData(0, 0, w, h);
        const data = img.data;
        const base = (sy * w + sx) * 4;
        const target = [data[base], data[base+1], data[base+2], data[base+3]];
        if (match(target, fillColor1) || match(target, fillColor2)) return;

        // スタックではなくキューを使う（FIFO）
        const queue = [[sx, sy]];
        const GRID_SIZE = 2; // 格子のサイズを小さくする

        while (queue.length) {
            const [x, y] = queue.shift() as [number, number];

            let xL = x, xR = x;
            while (xL > 0 && matchPixel(data, xL - 1, y, target)) xL--;
            while (xR < w - 1 && matchPixel(data, xR + 1, y, target)) xR++;

            // 格子状に塗りつぶし
            for (let xi = xL; xi <= xR; xi++) {
                const isEvenGrid = Math.floor(xi / GRID_SIZE) % 2 === Math.floor(y / GRID_SIZE) % 2;
                const fillColor = isEvenGrid ? fillColor1 : fillColor2;

                // ピクセルデータを直接更新
                const p = (y * w + xi) * 4;
                data[p]   = fillColor[0];
                data[p+1] = fillColor[1];
                data[p+2] = fillColor[2];
                data[p+3] = fillColor[3];
            }

            // 一括で描画を更新
            ctx.putImageData(img, 0, 0);

            await sleep(delay);

            for (const ny of [y - 1, y + 1]) {
                if (ny < 0 || ny >= h) continue;
                let inSeg = false, segStart = 0;
                for (let xi = xL; xi <= xR + 1; xi++) {
                    if (xi <= xR && matchPixel(data, xi, ny, target)) {
                        if (!inSeg) { inSeg = true; segStart = xi; }
                    } else if (inSeg) {
                        queue.push([Math.floor((segStart + (xi - 1)) / 2), ny]);
                        inSeg = false;
                    }
                }
            }
        }
    }

    function match(a: number[], b: number[]) {
        return a[0] === b[0] &&
                a[1] === b[1] &&
                a[2] === b[2] &&
                a[3] === b[3];
    }

    function matchPixel(data: Uint8ClampedArray, x: number, y: number, target: number[]) {
        const i = (y * w + x) * 4;
        return data[i]   === target[0] &&
                data[i+1] === target[1] &&
                data[i+2] === target[2] &&
                data[i+3] === target[3];
    }

    async function paintAreas(allLines: string[])
    {
        for (const line of allLines) {
            const lines = formatLineText(line);
            if (lines[0][0] !== 'P') continue;

            // P x,y 5 6
            const x = Number(lines[1][0]);
            const y = Number(lines[1][1]);
            const colorIndex1 = Number(lines[2][0]);
            const colorIndex2 = Number(lines[3]?.[0] || colorIndex1); // 2つ目の色が指定されていない場合は1つ目の色を使用

            // console.log("P (" + x + "," + y + ") " + colorIndex1 + " " + colorIndex2);
            await floodFillJ(x, y, colorPalette.colors[colorIndex1], colorPalette.colors[colorIndex2], 1);
        }
    }
}