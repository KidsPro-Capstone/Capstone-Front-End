import React, { useState, useEffect, useRef } from "react";
import basic from "../../../../images/icon/basicGame.png";
import sequence from "../../../../images/icon/sequenceGame.png";
import loop from "../../../../images/icon/loopGame.png";
import functionGame from "../../../../images/icon/functionGame.png";
import condition from "../../../../images/icon/conditionGame.png";
import custom from "../../../../images/icon/customGame.png";

import plusCircleIcon from "../../../../images/icon/plus_circle.png";
import arrowLeft from "../../../../images/icon/arrow-left.png";

import start from "../../../../images/icon/gameStart.png";
import street from "../../../../images/icon/gameStreet.png";
import rock from "../../../../images/icon/gameRock.png";
import end from "../../../../images/icon/gameEnd.png";
import {
  getGameModeApi,
  getLevelDetailByLevelIdApi,
  getLevelDetailByModeIdApi,
  removeLevelApi,
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
import { Spinner, Container, Row, Col } from "react-bootstrap";
import { CreateLevel } from "./CreateGameLevel";
import "./Game.css";
import { ToastContainer, toast } from "react-toastify";
import { Delete, Save } from "@mui/icons-material";
import { Backdrop, CircularProgress, Button } from "@mui/material";
import { changeAdminActiveMenu } from "../../../../store/slices/menu/menuSlice";
import { useDispatch } from "react-redux";
import { ConfirmModal } from "../../../Layout/Components/Notification/ConfirmModal";

export default function Game() {
  const [enhancedModes, setEnhancedModes] = useState([]);
  const [viewGameData, setViewGameData] = useState(false);
  const [gameLevels, setGameLevels] = useState([]);
  const [viewLevelDetail, setViewLevelDetail] = useState(false);
  const [addLevel, setAddLevel] = useState(false);
  const [currentLevelDetail, setCurrentLevelDetail] = useState(null);
  const [message, setMessage] = useState(null);
  const [isVStartExist, setIsVStartExist] = useState(false);
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [arr, setArr] = useState([]);
  const [modeId, setModeId] = useState();
  //delete confirm
  const [show, setShow] = useState(false);

  const dispatch = useDispatch();


  //notification
  const notifyApiFail = (message) =>
    toast.error(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeButton: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    });

  //change active menu:
  dispatch(changeAdminActiveMenu({ adminActiveMenu: "Game" }));

  const notifyApiSucess = (message) =>
    toast.success(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeButton: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    });

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
      if (value > 1000000) {
        value = 1000000;
      }
      setCurrentLevelDetail({ ...currentLevelDetail, [name]: value });
    }
  };

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
        } finally {
          setIsLoading(false);
        }
      };

      fetchGameModes();
    }
  }, [viewGameData]);

  //Show message error
  useEffect(() => {
    if (message) {
      notifyApiFail(`Error: ${message}`);
      setMessage(null);
    }
  }, [message]);

  const handleGameModeClick = async (modeId) => {
    if (typeof modeId === "undefined") return;

    try {
      setIsLoading(true);
      const levels = await getLevelDetailByModeIdApi({ modeId: modeId });

      setModeId(modeId);
      setGameLevels(levels);
      setViewGameData(true);
    } catch (error) {
      let errorMessage = null;
      if (error.response) {

        errorMessage = error.response?.data?.message || "Undefined.";
      } else {

        errorMessage = error.message || "Undefined.";
      }
      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackButtonClick = () => {
    setViewGameData(false);
    setViewLevelDetail(false);
    setAddLevel(false);
  };

  const handleAddLevelClick = () => {
    setViewLevelDetail(false);
    setAddLevel(true);
  };

  const handleRemoveLevel = async (id) => {
    try {
      await removeLevelApi({ id: id });

      setViewLevelDetail(false);
      setAddLevel(false);

      const levels = await getLevelDetailByModeIdApi({ modeId: modeId });

      setGameLevels(levels);
      setViewGameData(true);
    } catch (error) {
      let errorMessage = null;
      if (error.response) {

        errorMessage = error.response?.data?.message || "Undefined.";
      } else {

        errorMessage = error.message || "Undefined.";
      }
      setMessage(errorMessage);
    } finally {
      setShow(false)
    }
  };

  //get current level detail
  const handleViewEditClick = async (level) => {
    const levelId = level.id;
    const columns = 8;
    const rows = 6;

    try {
      const levelDetails = await getLevelDetailByLevelIdApi({
        levelId: levelId,
      });

      setCurrentLevelDetail(levelDetails);

      //convert array index to postion
      const convertArrayIndexToPostion = (index, rows, columns) => {
        const quotient = Math.floor(index / columns);
        const remainder = index % columns;
        const position = columns * (rows - quotient - 1) + remainder + 1;
        return position;
      };

      //convert postion to array index
      const convertPositionToArrayIndex = (position, rows, columns) => {
        const quotient = Math.floor(position / columns);
        const remainder = position % columns;
        const index = columns * (rows - quotient - 1) + remainder - 1;
        return index;
      };

      //create updated array to update arr:
      const updatedArr = Array.from({ length: rows * columns }, (_, index) => ({
        id: convertArrayIndexToPostion(index, rows, columns),
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
        const startPos = convertPositionToArrayIndex(
          levelDetails.vStartPosition,
          rows,
          columns
        );
        updatedArr[startPos] = {
          ...updatedArr[startPos],
          content: <img src={start} alt="Start" />,
          typeId: 0,
        };
      } else {
        setIsVStartExist(false);
      }

      levelDetails?.levelDetail.forEach((detail) => {
        // Adjust position to account for bottom-to-top index
        // const pos = calculateGridPosition(detail.vPosition, columns, rows);
        const pos = convertPositionToArrayIndex(
          detail.vPosition,
          rows,
          columns
        );

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

        updatedArr[pos] = {
          ...updatedArr[pos],
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

        errorMessage = error.response?.data?.message || "Undefined.";
      } else {

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
            if (element.typeId === 0) {
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

        notifyApiSucess("Update success");
      } catch (error) {
        let errorMessage = null;
        if (error.response) {

          errorMessage = error.response?.data?.message || "Undefined.";
        } else {

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
          if (row.typeId === 0) {
            setIsVStartExist(false);
          }
          return {
            ...row,
            content: active.data.current.child,
            typeId: active.data.current.typeId,
          };
        }
        return row;
      });

      if (active.data.current.typeId === 0) {
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
    // const columns = 8;
    // const rows = 6;

    // return content of droppable
    return (
      <div className="grid-container">
        {arr.map((a, index) => {
          // const row = Math.floor(index / columns);
          // const col = index % columns;
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

  const handleLevelDetailBack = async () => {
    await handleGameModeClick(modeId);
    setViewLevelDetail(false);
  }



  const handleDeleteDeny = () => {
    setShow(false);
  }

  const handleDeleteLevelClick = () => {
    setShow(true);
  }

  const deleteLevelMessage = "Do you really want to delete this level?";

  //make these draggable
  if (viewLevelDetail) {
    return (
      <>
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={isUpdateLoading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>

        <ConfirmModal
          message={deleteLevelMessage}
          closeLabel={"Cancel"}
          acceptLabel={"Delete"}
          handleDeny={handleDeleteDeny}
          handleAccept={() => handleRemoveLevel(currentLevelDetail.id)}
          show={show}
        />

        <div className="level-detail">
          <div className="d-flex justify-content-between">
            <div className="mb-3">
              <h5>Level Detail</h5>
              {/* <p>Level ID: {currentLevelDetail.id}</p> */}
            </div>
            <div>
              <button
                onClick={handleLevelDetailBack}
                className="admin-back"
              >
                <div className="d-flex jutify-content-between align-items-center">
                  <img src={arrowLeft} alt="Arrow Left Icon" />
                  <p className="mb-0 mx-2">Back</p>
                </div>
              </button>
            </div>
          </div>

          <ToastContainer />
          <div className="d-flex justify-content-between align-items-end mb-4">
            <Container className="game-level-detail-menu-container">
              <Row className="pe-3">
                <Col md="4" className="px-0 pe-2">
                  <p className="mb-1 blue fw-bold">Level index</p>
                  <input
                    className="game-level-detail"
                    type="number"
                    name="levelIndex"
                    value={currentLevelDetail.levelIndex + 1}
                    required
                    min={1}
                    max={100}
                    onChange={handleLevelDetailInputNumberChange}
                  />
                </Col>
                <Col md="4" className="px-0 pe-2">
                  <p className="mb-1 blue fw-bold">Coin earn</p>
                  <input
                    className="game-level-detail"
                    type="number"
                    name="coinReward"
                    value={currentLevelDetail.coinReward}
                    required
                    min={0}
                    max={100}
                    onChange={handleLevelDetailInputNumberChange}
                  />
                </Col>
                <Col md="4" className="px-0 pe-2">
                  <p className="mb-1 blue fw-bold">Game earn</p>
                  <input
                    className="game-level-detail"
                    type="number"
                    name="gemReward"
                    value={currentLevelDetail.gemReward}
                    required
                    min={0}
                    max={100}
                    onChange={handleLevelDetailInputNumberChange}
                  />
                </Col>
              </Row>
            </Container>
            <div className="game-level-detail-menu-container-button">
              <div className="d-flex justify-content-evenly align-items-center">

                <button
                  className="save me-2"
                  onClick={handleUpdateLevel}
                >
                  <div className="d-flex jutify-content-between align-items-center">
                    <Save fontSize="small" />
                    <p className="mb-0 mx-1">Save</p>
                  </div>
                </button>

                <button
                  className="add"
                  // onClick={() => handleRemoveLevel(currentLevelDetail.id)}
                  onClick={handleDeleteLevelClick}
                >
                  <div className="d-flex jutify-content-between align-items-center">
                    <Delete fontSize="small" />
                    <p className="mb-0 mx-1">Delete Level</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
          <div className="mt-3 d-flex">
            <DndContext
              onDragEnd={handleDragEnd}
              collisionDetection={closestCorners}
              sensors={sensor}
            >
              <div className="map" style={{ width: "70%" }}>
                <LevelGrid />
              </div>
              <div className="map-item" style={{ width: "30%" }}>

                <div className="container-fluid game-level-detail-draggable">
                  {/* Make these draggable */}
                  <div className="row">
                    {isVStartExist === false && (
                      <div className="col-md-6 ">
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
                      </div>
                    )}

                    <div className="col-md-6">
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
                  </div>

                  <div className="row">
                    <div className="col-md-6">
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
                    </div>
                    <div className="col-md-6">
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
                  </div>
                </div>
              </div>
            </DndContext>
          </div >
        </div >
      </>
    );
  }

  if (addLevel) {
    return (
      <CreateLevel
        modeId={modeId}
        setAddLevel={setAddLevel}
        setViewLevelDetail={setViewLevelDetail}
        handleReloadLevels={handleGameModeClick}
      />
    );
  }

  return (
    <div className="game-setting game-setting-container">
      <div className="game-setting-content my-0">
        {viewGameData ? (
          <div className="header">
            <div className="d-flex justify-content-between">
              <div>
                <h5 className="mb">Game Data</h5>
                <hr />
              </div>
              <button onClick={handleBackButtonClick} className="admin-back">
                <div className="d-flex jutify-content-between align-items-center">
                  <img src={arrowLeft} alt="Arrow Left Icon" />
                  <p className="mb-0 mx-2">Back</p>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="header">
            <div className="d-flex justify-content-start align-items-center">
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
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div
                className="d-flex justify-content-start align-items-center"
                style={{
                  width: "30%",
                  border: "1px solid #EF7E54",
                  padding: "10px 15px",
                  borderRadius: "10px",
                  color: "white",
                }}
              >
                <div className="text-center" style={{ width: "50%" }}>
                  <h5 className="mb-0">
                    {" "}
                    {enhancedModes[modeId - 1]?.typeName} Mode
                  </h5>
                </div>
                <div
                  className="d-flex justify-content-around align-items-center"
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

              <button className="add" onClick={handleAddLevelClick}>
                <div className="d-flex jutify-content-between align-items-center">
                  <img
                    className="mx-1"
                    src={plusCircleIcon}
                    alt="Plus Circle Icon"
                  />
                  <p className="mb-0 mx-1">Create level</p>
                </div>
              </button>
            </div>
            <div className="py-3 px-3" style={{}}>
              {gameLevels.length > 0 ? (
                gameLevels.map((level, index) => (
                  <div
                    key={index}
                    className="mt-3 py-3 px-4 d-flex justify-content-between align-items-center"
                    style={{ backgroundColor: "white", borderRadius: "8px" }}
                  >
                    <div>
                      <p className="mb-0">Level {level.levelIndex + 1}</p>
                    </div>
                    <div>
                      <button
                        onClick={() => handleViewEditClick(level)}
                        className="add"
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
            {isLoading ? (
              <div className="d-flex justify-content-center py-5">
                <Spinner
                  animation="border"
                  variant="success"
                  className="custom-spinner"
                />
              </div>
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
