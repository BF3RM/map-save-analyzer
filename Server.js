const express = require("express")
const app = express()
const fs = require("fs")
const port = 5000
const path = require("path")
const cors = require("cors")
const multer = require("multer")
const uuidv4 = require("uuid").v4
app.use(cors())
app.use(express.json())



const rawSaves = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, path.resolve(__dirname, "MapSaves", "OriginalSaves"))
    } ,
    filename: function (req, file, callback) {
        const date = new Date()
        const dateStamp = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}_`
        callback(null, dateStamp + file.originalname)
        // file.originalname.split(".")[0] + ".json"
        // callback(null, file.originalname)
    }
})

const modifiedSaves = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, path.resolve(__dirname, "MapSaves", "ModifiedSaves"))
    } ,
    filename: function (req, file, callback) {
        const date = new Date()
        const dateStamp = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}_`
        callback(null, dateStamp + file.originalname)
    }
})

const uploads = multer({storage: rawSaves})
const modified = multer({storage: modifiedSaves})

function getFileData(pathName) {
    const info = JSON.parse(fs.readFileSync(pathName))
    const objectCountsAsArrayOfObjects = []

    info.data.forEach((prop) => {
        const index = objectCountsAsArrayOfObjects.findIndex((item) => item.name === prop.name)
        if(index === -1)
        {
            objectCountsAsArrayOfObjects.push({
                name: prop.name,
                count: 1,
                guid: prop.guid
            })
        } else{
            objectCountsAsArrayOfObjects[index].count += 1
        }
    })
    
    objectCountsAsArrayOfObjects.sort((a, b) => {
        if (a.count < b.count) {
            return 1
        }
        if (a.count > b.count) {
            return -1
        }
        return 0
    })

    const payload = {
        spawnedItems: objectCountsAsArrayOfObjects,
        numItems: info.data.length,
        ...info.header
    }
    return payload
}

app.use(express.static(path.join(__dirname, "build")))
app.listen(port, () => {
    console.log(`listening on port ${port}`)
})
app.post("/api/newFile", uploads.array("files"), (req, res) => {
    const { name } = req.body

    // const pathName = path.resolve(__dirname, "MapSaves", "OriginalSaves", "sabalan-pipeline.json")
    // const payload = getFileData(pathName)

    res.send(`File [${name}] Uploaded`) 
})

app.post("/api/newModifiedFile", modified.array("files"), (req, res) => {
    const { name } = req.body

    res.send(`File [${name} Uploaded]`)
})

app.post("/api/getFileData", (req, res) => {
    const { directory, filename } = req.body
    const pathName = path.resolve(__dirname, "MapSaves", directory, filename)

    const payload = getFileData(pathName)
    res.json({payload, directory, filename})
})

app.post("/api/getFile", (req, res) => {
    const { directory, filename } = req.body
    const pathName = path.resolve(__dirname, "MapSaves", directory, filename)
    res.sendFile(pathName)
})

app.get("/api/directories", (req, res) => {
    try {
        const pathName = path.resolve(__dirname, "MapSaves")
        const directories = fs.readdirSync(pathName)
        

        const arrayOfDirectoriesAndFiles = directories.map((item) => {
            const innerPath = path.resolve(__dirname, "MapSaves", item)
            const innerFiles = fs.readdirSync(innerPath, {withFileTypes: true})
            .filter(item => !item.isDirectory())
            .map(item => item.name)
            return {
                directory: item,
                files: innerFiles
            }
        })
        
        res.send(arrayOfDirectoriesAndFiles)
      } catch(e) {
        console.log(e)
      }
})

app.post("/api/deleteObjects", (req, res) => {
    const blockedItemsArray = req.body.items
    const {directory, filename} = req.body

    const pathName = path.resolve(__dirname, "MapSaves", directory, filename)
    const fileData = JSON.parse(fs.readFileSync(pathName, "utf-8"))

    
    const cleanDataArr = fileData.data.filter((item) => {
        if(!blockedItemsArray.includes(item.name)){
            return item
        }
    })

    const dirtyDataArr = fileData.data.filter((item) => {
        if(blockedItemsArray.includes(item.name)){
            return item
        }
    })

    const cleanObject = {
        header: fileData.header,
        data: cleanDataArr
    }

    const dirtyObject = {
        header: fileData.header,
        data: dirtyDataArr
    }

    const numObjects = {
        originalLen: fileData.data.length,
        cleanLen: cleanDataArr.length,
        dirtyLen: dirtyDataArr.length,
        differenceAddsUp: (cleanDataArr.length === (fileData.data.length - dirtyDataArr.length))
    }

    if(numObjects.differenceAddsUp) {
        const excludedPath = path.join(__dirname, "MapSaves", "ModifiedSaves", `ONLY-REMOVED-ITEMS_${fileData.header.mapName}.json`)
        const normalPath = path.join(__dirname, "MapSaves", "ModifiedSaves", `NORMAL-ITEMS_${fileData.header.mapName}.json`)

        fs.writeFileSync(excludedPath, JSON.stringify(dirtyObject))
        fs.writeFileSync(normalPath, JSON.stringify(cleanObject))
        return res.send("JOB IS DONE. REFRESH TO CHECK NEW FILES!!!")
    } else {
        console.error(`Mismatch in item counts. ${numObjects.cleanLen} + ${numObjects.dirtyLen} !== ${numObjects.originalLen}`)
        res.status(500).send("ERROR")
    }
})

app.post("/api/deleteFile", (req, res) => {
    const { directory, filename } = req.body
    const pathName = path.resolve(__dirname, "MapSaves", directory, filename)
    fs.unlinkSync(pathName)
    res.send("Yep")
})

app.post("/api/mergeTwoFiles", (req, res) => {
    const { fileOne, fileTwo, desiredFileName } = req.body

    const path1 = path.resolve(__dirname, "MapSaves", fileOne.directory, fileOne.filename)
    const fileDataOne = JSON.parse(fs.readFileSync(path1, "utf-8"))

    const path2 = path.resolve(__dirname, "MapSaves", fileTwo.directory, fileTwo.filename)
    const fileDataTwo = JSON.parse(fs.readFileSync(path2, "utf-8"))

    if(fileDataOne.header.mapName === fileDataTwo.header.mapName && fileDataOne.header.gameMode === fileDataTwo.header.gameMode) {
        const combinedLengths = fileDataOne.data.length + fileDataTwo.data.length

        const header = {
            ...fileDataOne.header,
            ...fileDataTwo.header
        }
    
        const data = [...fileDataOne.data, ...fileDataTwo.data]
    
        if(data.length === combinedLengths) {
            const finalObj = JSON.stringify({ header, data })
            const uniqueCode = uuidv4()
            const name = !desiredFileName ? `${fileDataOne.header.mapName}_${uniqueCode}` : desiredFileName
            const finalPath = path.resolve(__dirname, "MapSaves", "MergedSaves", `${name}.json`)
            fs.writeFileSync(finalPath, finalObj)
            res.send("SUCCESSFULLY MADE FILE!!!")
        }        

    } else {
        return res.send("File header shows different maps or gamemodes. Cancelling merge.")
    }
})

app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'))
})