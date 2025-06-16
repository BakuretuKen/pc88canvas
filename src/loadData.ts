export async function loadData(dataFileName: string) {
    try {
        const response = await fetch(dataFileName);
        const text = await response.text();
        return formatText(text);
    } catch (error) {
        console.error('データの読み込みに失敗しました: ' + dataFileName, error);
    }

    function formatText(text: string) {
        return text.split('\n').map(line => line.trim());
    }
}

export function formatLineText(text: string) {
    const linePoints = text.split(' ');
    let lines = [];
    for (const block of linePoints) {
        const points = block.split(',');
        lines.push([points[0], points[1]]);
    }

    return lines;
}
