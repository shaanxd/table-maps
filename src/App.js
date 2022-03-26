import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Stage, Layer, Rect, Line } from "react-konva";
import { useWindowSize } from "react-use";

import {
  Container,
  RightPane,
  LeftPane,
  MiddlePane,
  BottomPane,
  ParentPane,
  TopPane,
  Button,
  PaneSeparator,
  AppColumn,
  AppRow,
  DraggableContainer,
} from "./components";
import {
  ASPECT_RATIO,
  INITIAL_STAGE_DIMENSIONS,
  GRID_SIZE,
  TABLES,
  CONTAINER_SEPARATOR_WIDTH,
  CONTAINER_RATIO,
  TABLE_TYPES,
  GUIDELINE_OFFSET,
  INTERSECTION_OFFSET,
  GUIDELINE_COORDINATES,
  GUIDELINE_COLOR,
} from "./constants";
import StageTable from "./StageTable";
import DraggableTable from "./DraggableTable.js";
import Konva from "konva";

function getScale(scene, viewport) {
  const { width: sceneWidth, height: sceneHeight } = scene;
  const { width: viewportWidth, height: viewportHeight } = viewport;

  return {
    scaleX: sceneWidth / viewportWidth,
    scaleY: sceneHeight / viewportHeight,
  };
}

function getReverseScale(scene, viewport) {
  const { width: sceneWidth, height: sceneHeight } = scene;
  const { width: viewportWidth, height: viewportHeight } = viewport;

  return {
    scaleX: viewportWidth / sceneWidth,
    scaleY: viewportHeight / sceneHeight,
  };
}

function calculateGridSizeScaleRatio() {
  let widthGridScaleRatio;
  let heightGridScaleRatio;

  if (ASPECT_RATIO.WIDTH > ASPECT_RATIO.HEIGHT) {
    widthGridScaleRatio = ASPECT_RATIO.HEIGHT * ASPECT_RATIO.WIDTH;
    heightGridScaleRatio = ASPECT_RATIO.HEIGHT;
  } else if (ASPECT_RATIO.HEIGHT > ASPECT_RATIO.WIDTH) {
    widthGridScaleRatio = ASPECT_RATIO.WIDTH;
    heightGridScaleRatio = ASPECT_RATIO.WIDTH * ASPECT_RATIO.HEIGHT;
  } else {
    widthGridScaleRatio = ASPECT_RATIO.WIDTH;
    heightGridScaleRatio = ASPECT_RATIO.HEIGHT;
  }

  return { widthGridScaleRatio, heightGridScaleRatio };
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

function App() {
  const rightPaneRef = useRef();
  const middleRef = useRef();
  const leftPaneRef = useRef();
  const stageRef = useRef();
  const layerRef = useRef();

  const { width: windowWidth } = useWindowSize();

  const [tables, setTables] = useState(TABLES);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [canvasSize, setCanvasSize] = useState(INITIAL_STAGE_DIMENSIONS);
  const [gridLines, setGridLines] = useState([]);
  const [viewportSize, setViewPortSize] = useState(INITIAL_STAGE_DIMENSIONS);
  const [guidelines, setGuidelines] = useState([]);
  const [outOfBoundsArea, setOutOfBoundsArea] = useState({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });
  const [dpRatio, setDpRatio] = useState(1);
  const [draggable, setDraggable] = useState(null);
  const [elements, setElements] = useState([]);
  const [selected, setSelected] = useState(null);

  function redrawGridlines() {
    const { width: viewportWidth, height: viewportHeight } = viewportSize;
    const arr = [];
    for (let i = 0; i <= viewportWidth; i += GRID_SIZE) {
      arr.push(
        <Line
          points={[i, 0, i, viewportHeight]}
          stroke="#ccc"
          strokeWidth={1}
        />
      );
    }
    for (let i = 0; i <= viewportHeight; i += GRID_SIZE) {
      arr.push(
        <Line points={[0, i, viewportWidth, i]} stroke="#ccc" strokeWidth={1} />
      );
    }
    setGridLines(arr);
  }

  function recalculateCanvasDimensions() {
    const { width: viewportWidth, height: viewportHeight } = viewportSize;

    let viewportWidthRatio;
    let viewportHeightRatio;

    if (viewportWidth > viewportHeight) {
      viewportWidthRatio = viewportWidth / viewportHeight;
      viewportHeightRatio = 1;
    } else if (viewportHeight > viewportWidth) {
      viewportWidthRatio = 1;
      viewportHeightRatio = viewportHeight / viewportWidth;
    } else {
      viewportWidthRatio = 1;
      viewportHeightRatio = 1;
    }

    if (viewportWidthRatio >= ASPECT_RATIO.WIDTH) {
      setCanvasSize({
        width: viewportWidth,
        height: (viewportWidth / ASPECT_RATIO.WIDTH) * ASPECT_RATIO.HEIGHT,
      });
    } else if (viewportHeightRatio >= ASPECT_RATIO.HEIGHT) {
      setCanvasSize({
        width: (viewportHeight / ASPECT_RATIO.HEIGHT) * ASPECT_RATIO.WIDTH,
        height: viewportHeight,
      });
    }
  }

  function recalculateParentDimensions() {
    const { offsetWidth: middlePaneOffsetWidth } = middleRef.current;

    const actualMiddlePaneWidth =
      middlePaneOffsetWidth - CONTAINER_SEPARATOR_WIDTH;

    const devicePixelPerRatio =
      actualMiddlePaneWidth / (CONTAINER_RATIO.LEFT + CONTAINER_RATIO.RIGHT);
    const leftPaneWidth = devicePixelPerRatio * CONTAINER_RATIO.LEFT;
    const rightPaneWidth = devicePixelPerRatio * CONTAINER_RATIO.RIGHT;
    const rightPaneHeight =
      (rightPaneWidth / ASPECT_RATIO.WIDTH) * ASPECT_RATIO.HEIGHT;

    rightPaneRef.current.style.height = `${rightPaneHeight}px`;
    rightPaneRef.current.style.width = `${rightPaneWidth}px`;
    leftPaneRef.current.style.width = `${leftPaneWidth}px`;
    leftPaneRef.current.style["max-height"] = `${rightPaneHeight}px`;

    setStageSize({ width: rightPaneWidth, height: rightPaneHeight });
    setDpRatio(rightPaneWidth / INITIAL_STAGE_DIMENSIONS.width);
  }

  function recalculateOutOfBoundsArea() {
    const { width: canvasWidth, height: canvasHeight } = canvasSize;
    const { width: viewportWidth, height: viewportHeight } = viewportSize;

    const outOfBoundsWidth = canvasWidth - viewportWidth;
    const outOfBoundsHeight = canvasHeight - viewportHeight;

    if (outOfBoundsWidth === 0 && outOfBoundsHeight === 0) {
      setOutOfBoundsArea({
        width: 0,
        height: 0,
        x: 0,
        y: 0,
      });
      return;
    }

    setOutOfBoundsArea({
      width: outOfBoundsWidth === 0 ? viewportWidth : outOfBoundsWidth,
      height: outOfBoundsHeight === 0 ? viewportHeight : outOfBoundsHeight,
      x: outOfBoundsWidth === 0 ? 0 : viewportWidth,
      y: outOfBoundsHeight === 0 ? 0 : viewportHeight,
    });
  }

  function scaleUp() {
    const { width: viewportWidth, height: viewportHeight } = viewportSize;

    const { widthGridScaleRatio, heightGridScaleRatio } =
      calculateGridSizeScaleRatio();

    setViewPortSize({
      width: viewportWidth + GRID_SIZE * widthGridScaleRatio,
      height: viewportHeight + GRID_SIZE * heightGridScaleRatio,
    });
  }

  function scaleDown() {
    const { width: viewportWidth, height: viewportHeight } = viewportSize;

    const { widthGridScaleRatio, heightGridScaleRatio } =
      calculateGridSizeScaleRatio();

    setViewPortSize({
      width: viewportWidth - GRID_SIZE * widthGridScaleRatio,
      height: viewportHeight - GRID_SIZE * heightGridScaleRatio,
    });
  }

  function scaleXUp() {
    const { width: viewportWidth, height: viewportHeight } = viewportSize;

    setViewPortSize({
      width: viewportWidth + GRID_SIZE,
      height: viewportHeight,
    });
  }

  function scaleXDown() {
    const { width: viewportWidth, height: viewportHeight } = viewportSize;

    setViewPortSize({
      width: viewportWidth - GRID_SIZE,
      height: viewportHeight,
    });
  }

  function scaleYUp() {
    const { width: viewportWidth, height: viewportHeight } = viewportSize;

    setViewPortSize({
      width: viewportWidth,
      height: viewportHeight + GRID_SIZE,
    });
  }

  function scaleYDown() {
    const { width: viewportWidth, height: viewportHeight } = viewportSize;

    setViewPortSize({
      width: viewportWidth,
      height: viewportHeight - GRID_SIZE,
    });
  }

  function handleOnDragStart(e, { width, height, type, ...rest }) {
    const { top, left } = e.target.getBoundingClientRect();

    setDraggable({
      type,
      params: {
        ...rest,
        width,
        height,
        type,
      },
      diffX: e.pageX - left - (width * dpRatio) / 2,
      diffY: e.pageY - top - (height * dpRatio) / 2,
    });
  }

  function handleOnDragOver(e) {
    e.preventDefault();
  }

  function handleOnDrop(e) {
    e.preventDefault();

    if (!draggable || !Object.keys(draggable).length === 0) {
      return;
    }

    const {
      type,
      params: { id, width, height, ...rest },
      diffX,
      diffY,
    } = draggable;

    stageRef.current.setPointersPositions(e);
    const { x: stageXPosition, y: stageYPosition } =
      stageRef.current.getPointerPosition();
    const { width: viewportWidth, height: viewportHeight } = viewportSize;

    const { scaleX, scaleY } = getReverseScale(stageSize, canvasSize);

    const updatedXPosition = (stageXPosition - diffX) * scaleX;
    const updatedYPosition = (stageYPosition - diffY) * scaleY;

    setElements([
      ...elements,
      {
        x: getBoundPerCoord(updatedXPosition, viewportWidth, width),
        y: getBoundPerCoord(updatedYPosition, viewportHeight, height),
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
    setSelected(id);
    setDraggable(null);
  }

  function getDragBounds(coordinates, dimensions) {
    const { width: viewportWidth, height: viewportHeight } = viewportSize;
    const { width: itemWidth, height: itemHeight } = dimensions;
    const { x, y } = coordinates;

    const { scaleX, scaleY } = getScale(stageSize, canvasSize);

    const viewportWidthRelativeToStage = viewportWidth * scaleX;
    const viewportHeightRelativeToStage = viewportHeight * scaleY;
    const itemWidthRelativeToStage = itemWidth * scaleX;
    const itemHeightRelativeToStage = itemHeight * scaleY;

    return {
      x: getBoundPerCoord(
        x,
        viewportWidthRelativeToStage,
        itemWidthRelativeToStage
      ),
      y: getBoundPerCoord(
        y,
        viewportHeightRelativeToStage,
        itemHeightRelativeToStage
      ),
    };
  }

  function handleOnDragEnd(e, { id }) {
    const x = e.target.x();
    const y = e.target.y();

    const index = elements.findIndex(({ id: foundId }) => foundId === id);

    if (index === -1) {
      return;
    }

    let arr = [...elements];

    const { width, height, ...rest } = arr[index];

    arr[index] = {
      ...rest,
      width,
      height,
      x,
      y,
    };
    setElements(arr);
    setGuidelines([]);
  }

  function handleOnSelect(id) {
    setSelected(id);
  }

  function drawGuides(guides) {
    const updatedGuideline = [];

    if (guides.length === 0) {
      if (guidelines.length !== 0) {
        setGuidelines(updatedGuideline);
      }
      return;
    }

    guides.forEach(({ orientation, guideline }) => {
      updatedGuideline.push(
        orientation === "H"
          ? {
              x: 0,
              y: guideline,
              points: GUIDELINE_COORDINATES.HORIZONTAL,
            }
          : {
              x: guideline,
              y: 0,
              points: GUIDELINE_COORDINATES.VERTICAL,
            }
      );
    });

    setGuidelines(updatedGuideline);
  }

  function getGuidelineStops() {
    const vertical = [];
    const horizontal = [];

    layerRef.current
      .find(".group")
      .filter((node) => selected !== node.id())
      .map((node) => node.find(".image")[0])
      .forEach((item) => {
        const { x, y, width, height } = item.getClientRect({
          relativeTo: stageRef.current,
        });
        vertical.push([x, x + width]);
        horizontal.push([y, y + height]);
      });

    return {
      vertical: vertical.flat(),
      horizontal: horizontal.flat(),
    };
  }

  function getObjectSnapEdges(node) {
    const boundingBox = node
      .find(".image")[0]
      .getClientRect({ relativeTo: stageRef.current });

    const position = node.position();

    return {
      vertical: [
        {
          guide: Math.round(boundingBox.x),
          offset: Math.round(position.x - boundingBox.x),
          snap: "start",
        },
        {
          guide: Math.round(boundingBox.x + boundingBox.width),
          offset: Math.round(position.x - boundingBox.x - boundingBox.width),
          snap: "end",
        },
      ],
      horizontal: [
        {
          guide: Math.round(boundingBox.y),
          offset: Math.round(position.y - boundingBox.y),
          snap: "start",
        },
        {
          guide: Math.round(boundingBox.y + boundingBox.height),
          offset: Math.round(position.y - boundingBox.y - boundingBox.height),
          snap: "end",
        },
      ],
    };
  }

  function snapToGuideline(group) {
    const guidelineStops = getGuidelineStops();

    const objectSnapEdges = getObjectSnapEdges(group);

    const guides = getGuides(guidelineStops, objectSnapEdges);

    drawGuides(guides);

    if (guides.length === 0) {
      return;
    }

    let posX = null;
    let posY = null;

    const { height, width } = group
      .find(".image")[0]
      .getClientRect({ relativeTo: stageRef.current });

    guides.forEach(({ orientation, snap, guideline }) => {
      if (orientation === "H") {
        if (snap === "start") {
          posY = guideline + height / 2;
        } else {
          posY = guideline - height / 2;
        }
      } else if (snap === "start") {
        posX = guideline + width / 2;
      } else {
        posX = guideline - width / 2;
      }
    });
    const { width: viewportWidth, height: viewportHeight } = viewportSize;

    if (posX !== null) {
      group.x(getBoundPerCoord(posX, viewportWidth, width));
    } else {
      group.x(getBoundPerCoord(group.x(), viewportWidth, width));
    }
    if (posY !== null) {
      group.y(getBoundPerCoord(posY, viewportHeight, height));
    } else {
      group.y(getBoundPerCoord(group.y(), viewportHeight, height));
    }
  }

  function getOffsettedClientRect(node) {
    const { x, y, width, height } = node.getClientRect();

    return {
      x: x + INTERSECTION_OFFSET,
      y: y + INTERSECTION_OFFSET,
      width: width - INTERSECTION_OFFSET * 2,
      height: height - INTERSECTION_OFFSET * 2,
    };
  }

  function objectOverlapDetection(e) {
    const layer = layerRef.current;
    const { target } = e;

    const targetRect = getOffsettedClientRect(target.find(".image")[0]);

    let isIntersected = false;

    layer.find(".group").forEach((child) => {
      // do not check intersection with itself
      if (child === target) {
        return;
      }

      if (child.getId() !== selected) {
        child.to({ opacity: 1 });
      }

      if (
        Konva.Util.haveIntersection(
          child.find(".image")[0].getClientRect(),
          targetRect
        )
      ) {
        target.to({ opacity: 0.5 });
        target.moveToTop();
        isIntersected = true;
      }
    });

    if (!isIntersected) {
      target.to({ opacity: 1 });
    }
  }

  function handleCheckOverlapForTransformation(id) {
    if (!layerRef.current) {
      return;
    }

    const [target] = layerRef.current
      .find(".group")
      .filter((node) => node.id() === id);

    if (!target) {
      return;
    }

    objectOverlapDetection({ target });
  }

  function getGuides(guidelineStops, objectSnapEdges) {
    const verticalGuidelines = [];
    const horizontalGuidelines = [];

    guidelineStops.vertical.forEach((guideline) => {
      objectSnapEdges.vertical.forEach(({ guide, snap, offset }) => {
        const diff = Math.abs(guideline - guide);

        if (diff < GUIDELINE_OFFSET) {
          verticalGuidelines.push({
            guideline,
            diff,
            snap,
            offset,
          });
        }
      });
    });

    guidelineStops.horizontal.forEach((guideline) => {
      objectSnapEdges.horizontal.forEach(({ guide, snap, offset }) => {
        const diff = Math.abs(guideline - guide);

        if (diff < GUIDELINE_OFFSET) {
          horizontalGuidelines.push({
            guideline,
            diff,
            snap,
            offset,
          });
        }
      });
    });

    const guides = [];

    const minVerticalSnap = verticalGuidelines.sort(
      (a, b) => a.diff - b.diff
    )[0];
    const minHorizontalSnap = horizontalGuidelines.sort(
      (a, b) => a.diff - b.diff
    )[0];

    if (minVerticalSnap) {
      guides.push({
        orientation: "V",
        ...minVerticalSnap,
      });
    }
    if (minHorizontalSnap) {
      guides.push({
        orientation: "H",
        ...minHorizontalSnap,
      });
    }
    return guides;
  }

  function handleOnTransformEnd(transformation, { id }) {
    const foundIndex = elements.findIndex(({ id: foundId }) => foundId === id);

    if (foundIndex === -1) {
      return;
    }

    let arr = [...elements];

    arr[foundIndex] = {
      ...arr[foundIndex],
      ...transformation,
    };

    setElements(arr);
    handleCheckOverlapForTransformation(id);
  }

  function handleOnRotationChange(shape, id) {
    const { width, height } = shape.getClientRect({
      relativeTo: stageRef.current,
    });

    const index = elements.findIndex(({ id: foundId }) => foundId === id);

    if (index === -1) {
      return;
    }

    const { x, y } = elements[index];
    const { width: viewportWidth, height: viewportHeight } = viewportSize;

    handleOnTransformEnd(
      {
        width,
        height,
        x: getBoundPerCoord(x, viewportWidth, width),
        y: getBoundPerCoord(y, viewportHeight, height),
      },
      { id }
    );
  }

  function handleOnChangeTableType(tableType) {
    if (!selected) {
      return;
    }
    const index = elements.findIndex((element) => element.id === selected);

    if (index === -1) {
      return;
    }
    elements[index] = {
      ...elements[index],
      tableType,
    };

    setElements([...elements]);
  }

  useEffect(() => {
    recalculateOutOfBoundsArea();
    //  eslint-disable-next-line
  }, [canvasSize]);

  useLayoutEffect(() => {
    recalculateParentDimensions();
    //  eslint-disable-next-line;
  }, [windowWidth]);

  useEffect(() => {
    redrawGridlines();
    recalculateCanvasDimensions();
    //  eslint-disable-next-line
  }, [viewportSize]);

  return (
    <div className="App">
      <Container>
        <ParentPane>
          <TopPane>
            {tables
              .filter(({ assigned }) => !assigned)
              .map((table) => (
                <DraggableTable
                  dpRatio={dpRatio}
                  key={table.id}
                  table={table}
                  onDragStart={handleOnDragStart}
                  type={TABLE_TYPES.TABLE_R1}
                />
              ))}
          </TopPane>
          <MiddlePane ref={middleRef}>
            <LeftPane ref={leftPaneRef}>
              <AppRow>
                <AppColumn>
                  <DraggableContainer>
                    <DraggableTable
                      type={TABLE_TYPES.TABLE_C1}
                      onDragStart={handleOnDragStart}
                      dpRatio={dpRatio}
                      onClick={handleOnChangeTableType}
                    />
                  </DraggableContainer>
                </AppColumn>
                <AppColumn>
                  <DraggableContainer>
                    <DraggableTable
                      type={TABLE_TYPES.TABLE_R1}
                      onDragStart={handleOnDragStart}
                      dpRatio={dpRatio}
                      onClick={handleOnChangeTableType}
                    />
                  </DraggableContainer>
                </AppColumn>
                <AppColumn>
                  <DraggableContainer>
                    <DraggableTable
                      type={TABLE_TYPES.TABLE_C2}
                      onDragStart={handleOnDragStart}
                      dpRatio={dpRatio}
                      onClick={handleOnChangeTableType}
                    />
                  </DraggableContainer>
                </AppColumn>
                <AppColumn>
                  <DraggableContainer>
                    <DraggableTable
                      type={TABLE_TYPES.TABLE_R2}
                      onDragStart={handleOnDragStart}
                      dpRatio={dpRatio}
                      onClick={handleOnChangeTableType}
                    />
                  </DraggableContainer>
                </AppColumn>
              </AppRow>
              <AppRow>
                <AppColumn>
                  <DraggableContainer>
                    <DraggableTable
                      type={TABLE_TYPES.TABLE_C3}
                      onDragStart={handleOnDragStart}
                      dpRatio={dpRatio}
                      onClick={handleOnChangeTableType}
                    />
                  </DraggableContainer>
                </AppColumn>
                <AppColumn>
                  <DraggableContainer>
                    <DraggableTable
                      type={TABLE_TYPES.TABLE_R4A}
                      onDragStart={handleOnDragStart}
                      dpRatio={dpRatio}
                      onClick={handleOnChangeTableType}
                    />
                  </DraggableContainer>
                </AppColumn>
              </AppRow>
              <AppRow>
                <AppColumn>
                  <DraggableContainer>
                    <DraggableTable
                      type={TABLE_TYPES.TABLE_C4}
                      onDragStart={handleOnDragStart}
                      dpRatio={dpRatio}
                      onClick={handleOnChangeTableType}
                    />
                  </DraggableContainer>
                </AppColumn>
                <AppColumn>
                  <DraggableContainer>
                    <DraggableTable
                      type={TABLE_TYPES.TABLE_R4B}
                      onDragStart={handleOnDragStart}
                      dpRatio={dpRatio}
                      onClick={handleOnChangeTableType}
                    />
                  </DraggableContainer>
                </AppColumn>
              </AppRow>
              <AppRow>
                <AppColumn>
                  <DraggableContainer>
                    <DraggableTable
                      type={TABLE_TYPES.TABLE_C6}
                      onDragStart={handleOnDragStart}
                      dpRatio={dpRatio}
                      onClick={handleOnChangeTableType}
                    />
                  </DraggableContainer>
                </AppColumn>
                <AppColumn>
                  <DraggableContainer>
                    <DraggableTable
                      type={TABLE_TYPES.TABLE_R6}
                      onDragStart={handleOnDragStart}
                      dpRatio={dpRatio}
                      onClick={handleOnChangeTableType}
                    />
                  </DraggableContainer>
                </AppColumn>
              </AppRow>
              <AppRow>
                <AppColumn>
                  <DraggableContainer>
                    <DraggableTable
                      type={TABLE_TYPES.TABLE_R8}
                      onDragStart={handleOnDragStart}
                      dpRatio={dpRatio}
                      onClick={handleOnChangeTableType}
                    />
                  </DraggableContainer>
                </AppColumn>
              </AppRow>
              <AppRow>
                <AppColumn>
                  <DraggableContainer>
                    <DraggableTable
                      type={TABLE_TYPES.TABLE_C8}
                      onDragStart={handleOnDragStart}
                      dpRatio={dpRatio}
                      onClick={handleOnChangeTableType}
                    />
                  </DraggableContainer>
                </AppColumn>
              </AppRow>
              <AppRow>
                <AppColumn>
                  <DraggableContainer>
                    <DraggableTable
                      type={TABLE_TYPES.TABLE_R10}
                      onDragStart={handleOnDragStart}
                      dpRatio={dpRatio}
                      onClick={handleOnChangeTableType}
                    />
                  </DraggableContainer>
                </AppColumn>
              </AppRow>
            </LeftPane>
            <PaneSeparator />
            <RightPane
              ref={rightPaneRef}
              onDragOver={handleOnDragOver}
              onDrop={handleOnDrop}
            >
              <Stage
                ref={stageRef}
                {...stageSize}
                {...getScale(stageSize, canvasSize)}
              >
                <Layer ref={layerRef}>
                  {gridLines}
                  {guidelines.map((item, i) => {
                    return (
                      <Line
                        // eslint-disable-next-line react/no-array-index-key
                        key={i}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...item}
                        stroke={GUIDELINE_COLOR}
                        strokeWidth={1}
                        name="guid-line"
                        dash={[4, 6]}
                      />
                    );
                  })}
                  {elements.map((element) => {
                    const { id } = element;
                    return (
                      <StageTable
                        key={id}
                        data={element}
                        getDragBounds={getDragBounds}
                        onDragEnd={handleOnDragEnd}
                        onTransformEnd={handleOnTransformEnd}
                        onRotationChange={handleOnRotationChange}
                        onSelect={handleOnSelect}
                        selected={selected === id}
                        snapToLocation={snapToGuideline}
                        overlapDetection={objectOverlapDetection}
                      />
                    );
                  })}
                  <Rect {...outOfBoundsArea} fill="#ccc" />
                </Layer>
              </Stage>
            </RightPane>
          </MiddlePane>
        </ParentPane>
        <BottomPane>
          <Button onClick={scaleUp}>Scale Up</Button>
          <Button onClick={scaleDown}>Scale Down</Button>
          <Button onClick={scaleXUp}>Scale X Up</Button>
          <Button onClick={scaleXDown}>Scale X Down</Button>
          <Button onClick={scaleYUp}>Scale Y Up</Button>
          <Button onClick={scaleYDown}>Scale Y Down</Button>
          <pre>
            {JSON.stringify(
              {
                stage: stageSize,
                canvas: canvasSize,
                viewport: viewportSize,
                draggable,
                elements,
              },
              null,
              2
            )}
          </pre>
          <pre>{JSON.stringify([], null, 2)}</pre>
        </BottomPane>
      </Container>
    </div>
  );
}

export default App;
