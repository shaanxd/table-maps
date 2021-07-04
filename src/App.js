import React, { useCallback, useEffect, useRef } from "react";
import { useDebounce, useSetState } from "react-use";
import { fabric } from "fabric";
import { debounce } from "lodash";
import {
  Container,
  DraggableCanvas,
  DroppableCanvas,
  LeftPane,
  Parent,
  RightPane,
  Separator,
  BottomPane,
  Button,
} from "./components";
import { DRAGGABLE_ITEMS } from "./data";
import {
  COLORS,
  GRID_LINE_OPTIONS,
  ACTUAL_GRID_LINE_OPTIONS,
} from "./constants";
import { getRandomInt } from "./utils";

const MULTIPLIER = 5;

/** Initial cell dimensions */
const DISPLAY_GRID = [10, 20];
const ACTUAL_GRID = [10 * MULTIPLIER, 20 * MULTIPLIER];

function getCanvasDetails(canvas) {
  return canvas ? canvas._objects.filter(({ type }) => type !== "line") : [];
}

/** Draws grid for provided canvas */
function drawGrid({ width, height }, display, actual, canvas) {
  if (!canvas) {
    return;
  }

  const [displayRows, displayColumns] = display;
  const [actualRows, actualColumns] = actual;

  const arr = [];

  /** Draws vertical grid lines */
  for (let i = 0; i <= actualColumns; i++) {
    const xCoord = (i / actualColumns) * width;
    arr.push(
      new fabric.Line([xCoord, 0, xCoord, height], ACTUAL_GRID_LINE_OPTIONS)
    );
  }

  /** Draws horizontal grid lines */
  for (let i = 0; i <= actualRows; i++) {
    const yCoord = (i / actualRows) * height;
    arr.push(
      new fabric.Line([0, yCoord, width, yCoord], ACTUAL_GRID_LINE_OPTIONS)
    );
  }

  /** Draws vertical grid lines */
  for (let i = 0; i <= displayColumns; i++) {
    const xCoord = (i / displayColumns) * width;
    arr.push(new fabric.Line([xCoord, 0, xCoord, height], GRID_LINE_OPTIONS));
  }

  /** Draws horizontal grid lines */
  for (let i = 0; i <= displayRows; i++) {
    const yCoord = (i / displayRows) * height;
    arr.push(new fabric.Line([0, yCoord, width, yCoord], GRID_LINE_OPTIONS));
  }

  canvas.add(...arr);

  /** Returns calculated dimensions of each cell */
  return {
    actualCellDimensions: {
      width: width / actualColumns,
      height: height / actualRows,
    },
    displayCellDimensions: {
      width: width / displayColumns,
      height: height / displayRows,
    },
    gridLines: arr,
  };
}

function App() {
  const rightPaneRef = useRef();
  const canvasRef = useRef();

  const [
    {
      canvas,
      draggable,
      diffX,
      diffY,
      bounds,
      displayGrid,
      actualGrid,
      displayCellDimensions,
      actualCellDimensions,
      gridLines,
    },
    setState,
  ] = useSetState({
    canvas: null,
    displayGrid: DISPLAY_GRID,
    actualGrid: ACTUAL_GRID,
    displayCellDimensions: {
      width: 0,
      height: 0,
    },
    actualCellDimensions: {
      width: 0,
      height: 0,
    },
    gridLines: null,
    draggable: null,
    diffX: 0,
    diffY: 0,
    bounds: {
      left: 0,
      top: 0,
      width: 0,
      height: 0,
    },
  });

  function handleUpdateCanvasState(updatedCanvas) {
    setState({ canvas: updatedCanvas });
  }

  const onObjectModifiedDebounced = debounce(handleUpdateCanvasState, 500, {});

  function onModifiedSnapTo(value, size) {
    return Math.round(value / size) * size;
  }

  const onObjectMoving = useCallback(
    (options) => {
      const { width, height } = actualCellDimensions;
      const { top, left } = options.target;

      options.target.set({
        left: onModifiedSnapTo(left, width),
        top: onModifiedSnapTo(top, height),
      });
    },
    [actualCellDimensions]
  );

  const onObjectScaling = useCallback(
    (options) => {
      const {
        transform,
        transform: { target },
      } = options;

      const { width, height } = actualCellDimensions;

      const targetWidth = target.width * target.scaleX;
      const targetHeight = target.height * target.scaleY;

      const snap = {
        width: onModifiedSnapTo(targetWidth, width),
        height: onModifiedSnapTo(targetHeight, height),
      };

      const dist = {
        width: Math.abs(targetWidth - snap.width),
        height: Math.abs(targetHeight - snap.height),
      };

      const centerPoint = target.getCenterPoint();

      const anchorY = transform.originY;
      const anchorX = transform.originX;

      const anchorPoint = target.translateToOriginPoint(
        centerPoint,
        anchorX,
        anchorY
      );

      const attrs = {
        scaleX: target.scaleX,
        scaleY: target.scaleY,
      };

      switch (transform.corner) {
        case "tl":
        case "br":
        case "tr":
        case "bl":
          if (dist.width < width) {
            attrs.scaleX = snap.width / target.width;
          }

          if (dist.height < height) {
            attrs.scaleY = snap.height / target.height;
          }

          break;
        case "mt":
        case "mb":
          if (dist.height < height) {
            attrs.scaleY = snap.height / target.height;
          }

          break;
        case "ml":
        case "mr":
          if (dist.width < width) {
            attrs.scaleX = snap.width / target.width;
          }

          break;
        default:
          break;
      }

      if (attrs.scaleX !== target.scaleX || attrs.scaleY !== target.scaleY) {
        target.set(attrs);
        target.setPositionByOrigin(anchorPoint, anchorX, anchorY);
      }
    },
    [actualCellDimensions]
  );

  const onObjectRotate = useCallback((options) => {
    /** Handle snap scaling logic here */
  }, []);

  const onObjectModified = useCallback(
    (options) => {
      onObjectModifiedDebounced(options.target.canvas);
    },
    [onObjectModifiedDebounced]
  );

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    canvasRef.current.__eventListeners = [];
    canvasRef.current.on({
      "object:moving": onObjectMoving,
      "object:scaling": onObjectScaling,
      "object:rotating": onObjectRotate,
      "object:modified": onObjectModified,
    });
  }, [
    onObjectMoving,
    onObjectScaling,
    onObjectRotate,
    onObjectModified,
    canvasRef,
  ]);

  function drawCanvas(width, height) {
    if (canvasRef.current) {
      return;
    }

    const canvas = new fabric.Canvas("canvas", {
      containerClass: "canvas-container",
      backgroundColor: "#FFE4E9",
      /** Added .5 buffer t display the end grid lines */
      width: width + 0.5,
      height: height + 0.5,
    });

    canvasRef.current = canvas;
    setState({
      ...drawGrid({ width, height }, displayGrid, actualGrid, canvas),
    });
  }

  useEffect(() => {
    let { left, top, width, height } =
      rightPaneRef.current.getBoundingClientRect();

    drawCanvas(width, height);

    setState({
      bounds: { left, top, width, height },
    });
    //  eslint-disable-next-line
  }, []);

  function onDragStart(e, draggable) {
    const { left, top } = e.currentTarget.getBoundingClientRect();

    setState({ draggable, diffX: e.screenX - left, diffY: e.screenY - top });
  }

  function onDragOver(e) {
    e.preventDefault();
  }

  function onDrop(e) {
    if (!draggable) {
      return;
    }

    const { component: Component, attr } = draggable;
    const { width, height } = displayCellDimensions;
    const { left, top } = bounds;

    const xActualCoord = e.screenX - left - diffX;
    const yActualCoord = e.screenY - top - diffY;

    const xSnappableCoord = xActualCoord - (xActualCoord % width);
    const ySnappableCoord = yActualCoord - (yActualCoord % height);

    const ele = new Component({
      ...attr({ width, height }),
      fill: COLORS[getRandomInt(0, COLORS.length - 1)],
      left: xSnappableCoord,
      top: ySnappableCoord,
      // originX: "center",
      // originY: "center",
    });
    canvasRef.current.add(ele);
    setState({ canvas: canvasRef.current });
  }

  function handleOnScale(updatedDisplayGrid, updatedActualGrid) {
    canvasRef.current.remove(...gridLines);
    setState({
      displayGrid: updatedDisplayGrid,
      actualGrid: updatedActualGrid,
    });
    const { width, height } = bounds;
    setState({
      ...drawGrid(
        { width, height },
        updatedDisplayGrid,
        updatedActualGrid,
        canvasRef.current
      ),
    });
  }

  function handleOnScaleUp() {
    const [displayRows, displayColumns] = displayGrid;

    const updatedDisplayGrid = [displayRows * 2, displayColumns * 2];
    const updatedActualGrid = [
      displayRows * 2 * MULTIPLIER,
      displayColumns * 2 * MULTIPLIER,
    ];

    handleOnScale(updatedDisplayGrid, updatedActualGrid);
  }

  function handleOnScaleDown() {
    const [displayRows, displayColumns] = displayGrid;

    const updatedDisplayGrid = [displayRows / 2, displayColumns / 2];
    const updatedActualGrid = [
      (displayRows / 2) * MULTIPLIER,
      (displayColumns / 2) * MULTIPLIER,
    ];

    handleOnScale(updatedDisplayGrid, updatedActualGrid);
  }

  return (
    <div className="App">
      <Container>
        <Parent>
          <LeftPane>
            <DraggableCanvas>
              {DRAGGABLE_ITEMS.map(({ id, style, ...rest }) => (
                <>
                  <div
                    style={style}
                    draggable="true"
                    onDragStart={(event) => {
                      onDragStart(event, rest);
                    }}
                  />
                  <Separator />
                </>
              ))}
            </DraggableCanvas>
          </LeftPane>
          <RightPane ref={rightPaneRef} onDragOver={onDragOver} onDrop={onDrop}>
            <DroppableCanvas id="canvas"></DroppableCanvas>
          </RightPane>
        </Parent>
        <BottomPane>
          <Button onClick={handleOnScaleUp}>Scale up</Button>
          <Button onClick={handleOnScaleDown}>Scale down</Button>
          <pre>{JSON.stringify(getCanvasDetails(canvas), null, 2)}</pre>
        </BottomPane>
      </Container>
    </div>
  );
}

export default App;
