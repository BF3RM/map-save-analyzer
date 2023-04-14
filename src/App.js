import DropzoneComponent from "./Components/DragDrop"
import React from "react"
import "./App.css"
import { deleteItems, getDirectories, getFileData, getFile, deleteFile, mergeTwoFiles } from "./api/helper"

export default function App() {
    const [details, setDetails] = React.useState(null)
    const [spawnedItems, setSpawnedItems] = React.useState(null)
    const [nameFilter, setNameFilter] = React.useState(null) 
    const [objectsToRemove, setObjectsToRemove] = React.useState([])
    const [filesOnServer, setFilesOnServer] = React.useState([])
    const [currentFileDetails, setCurrentFileDetails] = React.useState({})
    const [merge, setMerge] = React.useState(null)

    React.useEffect(() => {
        updateDirectories()
    }, [])

    async function updateDirectories () {
        const data = await getDirectories()
        if(!data) {
            return
        } else {
            console.log(data)
            const filteredData = [...data.filter((item) => item.files.length > 0)]
            setFilesOnServer(filteredData)
        }
    }

    function sortSpawnedItems(e){
        // 25b2 is UP
        // 25BC is DOWN
        if(e.target.innerText === "\u25BC")
        {
            e.target.innerText = "\u25B2"
            let tempArr = [...spawnedItems].sort((a, b) => {
                if (a.count > b.count) {
                    return 1
                }
                if (a.count < b.count) {
                    return -1
                }
                return 0
            })
            setSpawnedItems(() => tempArr)
        } else {
            e.target.innerText = "\u25BC"
            let tempArr = [...spawnedItems].sort((a, b) => {
                if (a.count < b.count) {
                    return 1
                }
                if (a.count > b.count) {
                    return -1
                }
                return 0
            })
            setSpawnedItems(() => tempArr)
        }
        
    }

    function handleSearchChange(e) {
        setNameFilter(() => e.target.value)
    }

    function handleCheckBox(name) {
        let arr = [...objectsToRemove]
        let index = arr.findIndex((item) => item === name)
        if(index === -1){
            arr.push(name)
            setObjectsToRemove(() => [...arr])
        } else {
            arr = arr.filter((item, curIndex) => {
                if(curIndex !== index ) {
                    return item
                }
            })
            setObjectsToRemove(() => [...arr])
        }
    }

    async function openFileInSameTab(dataObject) {
        await getFile(dataObject)
    }

    async function handleRemoveObjects() {
        // axios post to server
        // update details, and spawnedItems.
        console.table(objectsToRemove)
        const continueDelete = window.confirm(`Are you sure? This will delete: \n\n${objectsToRemove.join("\n\n")}`)
        if (continueDelete) {
            const payload = {
                items: objectsToRemove,
                directory: currentFileDetails.directory,
                filename: currentFileDetails.filename 
            }
            await deleteItems({...payload})
            window.location.href = "/"
        }
    }

    React.useEffect(() => {
        if(nameFilter !== null && nameFilter !== undefined){
            const regex = new RegExp(nameFilter, 'gi')
            const newArr = [...details.spawnedItems].filter((item) => {
                return item.name.match(regex)
            })
            setSpawnedItems(() => newArr)
        }
    }, [nameFilter])

    async function openFile(dataObject){
        const {directory, filename} = dataObject
        if(directory && filename) {
            const {payload, filename, directory} = await getFileData(dataObject)
            // showUploadedFile(data)
            setDetails(() => payload)
            setSpawnedItems(() => payload.spawnedItems)
            const newObj = {
                filename, directory
            }
            setCurrentFileDetails(() => newObj)
        }
        console.log(directory, filename)
    }

    async function deleteGivenFile(dataObject) {
        const confirmDeletion = window.confirm(`This will delete: [${dataObject.filename}] from [/${dataObject.directory}]. This action CANNOT BE UNDONE. Are you sure?`)
        if(confirmDeletion) {
            await deleteFile(dataObject)
            await updateDirectories()
        }
    }

    function clearState() {
        setDetails(() => null)
        setSpawnedItems(() => null)
        setNameFilter(() => null)
        setObjectsToRemove(() => [])
        setCurrentFileDetails(() => {})
        setMerge(null)
    }

    async function pickSecondFile(dataObject) {
        if(dataObject.filename === currentFileDetails.filename && currentFileDetails.directory === dataObject.directory) {
            console.log(dataObject)
            console.log(currentFileDetails)
            alert("Cannot merge file with itself. Pick a different file.")
            return
        }

        const desiredFileName = window.prompt("Enter a name (Server will add extension)")
        const confirmMerge = window.confirm(`This will merge: [${currentFileDetails.filename}] from [${currentFileDetails.directory}]\n\n[${dataObject.filename}] from [${dataObject.directory}]\n\n Will store in a file called [${desiredFileName}.json] `)
        if (confirmMerge) {
            const fileOne = {...currentFileDetails}
            const fileTwo = {...dataObject}
            const fileObj = {fileOne, fileTwo, desiredFileName}
            console.log(fileObj)
            const resp = await mergeTwoFiles(fileObj)
            setTimeout(() => {
                window.location.href = "/"
            }, 1)
            alert(resp)
        }
    }

    return (
        <div className="App">
            {
                !details && <div>
                    <h1>BF3RM Map Save Analyzer</h1>
                    <div className="flexContainer">
                        <DropzoneComponent showUploadedFile={updateDirectories}/>
                        <h2>OR</h2>
                        <div>
                            <h3>Select Prior Save</h3>
                            <div className="priorSaves">
                                {
                                    filesOnServer.map((parent, index) => {
                                    return <div key={index} className="priorSaveGroup">

                                            <div className="directoryName">
                                                <p>/{parent.directory}</p>
                                            </div>

                                            {parent.files.map((item, index) => 
                                            <div key={index} className="priorSaves--oneSave">
                                                    <button onClick={() => {deleteGivenFile({directory: parent.directory, filename: item})}}>DELETE FILE</button>
                                                    <p>{item}</p>
                                                    <button onClick={() => {openFile({directory: parent.directory, filename: item})}}>LOAD</button>
                                                    <button onClick={() => {openFileInSameTab({directory: parent.directory, filename: item})}}>GET JSON</button>
                                                </div>)}
                                            </div>
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            }
            {
                details && <>
                    <div className="heading">
                        <h2 className="example" id="myId">{details.projectName}</h2>
                        <p>Map: {details.mapName}</p>
                        <p>Game Mode:  {details.gameModeName}</p>
                        <p>Save version: {details.saveVersion}</p>
                        <button style={{padding: "1rem" }} onClick={() => {clearState()}}>BACK</button>
                        <button style={{padding: "1rem" }} onClick={() => {setMerge(() => true)}}>MERGE WITH ANOTHER SAVE</button>
                    </div>
                    
                    { !merge && 
                        <table className="spawnedItemsTable">
                            <caption>
                                FILTER RESULTS: <input type="text" onChange={handleSearchChange} value={nameFilter}></input> {objectsToRemove.length >= 1 && <button style={{padding: "1rem"}} onClick={handleRemoveObjects}>DELETE SELECTED</button>} 
                                <div>{details.numItems} Items in {details.mapName}</div>
                            </caption>
                            <thead>
                                <tr>
                                <th scope="col">Selected</th>
                                <th scope="col">Item Name</th>
                                <th scope="col">Amount <button onClick={sortSpawnedItems}>{`\u25BC`}</button></th>
                                <th scope="col">GUID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {spawnedItems.map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            <td><input className="checkBoxes" type="checkbox" onClick={() => {handleCheckBox(item.name)}} /></td>
                                            <td className="itemName" key={index + "name"}>
                                                {item.name}
                                                </td>
                                            <td className="count" key={index + "count"}>{item.count}</td>
                                            <td key={index + "GUID"}>{item.guid}</td>
                                        </tr> 
                                    )
                                })}
                            </tbody>
                        </table>    
                    }

                    { merge && <>
                        <h1>Current file: /{currentFileDetails.directory}/{currentFileDetails.filename}</h1>
                        {
                            filesOnServer.map((parent, index) => {
                                return <div key={index} className="priorSaveGroup">

                                        <div className="directoryName">
                                            <p>/{parent.directory}</p>
                                        </div>

                                        {parent.files.map((item, index) => 
                                        <div key={index} className="priorSaves--oneSave">
                                                <button onClick={() => {pickSecondFile({directory: parent.directory, filename: item})}}>MERGE</button>
                                                <p>{item}</p>
                                            </div>)}
                                        </div>
                            })
                        }
                    </>
                    }
                </>
            }
        </div>
    )
}