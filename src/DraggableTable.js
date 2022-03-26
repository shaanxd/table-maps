import React, { useMemo } from "react";
import styled, { css } from "styled-components";
import { v4 } from "uuid";
import {
  DRAGGABLE_TYPES,
  FONT_SIZE_IN_DEVICE_PIXELS,
  TABLE_DATA,
} from "./constants";

const Container = styled.div`
  margin: 0.5rem;
  position: relative;
  padding: 0;
  display: flex;
`;

const Image = styled.img`
  pointer-events: none;
  ${({ dimensions: { width, height } }) => {
    return css`
      width: ${width}px;
      height: ${height}px;
    `;
  }}
`;

const Text = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: ${({ size }) => `${size}px`};
`;

function DraggableTable({
  table: { name, id },
  onDragStart,
  dpRatio,
  type,
  onClick,
}) {
  const {
    dimensions: { width, height },
    src,
  } = TABLE_DATA[type];

  function handleOnDragStart(e) {
    onDragStart(e, {
      id: id || v4(),
      width,
      height,
      name: name || "23",
      tableType: type,
      draggableType: DRAGGABLE_TYPES.TABLE,
    });
  }

  function handleOnClick() {
    onClick(type);
  }

  const { dimensions, size } = useMemo(
    () => ({
      dimensions: {
        width: dpRatio * width,
        height: dpRatio * height,
      },
      size: FONT_SIZE_IN_DEVICE_PIXELS * dpRatio,
    }),
    //  eslint-disable-next-line
    [dpRatio]
  );

  return (
    <Container
      draggable="true"
      onDragStart={handleOnDragStart}
      onClick={handleOnClick}
    >
      <Image dimensions={dimensions} draggable="false" src={src}></Image>
      <Text size={size}>{name}</Text>
    </Container>
  );
}

DraggableTable.defaultProps = {
  table: {
    id: null,
    name: null,
  },
  onClick: () => {},
};

export default DraggableTable;
