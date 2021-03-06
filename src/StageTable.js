import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import useImage from "use-image";
import { Image, Text, Group, Transformer, Rect } from "react-konva";
import { FONT_SIZE_IN_DEVICE_PIXELS, TABLE_DATA } from "./constants";

function getOffset({ width, height }, textDimensions) {
  if (textDimensions) {
    const { textWidth, textHeight } = textDimensions;
    return {
      x: Math.round(width * 0.5 - textWidth * 0.5),
      y: Math.round(height * 0.5 - textHeight * 0.5),
    };
  }
  return {
    x: Math.round(width * 0.5),
    y: Math.round(height * 0.5),
  };
}

function StageTable({
  data,
  getDragBounds,
  onSelect,
  selected,
  onDragEnd,
  onTransformEnd,
  onRotationChange,
  snapToLocation,
  overlapDetection,
}) {
  const textRef = useRef();
  const trRef = useRef();
  const shapeRef = useRef();
  const groupRef = useRef();

  const [textDimensions, setTextDimensions] = useState({
    textWidth: 0,
    textHeight: 0,
  });

  const { x, y, id, name, width, height, rotation, tableType } = data;

  const {
    src,
    dimensions: { width: imageWidth, height: imageHeight },
  } = TABLE_DATA[tableType];

  useLayoutEffect(() => {
    const { textWidth, textHeight } = textRef.current;

    setTextDimensions({ textWidth, textHeight });
  }, []);

  useEffect(() => {
    onRotationChange(shapeRef.current, id);
    //  eslint-disable-next-line
  }, [rotation, tableType]);

  useEffect(() => {
    if (selected) {
      // we need to attach transformer manually
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [selected]);

  const [img] = useImage(src);

  function handleGetDragBounds(pos) {
    return getDragBounds(pos, { width, height });
  }

  function handleOnSelect() {
    onSelect(id);
  }

  function handleDragStart(e) {
    onSelect(id);
  }

  function handleDragEnd(e) {
    onDragEnd(e, { id });
  }

  function handleDragMove(e) {
    overlapDetection(e);
    snapToLocation(groupRef.current);
  }

  function handleOnTransformEnd(e) {
    shapeRef.current.x(width / 2);
    shapeRef.current.y(height / 2);

    onTransformEnd(
      { rotation: Math.round(e.currentTarget.rotation()) },
      { id }
    );
  }

  return (
    <Group
      id={id}
      x={x}
      y={y}
      draggable
      dragBoundFunc={handleGetDragBounds}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragMove={handleDragMove}
      name="group"
      offsetX={width / 2}
      offsetY={height / 2}
      ref={groupRef}
      rotation={0}
    >
      {selected && (
        <Rect
          x={0}
          y={0}
          width={width}
          height={height}
          stroke="red"
          strokeWidth={1}
          dash={[2, 2]}
        />
      )}
      <Image
        image={img}
        width={imageWidth}
        height={imageHeight}
        name="image"
        ref={shapeRef}
        rotation={rotation}
        onClick={handleOnSelect}
        onTap={handleOnSelect}
        x={width / 2}
        y={height / 2}
        onTransformEnd={handleOnTransformEnd}
        offsetX={imageWidth / 2}
        offsetY={imageHeight / 2}
      ></Image>
      <Text
        ref={textRef}
        {...getOffset({ width, height }, textDimensions)}
        text={name}
        fontSize={FONT_SIZE_IN_DEVICE_PIXELS}
      />
      {selected && (
        <Transformer ref={trRef} resizeEnabled={false}></Transformer>
      )}
    </Group>
  );
}

export default StageTable;
