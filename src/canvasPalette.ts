import { loadData, formatLineText } from './loadData';

export type ColorType = [number, number, number, number];

class ColorPalette {
    private static instance: ColorPalette;
    // NEC PC8801 のカラーパレット
    private _colors: ColorType[] = [
        [0, 0, 0, 255],      // 0: 黒
        [0, 0, 255, 255],    // 1: 青
        [255, 0, 0, 255],    // 2: 赤
        [255, 0, 255, 255],  // 3: 紫
        [0, 255, 0, 255],    // 4: 緑
        [0, 255, 255, 255],  // 5: 水色
        [255, 255, 0, 255],  // 6: 黄
        [255, 255, 255, 255] // 7: 白
    ];
    private listeners: ((colors: ColorType[]) => void)[] = [];

    private constructor() {}

    static getInstance(): ColorPalette {
        if (!ColorPalette.instance) {
            ColorPalette.instance = new ColorPalette();
        }
        return ColorPalette.instance;
    }

    get colors(): ColorType[] {
        return [...this._colors];
    }

    setColor(index: number, color: ColorType): void {
        if (index >= 0 && index < this._colors.length) {
            this._colors[index] = [...color];
            this.notifyListeners();
        }
    }

    addChangeListener(listener: (colors: ColorType[]) => void): void {
        this.listeners.push(listener);
    }

    removeChangeListener(listener: (colors: ColorType[]) => void): void {
        this.listeners = this.listeners.filter(l => l !== listener);
    }

    private notifyListeners(): void {
        const colors = this.colors;
        this.listeners.forEach(listener => listener(colors));
    }
}

export const colorPalette = ColorPalette.getInstance();

// カラーパレットの変更
// SET 色番号 R G B（RGBは 0〜256）
export default async function canvasPalette(canvas: HTMLCanvasElement, allLines: string[]): Promise<void>
{
    if (allLines) await setPalette(allLines);

    async function setPalette(allLines: string[])
    {
        for (const line of allLines) {
            const lines = formatLineText(line);
            if (lines[0][0] !== 'SET') continue;

            // P x,y 5
            const colorIndex = Number(lines[1][0]);
            const r = Number(lines[2][0]);
            const g = Number(lines[3][0]);
            const b = Number(lines[4][0]);

            console.log("SET[" + colorIndex+"] "+ r, g, b);
            colorPalette.setColor(colorIndex, [r, g, b, 255]);
        }
    }
}