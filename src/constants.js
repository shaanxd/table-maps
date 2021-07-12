import { v4 } from "uuid";

import TableR1 from "./static/table-r1.svg";
import TableC8 from "./static/table-c8.svg";

export const COLORS = ["#FF5605", "#88C147", "#0099F3", "#F0255D"];

export const GRID_LINE_OPTIONS = {
  stroke: "#A9A9A9",
  selectable: false,
};

export const ACTUAL_GRID_LINE_OPTIONS = {
  stroke: "#d2d2d2",
  selectable: false,
};

export const TABLES = [];

for (let i = 1; i <= 20; i++) {
  TABLES.push({ id: v4(), name: i, assigned: false });
}

export const INITIAL_STAGE_DIMENSIONS = {
  width: 800,
  height: 400,
};

export const ASPECT_RATIO = {
  WIDTH: 2,
  HEIGHT: 1,
};

export const GRID_SIZE = 100;

export const SCALE_FACTOR = {
  WIDTH: 80,
  HEIGHT: 40,
};

export const FONT_SIZE_IN_DEVICE_PIXELS = 18;

export const TABLE_TYPES = {
  TABLE_C1: "TABLE_C1",
  TABLE_C2: "TABLE_C2",
  TABLE_C3: "TABLE_C3",
  TABLE_C4: "TABLE_C4",
  TABLE_C6: "TABLE_C6",
  TABLE_C8: "TABLE_C8",
  TABLE_R1: "TABLE_R1",
  TABLE_R2: "TABLE_R2",
  TABLE_R4A: "TABLE_R4A",
  TABLE_R4B: "TABLE_R4B",
  TABLE_R6: "TABLE_R6",
  TABLE_R8: "TABLE_R8",
  TABLE_R10: "TABLE_R10",
};

export const DRAGGABLE_TYPES = {
  TABLE: "TABLE",
  DEAD_OBJECT: "DEAD_OBJECT",
};

export const TABLE_DATA = {
  [TABLE_TYPES.TABLE_R1]: {
    dimensions: {
      width: 50,
      height: 50,
    },
    src: TableR1,
  },
  [TABLE_TYPES.TABLE_C8]: {
    dimensions: {
      width: 100,
      height: 100,
    },
    src: TableC8,
  },
};
