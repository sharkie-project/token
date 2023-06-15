import { writeFileSync } from "fs";

export const genFileName = () => {
    const dateNow = new Date();
    const hours = dateNow.getHours();
    const month = dateNow.getUTCMonth() + 1; //months from 1-12
    const day = dateNow.getUTCDate();
    const year = dateNow.getUTCFullYear();
    return `${day}-${month}-${year} ${hours}`
}

