export function approachNeverReach(input, target, k = 1000) {
    return target - (target * Math.exp(-input / k));
}
export function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
