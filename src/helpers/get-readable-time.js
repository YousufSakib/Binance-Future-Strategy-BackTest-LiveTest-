export function getReadableTime(time) {
    const day = String(time.getDate()).padStart(2, 0);
    const month = String(time.getMonth()).padStart(2, 0);
    const year = time.getFullYear();
    const hours = String(time.getHours()).padStart(2, 0);
    const minutes = String(time.getMinutes()).padStart(2, 0);
    const seconds = String(time.getSeconds()).padStart(2, 0);

    return `${day}/${month}/${year};${hours}:${minutes}:${seconds}`;
}