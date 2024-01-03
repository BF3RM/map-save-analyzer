import DropzoneComponent from "./Components/DragDrop";
import React from "react";
import "./App.css";
import {
    deleteItems,
    getDirectories,
    getFileData,
    getFile,
    deleteFile,
    mergeTwoFiles,
} from "./api/helper";
import ItemList from "./Components/ItemList";
import ItemListHeader from "./Components/ItemListHeader";
import SaveFileMerger from "./Components/SaveFileMerger";
import HomeView from "./Components/HomeView";

export default function App() {
    const [details, setDetails] = React.useState(null);
    const [spawnedItems, setSpawnedItems] = React.useState(null);
    const [nameFilter, setNameFilter] = React.useState("");
    const [objectsToRemove, setObjectsToRemove] = React.useState([]);
    const [filesOnServer, setFilesOnServer] = React.useState([]);
    const [currentFileDetails, setCurrentFileDetails] = React.useState({});
    const [view, setView] = React.useState("home");

    React.useEffect(() => {
        updateDirectories();
    }, []);

    React.useEffect(() => {
        console.log(spawnedItems);
    }, [spawnedItems]);

    async function updateDirectories() {
        const data = await getDirectories();
        if (!data) {
            return;
        } else {
            console.log(data);
            const filteredData = [
                ...data.filter((item) => item.files.length > 0),
            ];
            setFilesOnServer(filteredData);
        }
    }

    function sortSpawnedItems(e) {
        // 25b2 is UP
        // 25BC is DOWN
        if (e.target.innerText === "\u25BC") {
            e.target.innerText = "\u25B2";
            let tempArr = [...spawnedItems].sort((a, b) => {
                if (a.count > b.count) {
                    return 1;
                }
                if (a.count < b.count) {
                    return -1;
                }
                return 0;
            });
            setSpawnedItems(() => tempArr);
        } else {
            e.target.innerText = "\u25BC";
            let tempArr = [...spawnedItems].sort((a, b) => {
                if (a.count < b.count) {
                    return 1;
                }
                if (a.count > b.count) {
                    return -1;
                }
                return 0;
            });
            setSpawnedItems(() => tempArr);
        }
    }

    function handleSearchChange(e) {
        setNameFilter(() => e.target.value);
    }

    function handleCheckBox(name) {
        let arr = [...objectsToRemove];
        let index = arr.findIndex((item) => item === name);
        if (index === -1) {
            arr.push(name);
            setObjectsToRemove(() => [...arr]);
        } else {
            arr = arr.filter((item, curIndex) => {
                if (curIndex !== index) {
                    return item;
                }
            });
            setObjectsToRemove(() => [...arr]);
        }
    }

    async function openFileInSameTab(dataObject) {
        await getFile(dataObject);
    }

    async function handleRemoveObjects() {
        // axios post to server
        // update details, and spawnedItems.
        console.table(objectsToRemove);
        const continueDelete = window.confirm(
            `Are you sure? This will delete: \n\n${objectsToRemove.join(
                "\n\n"
            )}`
        );
        if (continueDelete) {
            const payload = {
                items: objectsToRemove,
                directory: currentFileDetails.directory,
                filename: currentFileDetails.filename,
            };
            await deleteItems({ ...payload });
            window.location.href = "/";
        }
    }

    React.useEffect(() => {
        if (typeof nameFilter === "string" && nameFilter.length > 0) {
            const regex = new RegExp(nameFilter, "gi");
            const newArr = [...details.spawnedItems].filter((item) => {
                return item.name.match(regex);
            });
            setSpawnedItems(() => newArr);
        }
    }, [nameFilter]);

    async function openFile(dataObject) {
        const { directory, filename } = dataObject;
        if (directory && filename) {
            const { payload, filename, directory } = await getFileData(
                dataObject
            );
            // showUploadedFile(data)
            setDetails(() => payload);
            setSpawnedItems(() => payload.spawnedItems);
            const newObj = {
                filename,
                directory,
            };
            setCurrentFileDetails(() => newObj);
            setView(() => "details");
        }
    }

    async function deleteGivenFile(dataObject) {
        const confirmDeletion = window.confirm(
            `This will delete: [${dataObject.filename}] from [/${dataObject.directory}]. This action CANNOT BE UNDONE. Are you sure?`
        );
        if (confirmDeletion) {
            await deleteFile(dataObject);
            await updateDirectories();
        }
    }

    function clearState() {
        setDetails(() => null);
        setSpawnedItems(() => null);
        setNameFilter(() => "");
        setObjectsToRemove(() => []);
        setCurrentFileDetails(() => {});
        setView("home");
    }

    async function pickSecondFile(dataObject) {
        if (
            dataObject.filename === currentFileDetails.filename &&
            currentFileDetails.directory === dataObject.directory
        ) {
            console.log(dataObject);
            console.log(currentFileDetails);
            alert("Cannot merge file with itself. Pick a different file.");
            return;
        }

        const desiredFileName = window.prompt(
            "Enter a name (Server will add extension)"
        );
        const confirmMerge = window.confirm(
            `This will merge: [${currentFileDetails.filename}] from [${currentFileDetails.directory}]\n\n[${dataObject.filename}] from [${dataObject.directory}]\n\n Will store in a file called [${desiredFileName}.json] `
        );
        if (confirmMerge) {
            const fileOne = { ...currentFileDetails };
            const fileTwo = { ...dataObject };
            const fileObj = { fileOne, fileTwo, desiredFileName };
            console.log(fileObj);
            const resp = await mergeTwoFiles(fileObj);
            setTimeout(() => {
                window.location.href = "/";
            }, 1);
            alert(resp);
        }
    }

    return (
        <div className="App">
            {view === "home" && (
                <HomeView
                    filesOnServer={filesOnServer}
                    updateDirectories={updateDirectories}
                    deleteGivenFile={deleteGivenFile}
                    openFile={openFile}
                    openFileInSameTab={openFileInSameTab}
                />
            )}
            {view === "details" && (
                <>
                    <ItemListHeader
                        clearState={clearState}
                        details={details}
                        setView={setView}
                    />

                    <ItemList
                        handleSearchChange={handleSearchChange}
                        nameFilter={nameFilter}
                        objectsToRemove={objectsToRemove}
                        details={details}
                        sortSpawnedItems={sortSpawnedItems}
                        spawnedItems={spawnedItems}
                        handleRemoveObjects={handleRemoveObjects}
                        handleCheckBox={handleCheckBox}
                    />
                </>
            )}
            {view === "merge" && (
                <SaveFileMerger
                    currentFileDetails={currentFileDetails}
                    filesOnServer={filesOnServer}
                    pickSecondFile={pickSecondFile}
                />
            )}
        </div>
    );
}
