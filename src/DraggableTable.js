import React, { useMemo } from "react";
import styled, { css } from "styled-components";
import {
  DRAGGABLE_TYPES,
  FONT_SIZE_IN_DEVICE_PIXELS,
  TABLE_DATA,
  TABLE_TYPES,
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

const {
  dimensions: { width, height },
  src,
} = TABLE_DATA[TABLE_TYPES.TABLE_R1];

function DraggableTable({ table: { name, id }, onDragStart, dpRatio }) {
  function handleOnDragStart(e) {
    onDragStart(e, {
      id,
      imageWidth: width,
      imageHeight: height,
      width,
      height,
      name,
      tableType: TABLE_TYPES.TABLE_R1,
      draggableType: DRAGGABLE_TYPES.TABLE,
    });
  }

  const { dimensions, size } = useMemo(
    () => ({
      dimensions: {
        width: dpRatio * width,
        height: dpRatio * height,
      },
      size: FONT_SIZE_IN_DEVICE_PIXELS * dpRatio,
    }),
    [dpRatio]
  );

  return (
    <Container draggable="true" onDragStart={handleOnDragStart}>
      <Image dimensions={dimensions} draggable="false" src={src}></Image>
      <Text size={size}>{name}</Text>
    </Container>
  );
}

export default DraggableTable;
