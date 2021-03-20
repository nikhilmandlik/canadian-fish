export function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1) + min);
}

export function toCssClassName(name) {
    return name.replace(' ', '-').toLowerCase();
}
