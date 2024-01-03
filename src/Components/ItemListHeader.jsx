import React from "react";

function ItemListHeader({ details, clearState, setView }) {
    return (
        <div>
            {" "}
            <div className="heading">
                <h2 className="example" id="myId">
                    {details.projectName}
                </h2>
                <p>Map: {details.mapName}</p>
                <p>Game Mode: {details.gameModeName}</p>
                <p>Save version: {details.saveVersion}</p>
                <button
                    style={{ padding: "1rem" }}
                    onClick={() => {
                        clearState();
                    }}
                >
                    BACK
                </button>
                <button
                    style={{ padding: "1rem" }}
                    onClick={() => {
                        setView(() => "merge");
                    }}
                >
                    MERGE WITH ANOTHER SAVE
                </button>
                <button
                    style={{ padding: "1rem" }}
                    onClick={() => {
                        setView(() => "addItems");
                    }}
                >
                    Add Items to this save!
                </button>
            </div>
        </div>
    );
}

export default ItemListHeader;
