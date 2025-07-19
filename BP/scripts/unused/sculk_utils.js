export function getDistance(pos1, pos2) {
    return Math.sqrt(
        Math.pow(pos1.x - pos2.x, 2) +
        Math.pow(pos1.y - pos2.y, 2) +
        Math.pow(pos1.z - pos2.z, 2)
    );
}

const WORLD_HEIGHT_MIN = -64;
const WORLD_HEIGHT_MAX = 320;

export function isValidPosition(pos) {
    return pos.y >= WORLD_HEIGHT_MIN && pos.y <= WORLD_HEIGHT_MAX;
}

// Выбор случайных элементов из массива
export function pickRandom(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}