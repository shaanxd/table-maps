import React, { useEffect, useRef } from "react";
import { useSetState } from "react-use";
import styled from "styled-components";
import { fabric } from "fabric";
import { v4 } from "uuid";

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Parent = styled.div`
  display: flex;
  flex: 1;
  border: 5px solid red;
  padding: 1rem;
`;

const LeftPane = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem;
`;

const RightPane = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const DraggableCanvas = styled.div`
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const DroppableCanvas = styled.canvas``;

const Separator = styled.div`
  height: 20px;
`;

const COLORS = ["#FF5605", "#88C147", "#0099F3", "#F0255D"];

function getRandomInt(min, max) {
  return (
    Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1)) +
    Math.ceil(min)
  );
}

const DRAGGABLE_ITEMS = [
  {
    id: v4(),
    style: {
      width: "80px",
      height: "80px",
      backgroundColor: COLORS[getRandomInt(0, COLORS.length - 1)],
    },
    component: fabric.Rect,
    attr: ({ width, height }) => ({ width, height }),
  },
  {
    id: v4(),
    style: {
      width: "80px",
      height: "80px",
      borderRadius: "25rem",
      backgroundColor: COLORS[getRandomInt(0, COLORS.length - 1)],
    },
    component: fabric.Circle,
    attr: ({ width }) => ({ radius: width * 0.5 }),
  },
  {
    id: v4(),
    style: {
      width: "50px",
      height: "100px",
      backgroundColor: COLORS[getRandomInt(0, COLORS.length - 1)],
    },
    component: fabric.Rect,
    attr: ({ width, height }) => ({ width, height: height * 2 }),
  },
  {
    id: v4(),
    style: {
      width: "100px",
      height: "50px",
      backgroundColor: COLORS[getRandomInt(0, COLORS.length - 1)],
    },
    component: fabric.Rect,
    attr: ({ width, height }) => ({ width: width * 2, height }),
  },
];

const GRID_LINE_OPTIONS = {
  stroke: "#ccc",
  selectable: false,
};

function App() {
  const ref = useRef();
  const rightPaneRef = useRef();
  const canvasRef = useRef();

  const [
    {
      draggable,
      diffX,
      diffY,
      bounds: { left, top },
      gridSize,
      cellDimensions,
    },
    setState,
  ] = useSetState({
    gridSize: {
      rows: 10,
      columns: 20,
    },
    cellDimensions: {
      width: 0,
      height: 0,
    },
    draggable: null,
    diffX: 0,
    diffY: 0,
    bounds: {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
    },
  });

  function onObjectMoveScaleOrResize() {}

  function onObjectMoving(options, { width, height }) {
    options.target.set({
      left: Math.round(options.target.left / width) * width,
      top: Math.round(options.target.top / height) * height,
    });
  }

  function initializeCanvas(width, height) {
    if (canvasRef.current) {
      return;
    }

    const { rows, columns } = gridSize;

    const canvas = new fabric.Canvas("canvas", {
      containerClass: "canvas-container",
      backgroundColor: "#FFE4E9",
      /** Added .5 buffer t display the end grid lines */
      width: width + 0.5,
      height: height + 0.5,
    });
    canvas.on({
      "object:moving": onObjectMoveScaleOrResize,
      "object:scaling": onObjectMoveScaleOrResize,
    });
    canvas.on({
      "object:moving": (e) => {
        onObjectMoving(e, { width: width / columns, height: height / rows });
      },
    });

    canvasRef.current = canvas;

    initializeGrid(width, height);
  }

  function initializeGrid(width, height) {
    if (!canvasRef.current) {
      return;
    }

    const { rows, columns } = gridSize;

    for (let i = 0; i <= columns; i++) {
      const xCoord = (i / columns) * width;
      canvasRef.current.add(
        new fabric.Line([xCoord, 0, xCoord, height], GRID_LINE_OPTIONS)
      );
    }
    for (let i = 0; i <= rows; i++) {
      const yCoord = (i / rows) * height;
      canvasRef.current.add(
        new fabric.Line([0, yCoord, width, yCoord], GRID_LINE_OPTIONS)
      );
    }
    setState({
      cellDimensions: {
        width: width / columns,
        height: height / rows,
      },
    });
  }

  useEffect(() => {
    let { left, top, width, height, bottom, right } =
      rightPaneRef.current.getBoundingClientRect();

    const bounds = { left, top, right, bottom };

    initializeCanvas(width, height);

    setState({
      bounds,
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
    const { width, height } = cellDimensions;

    const xActualCoord = e.screenX - left - diffX;
    const yActualCoord = e.screenY - top - diffY;

    const xSnappableCoord = xActualCoord - (xActualCoord % width);
    const ySnappableCoord = yActualCoord - (yActualCoord % height);

    const ele = new Component({
      ...attr({ width, height }),
      fill: COLORS[getRandomInt(0, COLORS.length - 1)],
      left: xSnappableCoord,
      top: ySnappableCoord,
    });
    canvasRef.current.add(ele);
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
            <DroppableCanvas id="canvas" ref={ref}></DroppableCanvas>
          </RightPane>
        </Parent>
      </Container>
    </div>
  );
}

export default App;
