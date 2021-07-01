import React, { useLayoutEffect, useRef } from "react";
import { useSetState } from "react-use";
import styled from "styled-components";
import { v4 } from "uuid";
import Moveable from "react-moveable";

const COLORS = ["#FF5605", "#88C147", "#0099F3", "#F0255D"];

function getRandomInt(min, max) {
  return (
    Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1)) +
    Math.ceil(min)
  );
}

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Parent = styled.div`
  display: flex;
  flex: 1;
  border: 2px solid red;
  padding: 1rem;
`;

const LeftPane = styled.div`
  border: 2px solid orange;
  display: flex;
  flex-direction: column;
  padding: 1rem;
`;

const RightPane = styled.div`
  flex: 1;
  border: 2px solid blue;
  display: flex;
  flex-direction: column;
  padding: 1rem;
`;

const DraggableCanvas = styled.div`
  flex: 1;
  border: 2px solid green;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const DroppableCanvas = styled.div`
  flex: 1;
  border: 2px solid green;
  position: relative;
`;

const DraggableSquare = styled.div`
  width: 80px;
  height: 80px;
  background-color: #88c147;
`;

const Separator = styled.div`
  height: 20px;
`;

const DraggableCircle = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 25rem;
  background-color: #88c147;
`;

const DraggableTallRect = styled.div`
  width: 50px;
  height: 80px;
  background-color: #88c147;
`;

const DraggableWideRect = styled.div`
  width: 100px;
  height: 50px;
  background-color: #88c147;
`;

const DraggableOval = styled.div`
  width: 100px;
  height: 50px;
  border-radius: 25rem;
  background-color: #88c147;
`;

function App() {
  const ref = useRef();
  const squareRef = useRef();

  let rect;

  const [{ elements, component, diffX, diffY, bounds }, setState] = useSetState(
    {
      elements: [],
      component: null,
      diffX: 0,
      diffY: 0,
      bounds: {
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
      },
    }
  );

  useLayoutEffect(() => {
    const { width, height } = ref.current.getBoundingClientRect();
    setState({
      bounds: {
        left: 0,
        right: width,
        top: 0,
        bottom: height,
      },
    });
    //  eslint-disable-next-line
  }, []);

  function onDragStart(e) {
    const { left, top } = e.currentTarget.getBoundingClientRect();

    setState({
      component: e.target.cloneNode(true),
      diffX: e.screenX - left,
      diffY: e.screenY - top,
    });
  }

  function onDragOver(event) {
    event.preventDefault();
  }

  function onDrop(event) {
    if (!component) {
      return;
    }
    if (!rect) {
      rect = event.target.getBoundingClientRect();
    }
    let ele = component;
    const generatedId = v4();

    ele.id = `moveable_${generatedId}`;
    ele.style.position = "absolute";
    ele.style.left = `${event.screenX - rect.left - diffX}px`;
    ele.style.top = `${event.screenY - rect.top - diffY}px`;
    ele.style.backgroundColor = COLORS[getRandomInt(0, COLORS.length - 1)];

    event.target.appendChild(component);

    setState({
      elements: [...elements, generatedId],
      component: null,
    });
  }

  function onRotate({ target, transform }) {
    target.style.transform = transform;
  }

  function onResize({ target, width, height, delta, drag }) {
    if (!target) {
      return;
    }

    delta[0] && (target.style.width = `${width}px`);
    delta[1] && (target.style.height = `${height}px`);
    target.style.transform = drag.transform;
  }

  function onDrag({ target, transform }) {
    if (!target) {
      return;
    }
    target.style.transform = transform;
  }

  return (
    <div className="App">
      <Container>
        <Parent>
          <LeftPane>
            <DraggableCanvas>
              <DraggableSquare draggable="true" onDragStart={onDragStart} />
              <Separator />
              <DraggableCircle draggable="true" onDragStart={onDragStart} />
              <Separator />
              <DraggableTallRect draggable="true" onDragStart={onDragStart} />
              <Separator />
              <DraggableWideRect draggable="true" onDragStart={onDragStart} />
              <Separator />
              <DraggableOval draggable="true" onDragStart={onDragStart} />
            </DraggableCanvas>
          </LeftPane>
          <RightPane>
            <DroppableCanvas ref={ref} onDragOver={onDragOver} onDrop={onDrop}>
              {elements.map((id) => (
                <Moveable
                  key={id}
                  snappable={true}
                  target={document.querySelector(`#moveable_${id}`)}
                  bounds={bounds}
                  draggable
                  resizable
                  rotatable
                  origin={false}
                  onRotate={onRotate}
                  onResize={onResize}
                  onDrag={onDrag}
                  keepRatio
                  snapGridWidth={16}
                  snapGridHeight={16}
                />
              ))}
            </DroppableCanvas>
          </RightPane>
        </Parent>
      </Container>
    </div>
  );
}

export default App;
