export function randomOtp(): number {
    const randomNum = Math.random() * 9000;
    return Math.floor(1000 + randomNum);
}

export const isUrlValid = (data: string) =>
    /[(http(s)?)://(www.)?a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/gi.test(
        data,
    );
