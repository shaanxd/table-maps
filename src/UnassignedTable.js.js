import React from "react";
import styled, { css } from "styled-components";
import { DRAGGABLE_TYPES, UNASSIGNED_TABLE_DIMENSIONS } from "./constants";

import Unassigned from "./static/unassigned.svg";

const Container = styled.div`
  margin: 0.5rem;
  position: relative;
  padding: 0;
  display: flex;
`;

const Image = styled.img`
  pointer-events: none;
  ${({ devicePixelRatio }) =>
    css`
      width: ${UNASSIGNED_TABLE_DIMENSIONS.WIDTH * devicePixelRatio}px;
      height: ${UNASSIGNED_TABLE_DIMENSIONS.HEIGHT * devicePixelRatio}px;
    `};
`;

const Text = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: ${({ devicePixelRatio }) => `${12 * devicePixelRatio}px`};
`;

function UnassignedTable({
  table: { name, id },
  onDragStart,
  devicePixelRatio,
}) {
  function handleOnDragStart(e) {
    onDragStart(e, DRAGGABLE_TYPES.UNASSIGNED, {
      id,
      imageWidth: 50,
      imageHeight: 50,
      width: 50,
      height: 50,
      name,
    });
  }

  return (
    <Container draggable="true" onDragStart={handleOnDragStart}>
      <Image
        devicePixelRatio={devicePixelRatio}
        draggable="false"
        src={Unassigned}
      ></Image>
      <Text devicePixelRatio={devicePixelRatio}>{name}</Text>
    </Container>
  );
}

export default UnassignedTable;
