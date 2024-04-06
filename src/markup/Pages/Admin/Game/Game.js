import React, { useState, useEffect, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import basic from "../../../../images/icon/basicGame.png";
import sequence from "../../../../images/icon/sequenceGame.png";
import loop from "../../../../images/icon/loopGame.png";
import functionGame from "../../../../images/icon/functionGame.png";
import condition from "../../../../images/icon/conditionGame.png";
import custom from "../../../../images/icon/customGame.png";

import start from "../../../../images/icon/gameStart.png";
import street from "../../../../images/icon/gameStreet.png";
import rock from "../../../../images/icon/gameRock.png";
import end from "../../../../images/icon/gameEnd.png";
import {
  getGameModeApi,
  getLevelDetailByLevelIdApi,
  getLevelDetailByModeIdApi,
  updateGameLevelApi,
} from "../../../../helper/apis/game/game";
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Droppable } from "./TestDnd/Droppable";
import { Draggable } from "./TestDnd/Draggable";
import { Button, Spinner, Container, Row, Col } from "react-bootstrap";
import { elementType } from "prop-types";

export default function Game() {
  const [enhancedModes, setEnhancedModes] = useState([]);
  const accessToken = localStorage.getItem("accessToken");
  const [viewGameData, setViewGameData] = useState(false);
  const [gameLevels, setGameLevels] = useState([]);
  const [viewLevelDetail, setViewLevelDetail] = useState(false);
  const [currentLevelDetail, setCurrentLevelDetail] = useState(null);
  const [message, setMessage] = useState(null);
  const [isVStartExist, setIsVStartExist] = useState(false);
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedSquareIndex, setSelectedSquareIndex] = useState(null);

  const handleLevelDetailInputNumberChange = (event) => {
    let value = parseInt(event.target.value);
    let name = event.target.name;
    if (name === "levelIndex") {
      let levelIndex = value - 1;
      if (levelIndex < 0) {
        levelIndex = 0;
      }
      if (levelIndex > 99) {
        levelIndex = 99;
      }
      setCurrentLevelDetail({ ...currentLevelDetail, levelIndex: levelIndex });
    } else {
      if (value < 0) {
        value = 0;
      }
      if (value > 100) {
        value = 100;
      }
      setCurrentLevelDetail({ ...currentLevelDetail, [name]: value });
    }
  };

  const [arr, setArr] = useState([]);

  useEffect(() => {
    if (!viewGameData) {
      const fetchGameModes = async () => {
        try {
          setIsLoading(true);

          const data = await getGameModeApi();

          const typeToId = {
            Basic: 1,
            Sequence: 2,
            Loop: 3,
            Function: 4,
            Condition: 5,
            Custom: 6,
          };
          const tempModes = [
            { typeName: "Basic", src: basic },
            { typeName: "Sequence", src: sequence },
            { typeName: "Loop", src: loop },
            { typeName: "Function", src: functionGame },
            { typeName: "Condition", src: condition },
            { typeName: "Custom", src: custom },
          ].map((mode) => {
            const foundMode = data.find(
              (m) => m.typeName.toLowerCase() === mode.typeName.toLowerCase()
            );
            return {
              ...mode,
              totalLevel: foundMode ? foundMode.totalLevel : 0,
              // Use the mapping to assign the correct id
              id: typeToId[mode.typeName],
            };
          });
          setEnhancedModes(tempModes);
        } catch (error) {
          console.error("Error fetching game modes:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchGameModes();
    }
  }, [viewGameData, accessToken]);

  //Show message error
  useEffect(() => {
    if (message) {
      alert(`Error: ${message}`);
      setMessage(null);
    }
  }, [message]);

  const handleGameModeClick = async (modeId) => {
    if (typeof modeId === "undefined") return;

    try {
      const levels = await getLevelDetailByModeIdApi({ modeId: modeId });

      setGameLevels(levels);
      setViewGameData(true);
    } catch (error) {
      let errorMessage = null;
      if (error.response) {
        console.log(`Error response: ${JSON.stringify(error, null, 2)}`);
        errorMessage = error.response?.data?.title || "Undefined.";
      } else {
        console.log(`Error message: ${JSON.stringify(error, null, 2)}`);
        errorMessage = error.message || "Undefined.";
      }
      setMessage(errorMessage);
    }
  };

  const handleBackButtonClick = () => {
    setViewGameData(false);
  };

  //get current level detail
  const handleViewEditClick = async (level) => {
    const levelId = level.id;

    try {
      const levelDetails = await getLevelDetailByLevelIdApi({
        levelId: levelId,
      });

      setCurrentLevelDetail(levelDetails);

      //create updated array to update arr:
      const updatedArr = Array.from({ length: 6 * 8 }, (_, index) => ({
        id: index + 1,
        content: null,
        typeId: undefined,
      }));

      // Place the start position
      if (
        levelDetails &&
        levelDetails.vStartPosition !== undefined &&
        levelDetails.vStartPosition != 0
      ) {
        setIsVStartExist(true);
        const startPos = levelDetails.vStartPosition;
        updatedArr[startPos - 1] = {
          ...updatedArr[startPos - 1],
          content: <img src={start} alt="Start" />,
          typeId: 0,
        };
      } else {
        setIsVStartExist(false);
      }

      levelDetails?.levelDetail.forEach((detail) => {
        // Adjust position to account for bottom-to-top index
        // const pos = calculateGridPosition(detail.vPosition, columns, rows);
        const pos = detail.vPosition;

        let content;
        let typeId;

        switch (detail.typeId) {
          case 1: {
            // street
            content = <img src={street} alt="Street" />;
            typeId = 1;
            break;
          }
          case 2: {
            // end
            content = <img src={end} alt="End" />;
            typeId = 2;
            break;
          }
          case 3: {
            // rock
            content = <img src={rock} alt="Rock" />;
            typeId = 3;
            break;
          }
          default:
            content = null;
        }

        // grid[pos] = content;
        updatedArr[pos - 1] = {
          ...updatedArr[pos - 1],
          content: content,
          typeId: typeId,
        };
      });

      //update arr
      setArr(updatedArr);

      setViewLevelDetail(true);
    } catch (error) {
      let errorMessage = null;
      if (error.response) {
        console.log(`Error response: ${JSON.stringify(error, null, 2)}`);
        errorMessage = error.response?.data?.title || "Undefined.";
      } else {
        console.log(`Error message: ${JSON.stringify(error, null, 2)}`);
        errorMessage = error.message || "Undefined.";
      }
      setMessage(errorMessage);
    }
  };

  const handleUpdateLevel = async () => {
    const updateData = async () => {
      try {
        setIsUpdateLoading(true);

        if (!isVStartExist) {
          throw new Error("Missing start position.");
        }

        let levelDetailsUpdate = [];
        let vStartPositionUpdate = undefined;
        arr.forEach((element) => {
          if (element.typeId !== undefined) {
            if (element.typeId == 0) {
              vStartPositionUpdate = element.id;
            } else {
              levelDetailsUpdate.push({
                vPosition: element.id,
                typeId: element.typeId,
              });
            }
          }
        });

        const updateData = {
          ...currentLevelDetail,
          levelDetail: levelDetailsUpdate,
          vStartPosition: vStartPositionUpdate,
        };

        setCurrentLevelDetail(updateData);

        await updateGameLevelApi({ data: updateData });

        alert("Update success");
      } catch (error) {
        let errorMessage = null;
        if (error.response) {
          console.log(`Error response: ${JSON.stringify(error, null, 2)}`);
          errorMessage = error.response?.data?.title || "Undefined.";
        } else {
          console.log(`Error message: ${JSON.stringify(error, null, 2)}`);
          errorMessage = error.message || "Undefined.";
        }
        setMessage(errorMessage);
      } finally {
        setIsUpdateLoading(false);
      }
    };
    updateData();
  };

  //Drag and Drop
  //handle event when finish
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active && over) {
      const updatedArray = arr.map((row) => {
        if (row.id === over.id) {
          return {
            ...row,
            content: active.data.current.child,
            typeId: active.data.current.typeId,
          };
        }
        return row;
      });

      if (active.data.current.typeId == 0) {
        setIsVStartExist(true);
      }

      setArr(updatedArray);
    }
  };

  //sensor
  const sensor = useSensors(useSensor(TouchSensor), useSensor(MouseSensor));

  const handleResetChild = ({ rowId, resetChildComponent }) => {
    const updatedArray = arr.map((row) => {
      if (row.id === rowId) {
        if (row.typeId === 0) {
          setIsVStartExist(false);
        }
        return {
          ...row,
          content: resetChildComponent,
          typeId: undefined,
        };
      }
      return row;
    });

    setArr(updatedArray);
  };

  //Drag and Drop

  //make these droppable
  const LevelGrid = () => {
    const columns = 8;
    const rows = 6;

    // return content of droppable
    return (
      <div className="grid-container">
        {arr.map((a, index) => {
          const row = Math.floor(index / columns);
          const col = index % columns;
          return (
            <div key={index} className={`grid-item `}>
              <Droppable
                id={a.id}
                child={a.content}
                handleResetChild={handleResetChild}
                resetComponent={null}
              />
            </div>
          );
        })}
      </div>
    );
  };

  //make these draggable
  if (viewLevelDetail) {
    return (
      <div
        className="level-detail mt-4 pt-3 pb-5 px-5 mb-1 mx-3"
        style={{ backgroundColor: "white", borderRadius: "8px" }}
      >
        <div className="d-flex justify-content-between">
          <div>
            <h5>Level Detail</h5>
            <p>Level ID: {currentLevelDetail.id}</p>
          </div>
          <div>
            <button
              onClick={() => setViewLevelDetail(false)}
              style={{
                backgroundColor: "#7F7C7C",
                border: "none",
                borderRadius: "8px",
                color: "white",
              }}
            >
              Back
            </button>
          </div>
        </div>
        <div className="d-flex justify-content-between">
          <div className="d-flex justify-content-start">
            <div>
              <p className="mb-1">Level index</p>
              <input
                type="number"
                name="levelIndex"
                value={currentLevelDetail.levelIndex + 1}
                required
                min={1}
                max={100}
                onChange={handleLevelDetailInputNumberChange}
              />
            </div>
            <div>
              <p className="mb-1">Coin earn</p>
              <input
                type="number"
                name="coinReward"
                value={currentLevelDetail.coinReward}
                required
                min={0}
                max={100}
                onChange={handleLevelDetailInputNumberChange}
              />
            </div>
            <div>
              <p className="mb-1">Game earn</p>
              <input
                type="number"
                name="gemReward"
                value={currentLevelDetail.gemReward}
                required
                min={0}
                max={100}
                onChange={handleLevelDetailInputNumberChange}
              />
            </div>
          </div>
          <div>
            <button
              style={{
                backgroundColor: "#EF7E54",
                color: "white",
                border: "none",
                borderRadius: "8px",
              }}
            >
              Delete level
            </button>
          </div>
        </div>
        <div className="mt-3 d-flex">
          <DndContext
            onDragEnd={handleDragEnd}
            collisionDetection={closestCorners}
            sensors={sensor}
          >
            <div className="map" style={{ width: "65%" }}>
              <LevelGrid />
            </div>
            <div className="map-item" style={{ width: "30%" }}>
              <div className="d-flex justify-content-center">
                <div>
                  {/* Make these draggable */}
                  <div className="d-flex">
                    {isVStartExist == false && (
                      <Draggable
                        id={1}
                        child={
                          <img
                            src={start}
                            style={{ width: "100%", height: "auto" }}
                            alt=""
                          />
                        }
                        resetChild={null}
                        typeId={0}
                      />
                    )}

                    <Draggable
                      id={2}
                      child={
                        <img
                          src={street}
                          style={{ width: "100%", height: "auto" }}
                          alt=""
                        />
                      }
                      resetChild={null}
                      typeId={1}
                    />
                  </div>
                  <div className="d-flex">
                    <Draggable
                      id={3}
                      child={
                        <img
                          src={end}
                          style={{ width: "100%", height: "auto" }}
                          alt=""
                        />
                      }
                      resetChild={null}
                      typeId={2}
                    />

                    <Draggable
                      id={4}
                      child={
                        <img
                          src={rock}
                          style={{ width: "100%", height: "auto" }}
                          alt=""
                        />
                      }
                      resetChild={null}
                      typeId={3}
                    />
                  </div>
                  <Button className="my-3" onClick={handleUpdateLevel}>
                    {isUpdateLoading === false ? (
                      <div>Save</div>
                    ) : (
                      <Spinner animation="border" size="sm" variant="warning" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </DndContext>
        </div>
      </div>
    );
  }

  return (
    <div className="game-setting">
      <div className="game-setting-content">
        {viewGameData ? (
          <div className="header">
            <div className="d-flex justify-content-between">
              <div>
                <h5 className="mb">Game Data</h5>
                <hr />
              </div>
              <button
                onClick={handleBackButtonClick}
                style={{
                  backgroundColor: "#7F7C7C",
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                }}
              >
                Back
              </button>
            </div>
          </div>
        ) : (
          <div className="header">
            <div className="d-flex justify-content-start">
              <div>
                <h5 className="mb">Game Modes</h5>
                <hr />
              </div>
              <i className="fa-solid fa-gamepad"></i>
            </div>
          </div>
        )}

        {viewGameData ? (
          <div>
            <div
              className="d-flex justify-content-start"
              style={{
                width: "30%",
                border: "1px solid #EF7E54",
                padding: "10px 15px",
                borderRadius: "10px",
                color: "white",
              }}
            >
              <div className="text-center" style={{ width: "50%" }}>
                <h5 className="mb-0"> MODE</h5>
              </div>
              <div
                className="d-flex justify-content-around"
                style={{
                  width: "50%",
                  backgroundColor: "#FF8A00",
                  borderRadius: "10px",
                }}
              >
                <p className="mb-0">Total level</p>
                <span>{gameLevels.length}</span>
              </div>
            </div>
            <div className="py-3 px-3" style={{}}>
              {gameLevels.length > 0 ? (
                gameLevels.map((level, index) => (
                  <div
                    key={index}
                    className="mt-3 py-3 px-4 d-flex justify-content-between"
                    style={{ backgroundColor: "white", borderRadius: "8px" }}
                  >
                    <div>
                      <p className="mb-0">Level {level.levelIndex + 1}</p>
                    </div>
                    <div>
                      <button
                        onClick={() => handleViewEditClick(level)}
                        style={{
                          backgroundColor: "#EF7E54",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                        }}
                      >
                        View/Edit
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p>No levels to display</p>
              )}
            </div>
          </div>
        ) : (
          <div className="row">
            {isLoading && isLoading === true ? (
              <CustomSpinner />
            ) : (
              enhancedModes.map(({ typeName, src, totalLevel, id }) => (
                <div
                  className="item col-lg-6 col-md-6 col-sm-12"
                  key={typeName}
                  onClick={() => handleGameModeClick(id)}
                >
                  <div className="item-content">
                    <p className="title blue fw-bold mb-2">{typeName} mode</p>
                    <div className="d-flex justify-content-between">
                      <div className="d-flex level">
                        <span>{totalLevel}</span>
                        <p className="mb-0 ms-2">Level</p>
                      </div>
                      <div>
                        <img
                          className="img-responsive"
                          src={src}
                          alt={`${typeName} mode`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const CustomSpinner = () => {
  return (
    <div className="d-flex justify-content-center py-5">
      <Spinner animation="border" variant="success" />
    </div>
  );
};
