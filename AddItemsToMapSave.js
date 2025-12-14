const fs = require("fs");
const path = require("path");
const uuidv4 = require("uuid").v4;

const items = {
    sandbags: {
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
    },
    razorwire: {
        guid: "EC3E4D59-2583-491B-9B28-CEDEFFA922EA",
        transform: {
            left: {
                x: 1,
                y: 0,
                z: 0,
            },
            up: {
                x: 0,
                y: 0,
                z: -1,
            },
            forward: {
                x: 0,
                y: 1,
                z: 0,
            },
            trans: {
                x: 100.604,
                y: -6000,
                z: -91.209,
            },
        },
        origin: 2,
        name: "Props/StreetProps/RazorWire_01/RazorWire_01",
        blueprintCtrRef: {
            typeName: "ObjectBlueprint",
            instanceGuid: "90F7C75D-FC31-11DD-9978-FE37F49D451C",
            partitionGuid: "90F7C75C-FC31-11DD-9978-FE37F49D451C",
            name: "Props/StreetProps/RazorWire_01/RazorWire_01",
        },
    },
    hescobarrier: {
        guid: "EC3E4D59-2583-491B-9B28-CEDEFFA922EB",
        transform: {
            left: {
                x: 1,
                y: 0,
                z: 0,
            },
            up: {
                x: 0,
                y: 0,
                z: -1,
            },
            forward: {
                x: 0,
                y: 1,
                z: 0,
            },
            trans: {
                x: 100.604,
                y: -7000,
                z: -91.209,
            },
        },
        origin: 2,
        name: "Objects/HescoBarrier_01/HescoBarrier_01",
        blueprintCtrRef: {
            typeName: "ObjectBlueprint",
            instanceGuid: "e0ed4088-cfba-4c7c-f773-8a088d542124",
            partitionGuid: "1248b1b2-851a-11e0-b3a9-c8fa83dbc836",
            name: "Objects/HescoBarrier_01/HescoBarrier_01",
        },
    },
};

(() => {
    const args = process.argv.slice(2);

    console.log(args);

    const itemObjectToAdd = items[args[0]];
    let itemCount = 200;
    console.log(args[1]);
    if (args[1]) {
        itemCount = Number(args[1]);
    }
    if (itemCount <= 0) {
        console.error("Please enter itemCount greater than 0");
        return;
    }
    if (itemObjectToAdd === undefined) {
        console.error("That item is not supported");
        return;
    }

    var dir = path.resolve(__dirname, args[0]);

    if (!fs.existsSync(dir)) {
        console.log(dir);
        fs.mkdirSync(dir);
        fs.mkdirSync(path.resolve(dir, "before"));
        fs.mkdirSync(path.resolve(dir, "after"));
        console.log("Making Directories");
        return;
    }

    try {
        const sourcePathName = path.resolve(dir, "before");
        const outputPathName = path.resolve(dir, "after");
        const mapSaveNames = fs.readdirSync(sourcePathName);
        mapSaveNames.forEach((fileName) => {
            const info = JSON.parse(
                fs.readFileSync(path.join(sourcePathName, fileName))
            );

            const guids = {};
            const newItemsArray = [];
            let existingObjectsCount = 0;

            for (let i = 0; i < info.data.length; i++) {
                const item = info.data[i];
                guids[item.guid] = true;
                if (item.name === itemObjectToAdd.name) {
                    if (item.transform.trans.y === itemObjectToAdd.transform.trans.y) {
                        existingObjectsCount++;
                    }
                }
            }
            if (existingObjectsCount >= itemCount) {
                console.log(
                    `${fileName} already has ${itemCount} of ${itemObjectToAdd.name}`
                );
                return;
            }

            for (let i = 0; i < itemCount; i++) {
                let newObjectGuid = uuidv4().toUpperCase();
                while (guids[newObjectGuid] !== undefined) {
                    newObjectGuid = uuidv4().toUpperCase();
                }
                guids[newObjectGuid] = true;
                newItemsArray.push({ ...itemObjectToAdd, guid: newObjectGuid });
            }

            info.data.push(...newItemsArray);

            fs.writeFileSync(
                path.join(outputPathName, fileName),
                JSON.stringify(info, null, "\t")
            );
        });
    } catch (e) {
        console.log(e);
    }
})();
