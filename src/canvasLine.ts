import { loadData, formatLineText } from './loadData';
import { colorPalette } from './canvasPalette';

export default async function canvasLine(canvas: HTMLCanvasElement, allLines: string[]): Promise<void>
{
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;

    if (allLines) await drawWithDelay(allLines);

    async function drawWithDelay(allLines: string[]) {
        const delayEvery = 8; // 何点ごとにウェイトを入れるか
        const delayMs = 1;    // ウェイト時間（ms）

        for (const line of allLines) {
            const lines = formatLineText(line);
            if (lines.length < 2) continue;
            if (lines[0][0] === 'P') continue;
            if (lines[0][0] === 'SET') continue;

            if (lines[0][1] === undefined) {
                console.log("line: "+lines[0][0]);
                const color = colorPalette.colors[Number(lines[0][0])];
                ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3] / 255})`;
            } else {
                ctx.strokeStyle = "black";
            }

            ctx.beginPath();
            ctx.moveTo(Number(lines[0][0]), Number(lines[0][1]));
            for (let i = 1; i < lines.length; i++) {
                ctx.lineTo(Number(lines[i][0]), Number(lines[i][1]));
                ctx.stroke();

                if (i % delayEvery === 0) {
                    await new Promise(resolve => setTimeout(resolve, delayMs));
                }
            }
        }
    }
}
