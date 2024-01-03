import React from "react";

function SaveFileMerger({ currentFileDetails, filesOnServer, pickSecondFile }) {
    return (
        <>
            <h1>
                Current file: /{currentFileDetails.directory}/
                {currentFileDetails.filename}
            </h1>
            {filesOnServer.map((parent, index) => {
                return (
                    <div key={index} className="priorSaveGroup">
                        <div className="directoryName">
                            <p>/{parent.directory}</p>
                        </div>

                        {parent.files.map((item, index) => (
                            <div key={index} className="priorSaves--oneSave">
                                <button
                                    onClick={() => {
                                        pickSecondFile({
                                            directory: parent.directory,
                                            filename: item,
                                        });
                                    }}
                                >
                                    MERGE
                                </button>
                                <p>{item}</p>
                            </div>
                        ))}
                    </div>
                );
            })}
        </>
    );
}

export default SaveFileMerger;
