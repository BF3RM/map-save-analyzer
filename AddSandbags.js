const fs = require("fs");
const path = require("path");
const uuidv4 = require("uuid").v4;

const info = JSON.parse(
    fs.readFileSync(
        path.join(__dirname, "sandbags", "before", "XP1_001_Karkand.json")
    )
);

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

for (let i = 0; i < info.data.length; i++) {
    const item = info.data[i];
    guids[item.guid] = true;
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
    path.join(__dirname, "sandbags", "after", "XP1_001_Karkand.json"),
    JSON.stringify(info)
);
