import { v4 } from "uuid";

import TableC1 from "./static/table-c1.svg";
import TableC2 from "./static/table-c2.svg";
import TableC3 from "./static/table-c3.svg";
import TableC4 from "./static/table-c4.svg";
import TableC6 from "./static/table-c6.svg";
import TableC8 from "./static/table-c8.svg";
import TableR1 from "./static/table-r1.svg";
import TableR2 from "./static/table-r2.svg";
import TableR4A from "./static/table-r4a.svg";
import TableR4B from "./static/table-r4b.svg";
import TableR6 from "./static/table-r6.svg";
import TableR8 from "./static/table-r8.svg";
import TableR10 from "./static/table-r10.svg";

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
  width: 700,
  height: 500,
};

export const ASPECT_RATIO = {
  WIDTH: 1.4,
  HEIGHT: 1,
};

export const GRID_SIZE = 100;

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
  [TABLE_TYPES.TABLE_C1]: {
    dimensions: {
      width: 50,
      height: 50,
    },
    src: TableC1,
  },
  [TABLE_TYPES.TABLE_C2]: {
    dimensions: {
      width: 60,
      height: 60,
    },
    src: TableC2,
  },
  [TABLE_TYPES.TABLE_C3]: {
    dimensions: {
      width: 66,
      height: 66,
    },
    src: TableC3,
  },
  [TABLE_TYPES.TABLE_C4]: {
    dimensions: {
      width: 70,
      height: 70,
    },
    src: TableC4,
  },
  [TABLE_TYPES.TABLE_C6]: {
    dimensions: {
      width: 85,
      height: 85,
    },
    src: TableC6,
  },
  [TABLE_TYPES.TABLE_C8]: {
    dimensions: {
      width: 110,
      height: 110,
    },
    src: TableC8,
  },
  [TABLE_TYPES.TABLE_R1]: {
    dimensions: {
      width: 50,
      height: 50,
    },
    src: TableR1,
  },
  [TABLE_TYPES.TABLE_R2]: {
    dimensions: {
      width: 50,
      height: 50,
    },
    src: TableR2,
  },
  [TABLE_TYPES.TABLE_R4A]: {
    dimensions: {
      width: 60,
      height: 60,
    },
    src: TableR4A,
  },
  [TABLE_TYPES.TABLE_R4B]: {
    dimensions: {
      width: 80,
      height: 60,
    },
    src: TableR4B,
  },
  [TABLE_TYPES.TABLE_R6]: {
    dimensions: {
      width: 120,
      height: 60,
    },
    src: TableR6,
  },
  [TABLE_TYPES.TABLE_R8]: {
    dimensions: {
      width: 160,
      height: 60,
    },
    src: TableR8,
  },
  [TABLE_TYPES.TABLE_R10]: {
    dimensions: {
      width: 200,
      height: 60,
    },
    src: TableR10,
  },
};

export const CONTAINER_RATIO = {
  LEFT: 1,
  RIGHT: 2.5,
};

export const CONTAINER_SEPARATOR_WIDTH = 10;
