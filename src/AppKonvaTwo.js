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
} from "./components";
import {
  ASPECT_RATIO,
  TABLES,
  INITIAL_STAGE_DIMENSIONS,
  GRID_SIZE,
} from "./constants";
import UnassignedTable from "./UnassignedTable.js";

function getScale(sceneDimensions, virtualDimensions) {
  const { width: sceneWidth, height: sceneHeight } = sceneDimensions;
  const { width: virtualWidth, height: virtualHeight } = virtualDimensions;

  return {
    scaleX: sceneWidth / virtualWidth,
    scaleY: sceneHeight / virtualHeight,
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

function App() {
  const rightPaneRef = useRef();
  const middleRef = useRef();
  const leftPaneRef = useRef();
  const stageRef = useRef();

  const { width: windowWidth } = useWindowSize();

  const [tables, setTables] = useState(TABLES);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [canvasSize, setCanvasSize] = useState(INITIAL_STAGE_DIMENSIONS);
  const [gridLines, setGridLines] = useState([]);
  const [viewportSize, setViewPortSize] = useState(INITIAL_STAGE_DIMENSIONS);
  const [outOfBoundsArea, setOutOfBoundsArea] = useState({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });
  const [devicePixelRatio, setDevicePixelRatio] = useState(1);

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
    const { offsetWidth: leftPaneOffsetWidth } = leftPaneRef.current;
    const { offsetWidth: middlePaneOffsetWidth } = middleRef.current;

    const canvasParentWidth = middlePaneOffsetWidth - leftPaneOffsetWidth;

    const scaledHeight =
      (canvasParentWidth / ASPECT_RATIO.WIDTH) * ASPECT_RATIO.HEIGHT;

    rightPaneRef.current.style.height = `${scaledHeight}px`;
    rightPaneRef.current.style.width = `${canvasParentWidth}px`;

    setStageSize({ width: canvasParentWidth, height: scaledHeight });
    setDevicePixelRatio(canvasParentWidth / INITIAL_STAGE_DIMENSIONS.width);
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
                <UnassignedTable
                  devicePixelRatio={devicePixelRatio}
                  key={table.id}
                  table={table}
                  onDragStart={() => {}}
                />
              ))}
          </TopPane>
          <MiddlePane ref={middleRef}>
            <LeftPane ref={leftPaneRef}></LeftPane>
            <RightPane ref={rightPaneRef}>
              <Stage
                ref={stageRef}
                {...stageSize}
                {...getScale(stageSize, canvasSize)}
              >
                <Layer>
                  {gridLines}
                  <Rect x={10} y={10} width={50} height={50} fill="red" />
                  <Rect x={70} y={70} width={25} height={25} fill="red" />
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
