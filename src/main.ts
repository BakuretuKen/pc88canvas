import canvasLine from './canvasLine';
import canvasPaint from './canvasPaint';
import { loadData } from './loadData';

let count = 0;

export async function initClickCounter(): Promise<void> {
    const output = document.getElementById('output') as HTMLParagraphElement;
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        output.textContent = `マウス座標: (${Math.round(x)}, ${Math.round(y)})`;
    });

    canvas.addEventListener('click', async (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = Math.round(e.clientX - rect.left);
        const y = Math.round(e.clientY - rect.top);
        const coordText = `${x},${y}`;

        try {
            await navigator.clipboard.writeText('P '+coordText);
            output.textContent = `座標をコピーしました: ${coordText}`;
        } catch (err) {
            output.textContent = 'クリップボードへのコピーに失敗しました';
            console.error('クリップボードへのコピーに失敗:', err);
        }
    });

    // data.txtからデータを読み込む関数
    const allLines = await loadData(canvas.dataset.src || 'data.txt');
    if (allLines) {
        // await canvasPalette(canvas, allLines);
        await canvasLine(canvas, allLines);
        await canvasPaint(canvas, allLines);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await initClickCounter();
});