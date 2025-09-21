import { createElement, useEffect, useMemo, useRef } from "react";

export type SvgSizeElem = {
  elem: SVGElement;
  bounds: { width: number; height: number };
  move: (x: number, y: number) => void;
};
export type SvgSizeElems<Props extends string[]> = {
  [key in Props[number]]: SvgSizeElem | undefined;
};

const ZOOM_WIDTH = 100;
const ZOOM_HEIGHT = 100;

export function getStyleNum(
  map: CSSStyleDeclaration,
  name: keyof CSSStyleDeclaration,
): number | undefined {
  const prop = map[name];
  if (!prop) return undefined;
  if (typeof prop === "number") {
    return prop;
  }
  if (typeof prop === "string") {
    if (name === "flex" && prop == "0 1 auto") {
      return undefined;
    }
    if ((name === "width" || name === "height") && prop === "auto") {
      return undefined;
    }
    if (name === "maxWidth" && prop === "none") {
      return undefined;
    }
    const px = /^(-?[0-9]+)px$/.exec(prop);
    if (px) {
      return parseInt(px[1]);
    }
  }
  console.warn("Unexpected number value", prop, name, String(prop));
  return undefined;
}

export function getStyleKw<props extends string[]>(
  styleMap: CSSStyleDeclaration,
  name: keyof CSSStyleDeclaration,
  options: props,
  standard: string,
): props[number] | undefined {
  const prop = styleMap[name];
  if (!prop) {
    return undefined;
  }
  const value = typeof prop === "string" ? prop : undefined;
  if (value) {
    if (value === standard) {
      return undefined;
    }
    if (options.includes(value)) {
      return value;
    } else {
      console.warn("Unknown property", name, value);
    }
  }
  return undefined;
}

function isInstanceOf<Types extends Function[]>(
  node: any,
  ...types: Types
): node is Types[number] {
  for (const type of types) {
    if (node instanceof type) {
      return true;
    }
  }
  return false;
}

export function move(
  node: SVGElement,
  left: number,
  top: number,
  width: number,
  height: number,
) {
  left = Math.round(left * 1000) / 1000;
  top = Math.round(top * 1000) / 1000;
  if (node instanceof SVGCircleElement) {
    const r = getStyleNum(globalThis.getComputedStyle(node), "r") ?? 0;
    node.setAttribute("cx", (left + r).toString());
    node.setAttribute("cy", (top + r).toString());
    return;
  }
  if (node instanceof SVGEllipseElement) {
    const map = globalThis.getComputedStyle(node);
    const rx = getStyleNum(map, "rx") ?? 0;
    const ry = getStyleNum(map, "ry") ?? 0;
    node.setAttribute("cx", (left + rx).toString());
    node.setAttribute("cy", (top + ry).toString());
    return;
  }
  if (
    isInstanceOf(
      node,
      SVGGElement,
      SVGPathElement,
      SVGPolygonElement,
      SVGPolylineElement,
    )
  ) {
    node.setAttribute("transform", `translate(${left}, ${top})`);
    node.style.position = "absolute";
    return;
  }
  if (node instanceof SVGTextElement) {
    node.setAttribute("x", left.toString());
    node.setAttribute("y", top.toString());
    return;
  }
  node.setAttribute("x", left.toString());
  node.setAttribute("y", top.toString());
}

type Zoom = {
  x: number;
  y: number;
};

function getSizes<Props extends string[]>(
  elems: { [key in Props[number]]: SVGElement },
  zoom: Zoom,
): SvgSizeElems<Props> {
  const entries = Object.entries(elems) as [
    name: Props[number],
    elem: SVGElement,
  ][];
  return Object.fromEntries(
    entries.map(([name, elem]) => {
      const bounds = (elem as SVGElement).getClientRects()[0];
      const width = bounds.width * zoom.x;
      const height = bounds.height * zoom.y;
      return [
        name,
        {
          elem,
          bounds: { width, height },
          move: (x: number, y: number) => {
            move(elem, x, y, width, height);
          },
        },
      ];
    }),
  ) as SvgSizeElems<Props>;
}

export function useSvgSize<Props extends string[]>(
  props: Props,
  callback: (elems: SvgSizeElems<Props>) => void,
) {
  const zoomRef = useRef<SVGRectElement>(null);
  const session = useMemo(() => {
    const elems = {} as { [key in Props[number]]: SVGElement };
    const refs = Object.fromEntries(
      props.map((name: Props[number]) => [
        name,
        (elem: SVGElement | null) => {
          if (!elem) {
            delete elems[name];
          } else {
            elems[name] = elem;
          }
        },
      ]),
    ) as { [key in Props[number]]: (elem: SVGElement | null) => void };
    return {
      refs,
      elems,
    };
  }, [JSON.stringify(props)]);

  useEffect(() => {
    let prevDeps: any[] = [];
    const render = () => {
      const zoomElem = zoomRef.current;
      if (!zoomElem) {
        return;
      }
      const { elems } = session;
      zoomElem.style.visibility = "visible";
      const zoomBounds = zoomElem.getBoundingClientRect();
      const zoom: Zoom = {
        x: ZOOM_WIDTH / zoomBounds.width,
        y: ZOOM_HEIGHT / zoomBounds.height,
      };
      zoomElem.style.visibility = "hidden";
      const sizes = getSizes(elems, zoom);
      const entries = Object.entries(sizes) as [
        name: string,
        sizeElem: SvgSizeElem,
      ][];
      const deps = entries.reduce(
        (result, [name, { elem, bounds }]) => {
          result.push(name, elem, bounds.width, bounds.height);
          return result;
        },
        [] as Array<string | number | SVGElement>,
      );
      let changed = false;
      if (prevDeps.length !== deps.length) {
        changed = true;
      } else {
        for (let i = 0; i < deps.length; i++) {
          if (prevDeps[i] !== deps[i]) {
            changed = true;
            break;
          }
        }
      }
      prevDeps = deps;
      if (changed) {
        callback(sizes);
      }
    };
    render();
    const int = setInterval(render, 50);
    return () => clearInterval(int);
  }, [session]);

  return {
    ...session.refs,
    zoom: createElement("rect", {
      width: ZOOM_WIDTH,
      height: ZOOM_HEIGHT,
      ref: zoomRef,
      fill: "#00000000",
    }),
  };
}
