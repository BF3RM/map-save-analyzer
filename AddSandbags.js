const fs = require("fs");
const path = require("path");
const uuidv4 = require("uuid").v4;

try {
    const sourcePathName = path.resolve(__dirname, "sandbags", "before");
    const outputPathName = path.resolve(__dirname, "sandbags", "after");
    const mapSaveNames = fs.readdirSync(sourcePathName);
    mapSaveNames.forEach((fileName) => {
        const info = JSON.parse(
            fs.readFileSync(path.join(sourcePathName, fileName))
        );

        if (info.data[1] === undefined) {
            console.log(`${fileName} has no objects.`);
            return;
        }

        const defaultSandbag = {
            origin: 2,
            name: "Objects/Sandbags/Sandbags_Wall_Straight",
            transform: {
                left: {
                    x: 1,
                    y: 0,
                    z: 0,
                },
                up: {
                    x: 0,
                    y: 1,
                    z: 0,
                },
                forward: {
                    x: 0,
                    y: 0,
                    z: 1,
                },
                trans: {
                    x: 14.253,
                    y: -5000,
                    z: -31.83,
                },
            },
            guid: "82C92C4A-348D-858A-C9C7-D262F31D4D33",
            blueprintCtrRef: {
                partitionGuid: "41864ADA-4E14-11E0-910C-967BA89DB923",
                typeName: "ObjectBlueprint",
                instanceGuid: "C68519A0-10A8-2B56-42B6-B69F75306F44",
                name: "Objects/Sandbags/Sandbags_Wall_Straight",
            },
        };

        const guids = {};
        const sandbags = [];
        let existingSandbagCount = 0;

        for (let i = 0; i < info.data.length; i++) {
            const item = info.data[i];
            guids[item.guid] = true;
            if (item.name === "Objects/Sandbags/Sandbags_Wall_Straight") {
                existingSandbagCount++;
            }
        }
        if (existingSandbagCount >= 200) {
            console.log(`${fileName} already has sandbags`);
            return;
        }

        for (let i = 0; i < 200; i++) {
            let newSandbagGuid = uuidv4().toUpperCase();
            while (guids[newSandbagGuid] !== undefined) {
                newSandbagGuid = uuidv4().toUpperCase();
            }
            guids[newSandbagGuid] = true;
            sandbags.push({ ...defaultSandbag, guid: newSandbagGuid });
        }

        info.data.push(...sandbags);

        fs.writeFileSync(
            path.join(outputPathName, fileName),
            JSON.stringify(info, null, "\t")
        );
    });
} catch (e) {
    console.log(e);
}
