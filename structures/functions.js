module.exports = {
    parseTime(time) {
        const regex = /\d+\.*\d*\D+/g;
        time = time.split(/\s+/).join("");
        let res;
        let duration = 0;
        while ((res = regex.exec(time)) !== null) {
            if (res.index === regex.lastIndex) {
                regex.lastIndex++;
            }
            const local = res[0].toLowerCase();
            if (local.endsWith("seconds") || local.endsWith("second") || (local.endsWith("s") && local.match(/\D+/)[0].length === 1)) {
                duration += parseInt(local.match(/\d+\.*\d*/)[0], 10) * 1000;
            }
            else if (local.endsWith("minutes") || local.endsWith("minute") || (local.endsWith("m") && local.match(/\D+/)[0].length === 1)) {
                duration += parseInt(local.match(/\d+\.*\d*/)[0], 10) * 60000;
            }
            else if (local.endsWith("hours") || local.endsWith("hour") || (local.endsWith("h") && local.match(/\D+/)[0].length === 1)) {
                duration += parseInt(local.match(/\d+\.*\d*/)[0], 10) * 3600000;
            }
            else if (local.endsWith("days") || local.endsWith("day") || (local.endsWith("d") && local.match(/\D+/)[0].length === 1)) {
                duration += parseInt(local.match(/\d+\.*\d*/)[0], 10) * 86400000;
            }
            else if (local.endsWith("weeks") || local.endsWith("week") || (local.endsWith("w") && local.match(/\D+/)[0].length === 1)) {
                duration += parseInt(local.match(/\d+\.*\d*/)[0], 10) * 604800000;
            }
            else if (local.endsWith("months") || local.endsWith("month")) {
                duration += parseInt(local.match(/\d+\.*\d*/)[0], 10) * 2628000000;
            }
            else if (local.endsWith("years") || local.endsWith("year") || (local.endsWith("y") && local.match(/\D+/)[0].length === 1)) {
                duration += parseInt(local.match(/\d+\.*\d*/)[0], 10) * 31557600000;
            }
        }
        if (duration === 0) {
            return null;
        }
        return duration;
    },
    formatTime(milliseconds, minimal = false) {
        if (!milliseconds || isNaN(milliseconds) || milliseconds <= 0) {
            throw new RangeError("Utils#formatTime(milliseconds: number) Milliseconds must be a number greater than 0");
        }
        if (typeof minimal !== "boolean") {
            throw new RangeError("Utils#formatTime(milliseconds: number, minimal: boolean) Minimal must be a boolean");
        }
        const times = {
            years: 0,
            months: 0,
            weeks: 0,
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
        };
        while (milliseconds > 0) {
            if (milliseconds - 31557600000 >= 0) {
                milliseconds -= 31557600000;
                times.years++;
            }
            else if (milliseconds - 2628000000 >= 0) {
                milliseconds -= 2628000000;
                times.months++;
            }
            else if (milliseconds - 604800000 >= 0) {
                milliseconds -= 604800000;
                times.weeks += 7;
            }
            else if (milliseconds - 86400000 >= 0) {
                milliseconds -= 86400000;
                times.days++;
            }
            else if (milliseconds - 3600000 >= 0) {
                milliseconds -= 3600000;
                times.hours++;
            }
            else if (milliseconds - 60000 >= 0) {
                milliseconds -= 60000;
                times.minutes++;
            }
            else {
                times.seconds = Math.round(milliseconds / 1000);
                milliseconds = 0;
            }
        }
        const finalTime = [];
        let first = false;
        for (const [k, v] of Object.entries(times)) {
            if (minimal) {
                if (v === 0 && !first) {
                    continue;
                }
                finalTime.push(v < 10 ? `0${v}` : `${v}`);
                first = true;
                continue;
            }
            if (v > 0) {
                finalTime.push(`${v} ${v > 1 ? k : k.slice(0, -1)}`);
            }
        }
        let time = finalTime.join(minimal ? ":" : ", ");
        if (time.includes(",")) {
            const pos = time.lastIndexOf(",");
            time = `${time.slice(0, pos)} and ${time.slice(pos + 1)}`;
        }
        return time;
    },
    generateRandomHex(size) {
        if (isNaN(Number(size))) return null;
        const genRanHex = [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        return genRanHex;
    }
};