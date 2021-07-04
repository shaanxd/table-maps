import styled from "styled-components";

export const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const Parent = styled.div`
  display: flex;
  flex: 1;
  border: 5px solid red;
  padding: 1rem;
`;

export const LeftPane = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem;
`;

export const RightPane = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

export const DraggableCanvas = styled.div`
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const DroppableCanvas = styled.canvas``;

export const Separator = styled.div`
  height: 20px;
`;

export const BottomPane = styled.div`
  width: 100%;
  padding: 1rem;
  flex: 1;
  overflow: auto;
  box-sizing: border-box;
`;

export const Button = styled.button`
  padding: 1rem;
  background-color: #0099f3;
  border: none;
  border-radius: 5px;
  color: #ffffff;
`;
