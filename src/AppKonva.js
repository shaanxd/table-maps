import React, { useLayoutEffect, useRef, useState } from "react";
import { Stage, Layer, Rect } from "react-konva";

import {
  Container,
  RightPane,
  LeftPane,
  MiddlePane,
  BottomPane,
  ParentPane,
  TopPane,
} from "./components";
import {
  ASPECT_RATIO,
  DRAGGABLE_TYPES,
  INITIAL_STAGE_DIMENSIONS,
  TABLES,
} from "./constants";
import UnassignedStageTable from "./UnassignedStageTable";
import UnassignedTable from "./UnassignedTable.js";

import UnassignedSVG from "./static/unassigned.svg";
import { useWindowSize } from "react-use";

function App() {
  const rightPaneRef = useRef();
  const stageRef = useRef();
  const stage = useRef();

  const { width: windowWidth } = useWindowSize();

  console.log("[X]", windowWidth);

  const [tables, setTables] = useState(TABLES);
  const [draggable, setDraggable] = useState(null);
  const [stageDimensions, setStageDimensions] = useState(null);
  const [stageElements, setStageElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [stagePixelDimensions, setStagePixelDimensions] = useState({
    width: INITIAL_STAGE_DIMENSIONS.WIDTH,
    height: INITIAL_STAGE_DIMENSIONS.HEIGHT,
  });

  //   useLayoutEffect(() => {
  //     const { height, width } = rightPaneRef.current.getBoundingClientRect();
  //     setStateDimensions({ height, width });
  //   }, []);

  function calibrateRightPaneHeight() {
    const { HEIGHT, WIDTH } = ASPECT_RATIO;
    const { offsetWidth } = rightPaneRef.current;
    const scaledHeight = (offsetWidth / WIDTH) * HEIGHT;
    rightPaneRef.current.style.height = `${scaledHeight}px`;

    setStageDimensions({ height: scaledHeight, width: offsetWidth });
  }

  useLayoutEffect(() => {
    calibrateRightPaneHeight();
    //  eslint-disable-next-line;
  }, [windowWidth]);

  function handleOnDragStart(e, type, { width, height, ...rest }) {
    const { top, left } = e.target.getBoundingClientRect();
    setDraggable({
      type,
      params: {
        ...rest,
        width,
        height,
      },
      diffX: e.pageX - left - width / 2,
      diffY: e.pageY - top - height / 2,
    });
  }

  function handleOnDragOver(e) {
    e.preventDefault();
  }

  function getBoundPerCoord(pos, parent, child) {
    const offset = parent - child / 2;

    if (pos < child / 2) {
      return child / 2;
    }
    if (pos > offset) {
      return offset;
    }
    return pos;
  }

  function handleOnDrop(e) {
    e.preventDefault();

    if (!draggable || !Object.keys(draggable).length === 0) {
      return;
    }
    const { width: stageWidth, height: stageHeight } = stageDimensions;

    const {
      diffX,
      diffY,
      type,
      params: { id, width, height, ...rest },
    } = draggable;

    stageRef.current.setPointersPositions(e);
    const { x, y } = stageRef.current.getPointerPosition();

    let updatedX = x - diffX;
    let updatedY = y - diffY;

    setStageElements([
      ...stageElements,
      {
        x: getBoundPerCoord(updatedX, stageWidth, width),
        y: getBoundPerCoord(updatedY, stageHeight, height),
        type,
        id,
        width,
        height,
        rotation: 0,
        ...rest,
      },
    ]);
    setTables(
      tables.map((table) => {
        const { id: tableId } = table;
        if (tableId === id) {
          return { ...table, assigned: true };
        }
        return table;
      })
    );
    setSelectedElement(id);
    setDraggable(null);
  }

  function handleOnDragEnd(e, { id }) {
    const updatedX = e.target.x();
    const updatedY = e.target.y();

    const index = stageElements.findIndex(({ id: foundId }) => foundId === id);

    if (index === -1) {
      return;
    }

    let arr = [...stageElements];

    const { width: stageWidth, height: stageHeight } = stageDimensions;
    const { width, height, ...rest } = arr[index];

    arr[index] = {
      ...rest,
      width,
      height,
      x: getBoundPerCoord(updatedX, stageWidth, width),
      y: getBoundPerCoord(updatedY, stageHeight, height),
    };
    setStageElements(arr);
  }

  function getDragBounds(coordinates, dimensions) {
    const { width: stageWidth, height: stageHeight } = stageDimensions;
    const { width: itemWidth, height: itemHeight } = dimensions;
    const { x, y } = coordinates;

    return {
      x: getBoundPerCoord(x, stageWidth, itemWidth),
      y: getBoundPerCoord(y, stageHeight, itemHeight),
    };
  }

  function handleOnTransformEnd(transformation, { id }) {
    const foundIndex = stageElements.findIndex(
      ({ id: foundId }) => foundId === id
    );

    if (foundIndex === -1) {
      return;
    }

    let arr = [...stageElements];

    arr[foundIndex] = {
      ...arr[foundIndex],
      ...transformation,
    };

    setStageElements(arr);
  }

  function handleOnSelect(id) {
    setSelectedElement(id);
  }

  function handleOnRotationChange(shape, id) {
    const transformation = shape.getClientRect({
      relativeTo: stageRef.current,
    });
    // setBoundDimensions(transformation);
    handleOnTransformEnd(transformation, { id });
  }

  return (
    <div className="App">
      <Container>
        <ParentPane>
          <TopPane>
            {tables
              .filter(({ assigned }) => !assigned)
              .map((table) => (
                <UnassignedTable
                  key={table.id}
                  table={table}
                  onDragStart={handleOnDragStart}
                />
              ))}
          </TopPane>
          <MiddlePane>
            <LeftPane></LeftPane>
            <RightPane
              ref={rightPaneRef}
              onDragOver={handleOnDragOver}
              onDrop={handleOnDrop}
              id="container"
            >
              <Stage
                ref={stage}
                width={100}
                height={100}
                style={{
                  backgroundColor: "red",
                }}
              >
                {/* <Layer>
                  <Rect
                    x={0}
                    y={0}
                    width={stagePixelDimensions.width}
                    height={stagePixelDimensions.height}
                    stroke="red"
                  />
                </Layer> */}
              </Stage>
              {/* {stageDimensions && (
                <Stage ref={stageRef} {...stageDimensions} id="container">
                  <Layer>
                    {stageElements.map((stageElement) => {
                      const { id, type } = stageElement;
                      if (type === DRAGGABLE_TYPES.UNASSIGNED) {
                        return (
                          <UnassignedStageTable
                            key={id}
                            data={{ ...stageElement, src: UnassignedSVG }}
                            getDragBounds={getDragBounds}
                            onDragEnd={handleOnDragEnd}
                            onTransformEnd={handleOnTransformEnd}
                            onRotationChange={handleOnRotationChange}
                            setSelected={handleOnSelect}
                            selected={selectedElement === id}
                          />
                        );
                      }
                      return null;
                    })}
                  </Layer>
                </Stage>
              )} */}
            </RightPane>
          </MiddlePane>
        </ParentPane>
        <BottomPane>
          {/* <Button onClick={handleScaleUp}>Scale up</Button>
          <Button onClick={handleScaleDown}>Scale down</Button> */}
          <pre>{selectedElement}</pre>
          <pre>{JSON.stringify(stageElements, null, 2)}</pre>
        </BottomPane>
      </Container>
    </div>
  );
}

export default App;
