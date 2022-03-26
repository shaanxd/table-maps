import { Col, Row } from "react-bootstrap";
import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 800px;
  overflow: auto;
`;

export const MiddlePane = styled.div`
  display: flex;
`;

export const LeftPane = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #ededed;
  border: 1px solid #d2d2d2;
  overflow-y: auto;
`;

export const RightPane = styled.div`
  display: flex;
  flex: 1;
  box-sizing: border-box;
  margin-bottom: auto;
  border: 1px solid #d2d2d2;
`;

export const BottomPane = styled.div`
  width: 100%;
  padding: 1rem;
  overflow: auto;
  box-sizing: border-box;
  border: 1px solid #d2d2d2;
  max-height: 100%;
`;

export const Button = styled.button`
  padding: 0.75rem;
  background-color: #0099f3;
  border: none;
  border-radius: 5px;
  color: #ffffff;
  font-size: 1rem;
  margin-right: 1rem;
`;

export const TopPane = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 1rem;
  border: 1px solid #d2d2d2;
  margin-bottom: 10px;
`;

export const ParentPane = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  border: 1px solid #d2d2d2;
`;

export const PaneSeparator = styled.div`
  width: 10px;
`;

export const AppRow = styled(Row)`
  margin: 0;
  padding: 0;
  margin: 10px 0px;
`;

export const AppColumn = styled(Col)`
  margin: 0;
  padding: 0;
  display: flex;
`;

export const DraggableContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
`;
