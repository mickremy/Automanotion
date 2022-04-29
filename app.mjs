import * as fs from "fs";
import dotenv from "dotenv";
import fetch from "node-fetch";
import cron from "node-cron";

dotenv.config();

let locale = process.env.LOCALE || "en";
let timeZone = process.env.TIMEZONE || "Etc/UTC";

const getSpaces = async (token) => {
    const res = await fetch("https://www.notion.so/api/v3/getSpaces", {
        method: "POST", body: JSON.stringify({}), headers: {
            "Cookie": `token_v2=${token};`, "Content-Type": "application/json",
        }
    });
    const json = await res.json();

    let spacesIds = [];
    for (const user in json) {
        /** @property {Object} space - notion space */
        for (const space in json[user].space) {
            spacesIds.push(space)
        }
    }
    return spacesIds;
};

const exportSpace = async (token, spaceId, exportType) => {
    console.log(`[Notion] ${exportType} export starting...`);

    const exportTask = {
        task: {
            eventName: "exportSpace", request: { spaceId, exportOptions: { locale, timeZone, exportType } },
        },
    };

    const enqueueTaskResponse = await fetch("https://www.notion.so/api/v3/enqueueTask", {
        method: "POST",
        body: JSON.stringify(exportTask),
        headers: { "Cookie": `token_v2=${token};`, "Content-Type": "application/json" }
    });

    const { taskId } = await enqueueTaskResponse.json();

    return await new Promise((resolve, reject) => {
        const interval = setInterval(async () => {
            const response = await fetch("https://www.notion.so/api/v3/getTasks", {
                method: "POST", body: JSON.stringify({ taskIds: [taskId] }), headers: {
                    "Cookie": `token_v2=${token};`, "Content-Type": "application/json",
                }
            });

            /**
             * @property {Object[]} results[] - array of tasks results
             * @property {Object} results[].status - status of one task result
             * @property {int} taskStatus.pagesExported - number of exported pages
             * @property {int} taskStatus.exportURL - URL of the export
             */
            const json = await response.json();
            const taskStatus = json.results[0].status;
            if (!taskStatus) {
                clearInterval(interval);
                reject(new Error(json));
            } else if (taskStatus.type === "complete") {
                clearInterval(interval);
                console.log(`[Notion] ${exportType} export successful ! (Pages exported: ${taskStatus.pagesExported})`);
                resolve(taskStatus.exportURL);
            }
        }, 1000);
    });
};

const downloadExport = async (url, exportType) => {
    console.log(`[Notion] ${exportType} export downloading...`);

    const path = `./data/${exportType}/`;
    const td = new Date().toISOString()
        .replace(/-/g, '')
        .replace(/T/, '_')
        .replace(/:/g, '')
        .replace(/\..+/, '')
    const fileName = `Export_${td}${url.match(/[\da-f-]+.zip/)[0]}`

    if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true });
    }

    const writeStream = fs.createWriteStream(path.concat(fileName));
    const response = await fetch(url);
    response.body.pipe(writeStream);

    await new Promise((executor) => {
        response.body.on("end", executor);
    });

    console.log(`[Notion] ${exportType} export download successful !`);
};

const startExportTask = async () => {
    let token = process.env.TOKEN;
    if (!token) {
        console.error(`[Notion] token not defined`);
        process.exit(1)
    }

    let exportType = process.env.EXPORT_TYPE || "html+markdown";

    const spaces = await getSpaces(token);
    await Promise.all(spaces.map(async (spaceId) => {
        switch (exportType) {
            case "html": {
                let htmlUrl = await exportSpace(token, spaceId, "html");
                await downloadExport(htmlUrl, "html");

                break;
            }

            case "markdown": {
                let mdUrl = await exportSpace(token, spaceId, "markdown");
                await downloadExport(mdUrl, "markdown");

                break;
            }

            case "html+markdown": {
                let htmlUrl = await exportSpace(token, spaceId, "html");
                await downloadExport(htmlUrl, "html");

                let mdUrl = await exportSpace(token, spaceId, "markdown");
                await downloadExport(mdUrl, "markdown");

                break;
            }

            default: {
                console.error(`[Notion] Export of type ${exportType} not supported !`);
                process.exit(1)
            }
        }
    }));
}

(async () => {
    let cronExpression = process.env.CRON;
    if (!cronExpression) {
        console.log(`[Notion] No cron expression defined executing export once.`);
        await startExportTask();
    } else {
        console.log(`[Notion] Execution export with cron expression (${cronExpression})`);

        cron.schedule(cronExpression, () => {
            (async () => {
                await startExportTask();
            })();
        }, timeZone);
    }
})();