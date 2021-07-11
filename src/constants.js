import { v4 } from "uuid";

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

export const DRAGGABLE_TYPES = {
  UNASSIGNED: "UNASSIGNED",
};

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

export const UNASSIGNED_TABLE_DIMENSIONS = {
  WIDTH: 50,
  HEIGHT: 50,
};
