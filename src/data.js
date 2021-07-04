import { fabric } from "fabric";
import { v4 } from "uuid";
import { COLORS } from "./constants";
import { getRandomInt } from "./utils";

export const DRAGGABLE_ITEMS = [
  {
    id: v4(),
    style: {
      width: "80px",
      height: "80px",
      backgroundColor: COLORS[getRandomInt(0, COLORS.length - 1)],
    },
    component: fabric.Rect,
    attr: ({ width, height }) => ({ width, height }),
  },
  {
    id: v4(),
    style: {
      width: "80px",
      height: "80px",
      borderRadius: "25rem",
      backgroundColor: COLORS[getRandomInt(0, COLORS.length - 1)],
    },
    component: fabric.Circle,
    attr: ({ width }) => ({ radius: width * 0.5 }),
  },
  {
    id: v4(),
    style: {
      width: "50px",
      height: "100px",
      backgroundColor: COLORS[getRandomInt(0, COLORS.length - 1)],
    },
    component: fabric.Rect,
    attr: ({ width, height }) => ({ width, height: height * 2 }),
  },
  {
    id: v4(),
    style: {
      width: "100px",
      height: "50px",
      backgroundColor: COLORS[getRandomInt(0, COLORS.length - 1)],
    },
    component: fabric.Rect,
    attr: ({ width, height }) => ({ width: width * 2, height }),
  },
];
