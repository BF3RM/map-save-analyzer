const express = require("express")
const app = express()
const fs = require("fs")
const port = 5000
const path = require("path")
const cors = require("cors")
const multer = require("multer")
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

const partialSaves = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, path.resolve(__dirname, "MapSaves", "PartialSaves"))
    } ,
    filename: function (req, file, callback) {
        // const date = new Date()
        // const dateStamp = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}_`
        // callback(null, dateStamp + file.originalname)
        callback(null, file.originalname)
    }
})

const uploads = multer({storage: rawSaves})

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

    const pathName = path.join(__dirname, "MapSaves", directory, filename)
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
        const excludedPath = path.join(__dirname, "MapSaves", "ModifiedSaves", `ALL-REMOVED-ITEMS_${filename}`)
        const normalPath = path.join(__dirname, "MapSaves", "ModifiedSaves", `NORMAL-ITEMS_${filename}`)

        fs.writeFileSync(excludedPath, JSON.stringify(dirtyObject))
        fs.writeFileSync(normalPath, JSON.stringify(cleanObject))
        return res.send("JOB IS DONE. REFRESH TO CHECK NEW FILES!!!")
    } else {
        console.error(`Mismatch in item counts. ${numObjects.cleanLen} + ${numObjects.dirtyLen} !== ${numObjects.originalLen}`)
        res.status(500).send("ERROR")
    }
})

app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'))
})