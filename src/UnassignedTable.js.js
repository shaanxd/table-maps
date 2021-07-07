import React from "react";
import styled from "styled-components";
import { DRAGGABLE_TYPES } from "./constants";

import Unassigned from "./static/unassigned.svg";

const Container = styled.div`
  margin: 0.5rem;
  position: relative;
  font-size: 0.7rem;
  padding: 0;
  display: flex;
`;

const Image = styled.img`
  width: 50px;
  height: 50px;
  pointer-events: none;
`;

const Text = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

function UnassignedTable({ table: { name, id }, onDragStart }) {
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
      <Image draggable="false" src={Unassigned}></Image>
      <Text>{name}</Text>
    </Container>
  );
}

export default UnassignedTable;
