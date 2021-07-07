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
  WIDTH: 600,
  HEIGHT: 400,
};
