const express = require("express")
const app = express()
const fs = require("fs")
const port = 5000
const path = require("path")
const cors = require("cors")
const multer = require("multer")
app.use(cors())



const storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, path.resolve(__dirname, "MapSaves", "RawSaves"))
    } ,
    filename: function (req, file, callback) {
        // const date = new Date()
        // const dateStamp = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}_`
        // callback(null, dateStamp + file.originalname)
        callback(null, file.originalname)
    }
})

const uploads = multer({storage: storage})


app.use(express.static(path.join(__dirname, "build")))
app.listen(port, () => {
    console.log(`listening on port ${port}`)
})
app.post("/api/file", uploads.array("files"), (req, res) => {
    const { name } = req.body

    const pathName = path.resolve(__dirname, "MapSaves", "RawSaves", name)
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

    res.json(payload) 
})
app.get("/tacos", (req, res) => {
    res.send("I like tacos")
})
app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'))
})