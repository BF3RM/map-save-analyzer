import DropzoneComponent from "./Components/DragDrop"
import React from "react"
import "./App.css"

export default function App() {
    const [details, setDetails] = React.useState(null)
    const [spawnedItems, setSpawnedItems] = React.useState(null)
    const [nameFilter, setNameFilter] = React.useState(null) 

    function showUploadedFile(payload) {
        setDetails(() => payload)
        setSpawnedItems(() => payload.spawnedItems)
    }

    function sortSpawnedItems(){

    }

    function handleSearchChange(e) {
        setNameFilter(() => e.target.value)
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
                    <h1>Details</h1>
                    <div>
                        <h2>Project name: {details.projectName}</h2>
                        <p>Map: {details.mapName}</p>
                        <p>Game Mode:  {details.gameModeName}</p>
                        <p>Save version: {details.saveVersion}</p>
                    </div>
                    
                    <table className="spawnedItemsTable">
                        <caption>
                            FILTER RESULTS: <input type="text" onChange={handleSearchChange} value={nameFilter}></input>
                        </caption>
                        <thead>
                            <tr>
                            <th scope="col">Selected</th>
                            <th scope="col">Item Name</th>
                            <th scope="col">Amount</th>
                            <th scope="col">GUID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {spawnedItems.map((item, index) => {
                                return (
                                    <tr key={index}>
                                        <input className="checkBoxes" type="checkbox" />
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