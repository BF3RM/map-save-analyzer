import DropzoneComponent from "./Components/DragDrop"
import React from "react"
import "./App.css"

export default function App() {
    const [details, setDetails] = React.useState(null)
    const [spawnedItems, setSpawnedItems] = React.useState(null)
    const [nameFilter, setNameFilter] = React.useState(null) 
    const [objectsToRemove, setObjectsToRemove] = React.useState([])

    function showUploadedFile(payload) {
        setDetails(() => payload)
        setSpawnedItems(() => payload.spawnedItems)
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

    function handleRemoveObjects() {
        // axios post to server
        // update details, and spawnedItems.
        console.table(objectsToRemove)
        const continueDelete = window.confirm(`Are you sure? This will delete: \n\n${objectsToRemove.join("\n\n")}`)
        console.log(continueDelete)
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

    return (
        <div className="App">
            {
               !details && <DropzoneComponent showUploadedFile={showUploadedFile}/>
            }
            {
                details && <>
                    <div className="heading">
                        <h2 className="example" id="myId">{details.projectName}</h2>
                        <p>Map: {details.mapName}</p>
                        <p>Game Mode:  {details.gameModeName}</p>
                        <p>Save version: {details.saveVersion}</p>
                    </div>
                    
                    <table className="spawnedItemsTable">
                        <caption>
                            FILTER RESULTS: <input type="text" onChange={handleSearchChange} value={nameFilter}></input> {objectsToRemove.length >= 1 && <button onClick={handleRemoveObjects}>DELETE SELECTED</button>}
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
                </>
            }
            
        </div>
    )
}