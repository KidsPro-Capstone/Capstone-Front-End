import React, { useState, useEffect, useRef } from "react";

import start from "../../../../images/icon/gameStart.png";
import street from "../../../../images/icon/gameStreet.png";
import rock from "../../../../images/icon/gameRock.png";
import end from "../../../../images/icon/gameEnd.png";

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
import { addLevelApi } from "../../../../helper/apis/game/game";

export const CreateLevel = ({
  modeId,
  setAddLevel,
  setViewLevelDetail,
  handleReloadLevels,
}) => {
  //useState
  const [input, setInput] = useState({
    levelIndex: 1,
    coinReward: 10,
    gemReward: 10,
  });
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [isVStartExist, setIsVStartExist] = useState(false);
  const [message, setMessage] = useState(null);

  const columns = 8;
  const rows = 6;

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
  const initArray = Array.from({ length: rows * columns }, (_, index) => ({
    id: convertArrayIndexToPostion(index, rows, columns),
    content: null,
    typeId: undefined,
  }));

  const [arr, setArr] = useState(initArray);

  const handleInputChange = (event) => {
    let value = parseInt(event.target.value);
    let name = event.target.name;
    if (name === "levelIndex") {
      let levelIndex = value;
      if (levelIndex < 1) {
        levelIndex = 1;
      }
      if (levelIndex > 100) {
        levelIndex = 100;
      }
      setInput({ ...input, levelIndex: levelIndex });
    } else {
      if (value < 0) {
        value = 0;
      }
      if (value > 100) {
        value = 100;
      }
      setInput({ ...input, [name]: value });
    }
  };

  const handleBack = () => {
    setAddLevel(false);
    setViewLevelDetail(false);
    handleReloadLevels(modeId);
  };

  const handleAddLevel = async () => {
    const createLevel = async () => {
      try {
        setIsSaveLoading(true);

        if (!isVStartExist) {
          throw new Error("Missing start position.");
        }

        let levelDetails = [];
        let vStartPosition = undefined;
        arr.forEach((element) => {
          if (element.typeId !== undefined) {
            if (element.typeId == 0) {
              vStartPosition = element.id;
            } else {
              levelDetails.push({
                vPosition: element.id,
                typeId: element.typeId,
              });
            }
          }
        });

        const data = {
          id: 0,
          coinReward: input.coinReward,
          gemReward: input.gemReward,
          levelIndex: input.levelIndex,
          vStartPosition: vStartPosition,
          gameLevelTypeId: modeId,
          levelDetail: levelDetails,
        };

        await addLevelApi({ data: data });

        alert("Add success");

        //back
        handleBack();
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
        setIsSaveLoading(false);
      }
    };
    createLevel();
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

  return (
    <div
      className="level-detail mt-4 pt-3 pb-5 px-5 mb-1 mx-3"
      style={{ backgroundColor: "white", borderRadius: "8px" }}
    >
      <div className="d-flex justify-content-between">
        <div>
          <h5>Add level</h5>
        </div>
        <div>
          <button
            onClick={handleBack}
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
              value={input.levelIndex}
              required
              min={1}
              max={100}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <p className="mb-1">Coin earn</p>
            <input
              type="number"
              name="coinReward"
              value={input.coinReward}
              required
              min={0}
              max={100}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <p className="mb-1">Game earn</p>
            <input
              type="number"
              name="gemReward"
              value={input.gemReward}
              required
              min={0}
              max={100}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>
      <div className="mt-3 d-flex">
        <DndContext
          onDragEnd={handleDragEnd}
          collisionDetection={closestCorners}
          sensors={sensor}
        >
          <div className="map" style={{ width: "65%" }}>
            <div className="grid-container">
              {arr.map((a, index) => {
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
                <Button className="my-3" onClick={handleAddLevel}>
                  {isSaveLoading === false ? (
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
};
