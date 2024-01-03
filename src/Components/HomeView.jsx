import React from "react";
import DropzoneComponent from "./DragDrop";

function HomeView({
    filesOnServer,
    updateDirectories,
    deleteGivenFile,
    openFile,
    openFileInSameTab,
}) {
    return (
        <div>
            <h1>BF3RM Map Save Analyzer</h1>
            <div className="flexContainer">
                <DropzoneComponent showUploadedFile={updateDirectories} />
                <h2>OR</h2>
                <div>
                    <h3>Select Prior Save</h3>
                    <div className="priorSaves">
                        {filesOnServer.map((parent, index) => {
                            return (
                                <div key={index} className="priorSaveGroup">
                                    <div className="directoryName">
                                        <p>/{parent.directory}</p>
                                    </div>

                                    {parent.files.map((item, index) => (
                                        <div
                                            key={index}
                                            className="priorSaves--oneSave"
                                        >
                                            <button
                                                onClick={() => {
                                                    deleteGivenFile({
                                                        directory:
                                                            parent.directory,
                                                        filename: item,
                                                    });
                                                }}
                                            >
                                                DELETE FILE
                                            </button>
                                            <p>{item}</p>
                                            <button
                                                onClick={() => {
                                                    openFile({
                                                        directory:
                                                            parent.directory,
                                                        filename: item,
                                                    });
                                                }}
                                            >
                                                LOAD
                                            </button>
                                            <button
                                                onClick={() => {
                                                    openFileInSameTab({
                                                        directory:
                                                            parent.directory,
                                                        filename: item,
                                                    });
                                                }}
                                            >
                                                GET JSON
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomeView;
