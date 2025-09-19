import { useEffect, useRef, type ReactNode, type Ref, type SVGProps } from "react"
import computeLayout, { type ComputeNode, type ComputeNodeLayout, type ComputeNodeStyle } from 'css-layout';

export type LayoutProps = {
    children?: ReactNode,
    ref?: Ref<SVGGElement>
} & SVGProps<SVGGElement>


function getStyleNum(map: StylePropertyMapReadOnly, name: string): number | undefined {
    const prop = map.get(name)
    if (!prop) return undefined
    if (prop instanceof CSSNumericValue) {
        return prop.to("px").value
    }
    if (prop instanceof CSSKeywordValue) {
        if (prop.value === 'auto') {
            return undefined
        }
        if (prop.value === 'none') {
            return undefined
        }
    }
    if (prop instanceof CSSStyleValue) {
        if (name === 'flex' && prop.toString() === '0 1 auto') {
            return undefined
        }
    }
    console.warn('Unexpected number value', prop, name, String(prop))
    return undefined
}

function getStyleKw<props extends string[]>(styleMap: StylePropertyMapReadOnly, name: string, options: props, standard: string): props[number] | undefined {
    const prop = styleMap.get(name)
    if (!prop) {
        return undefined
    }
    const value = (
        prop instanceof CSSKeywordValue ? prop.value :
        prop instanceof CSSStyleValue ? prop.toString() :
        undefined
    )
    if (value) {
        if (value === standard) {
            return undefined
        }
        if (options.includes(value)) {
            return value
        } else {
            console.warn('Unknown property', name, value)
        }
    }
    return undefined
}

interface Zoom {
    x: number
    y: number
}

function toComputeNode(elem: SVGElement, computeNode: ComputeNode, lookup: Map<SVGElement, ComputeNode>, zoom: Zoom): boolean {
    let changed = svgNodeToNodeStyle(elem, zoom, computeNode.style)
    let index = 0
    for (const child of elem.childNodes) {
        if (!child || !(child instanceof SVGElement)) {
            continue
        }
        let node = computeNode.children[index]
        if (!node) {
            node = {
                style: {},
                children: [],
                layout: {
                    bottom: 0,
                    left: 0,
                    width: 0,
                    height: 0,
                    top: 0,
                    right: 0,
                    direction: 'ltr'
                }
            }
            changed = true
            computeNode.children[index] = node
        }
        if (toComputeNode(child, node, lookup, zoom)) {
            changed = true
        }
        index += 1
    }
    // Remove old nodes that exceed the current need
    const removed = computeNode.children.splice(index, Number.MAX_SAFE_INTEGER)
    changed ||= removed.length > 0
    lookup.set(elem, computeNode)
    return changed
}

function svgNodeToNodeStyle(node: SVGElement, zoom: Zoom, style: ComputeNodeStyle): boolean {
    const bounds = node.getBoundingClientRect()
    const styleMap = node.computedStyleMap()
    const w = getStyleNum(styleMap, 'width')
    const h = getStyleNum(styleMap, 'height')
    const newStyle: ComputeNodeStyle = {
        width: w ? w : ((node instanceof SVGGElement) ? undefined : bounds.width * zoom.x),
        height: h ? h : ((node instanceof SVGGElement) ? undefined : bounds.height * zoom.y),
        minWidth: getStyleNum(styleMap, 'min-width'),
        maxWidth: getStyleNum(styleMap, 'max-width'),
        paddingLeft: getStyleNum(styleMap, 'padding-left'),
        paddingRight: getStyleNum(styleMap, 'padding-right'),
        paddingTop: getStyleNum(styleMap, 'padding-top'),
        paddingBottom: getStyleNum(styleMap, 'padding-bottom'),
        marginLeft: getStyleNum(styleMap, 'margin-left'),
        marginRight: getStyleNum(styleMap, 'margin-right'),
        marginTop: getStyleNum(styleMap, 'margin-top'),
        marginBottom: getStyleNum(styleMap, 'margin-bottom'),
        position: getStyleKw(styleMap, 'position', ['absolute', 'relative'] as const, 'static'),
        alignItems: getStyleKw(styleMap, 'align-items', ['flex-start', 'flex-end', 'center', 'stretch'] as const, 'normal'),
        alignSelf: getStyleKw(styleMap, 'align-self', ['flex-start', 'flex-end', 'center', 'stretch'] as const, 'auto'),
        flex: getStyleNum(styleMap, 'flex'),
        flexDirection: getStyleKw(styleMap, 'flex-direction', ['column', 'row'] as const, 'column'),
        flexWrap: getStyleKw(styleMap, 'flex-wrap', ['wrap', 'nowrap'] as const, 'wrap'),
        justifyContent: getStyleKw(styleMap, 'justify-content', ['flex-start', 'flex-end', 'center', 'space-between', 'space-around'] as const, 'normal'),
    }
    let changed = false
    for(const [rawKey, value] of Object.entries(newStyle)) {
        const key = rawKey as keyof ComputeNodeStyle
        if (style[key] !== value) {
            changed = true
            style[key] = value
        }
    }
    return changed
}

function isInstanceOf<Types extends Function[]>(node: any, ...types: Types): node is Types[number] {
    for (const type of types) {
        if (node instanceof type) {
            return true
        }
    }
    return false
}

export function move(node: SVGElement, left: number, top: number) {
    if (node instanceof SVGCircleElement) {
        const r = getStyleNum(node.computedStyleMap(), 'r') ?? 0
        node.setAttribute('cx', ((left + r)).toString())
        node.setAttribute('cy', ((top + r)).toString())
        return
    }
    if (node instanceof SVGEllipseElement) {
        const map = node.computedStyleMap()
        const rx = getStyleNum(map, 'rx') ?? 0
        const ry = getStyleNum(map, 'ry') ?? 0
        node.setAttribute('cx', ((left + rx)).toString())
        node.setAttribute('cy', ((top + ry)).toString())
        return
    }
    if (isInstanceOf(node, SVGGElement, SVGPathElement, SVGPolygonElement, SVGPolylineElement)) {
        node.setAttribute('transform', `translate(${left}, ${top})`)
        node.style.position = 'absolute'
        return
    }
    node.setAttribute('x', left.toString())
    node.setAttribute('y', top.toString())
}

function applyLayout(node: SVGElement, layout: ComputeNodeLayout) {
    move(node, layout.left, layout.top)
}

export const Layout = ({ children, ref, ...rest }: LayoutProps) => {
    const childRef = useRef<SVGGElement>(null)
    const zoomRef = useRef<SVGRectElement>(null)
    useEffect(() => {
        if (typeof ref === 'function') {
            ref(childRef.current)
        } else if (ref) {
            ref.current = childRef.current
        }
        const zoomRect = zoomRef.current?.getBoundingClientRect()
        if (!zoomRect) {
            return
        }
        const zoom = {
            x: 100 / zoomRect.width,
            y: 100 / zoomRect.height
        }
        const root = childRef.current
        if (!root) {
            return
        }
        const rootNode: ComputeNode = {
            style: {},
            children: []
        }
        const rerender = () => {
            const computeMap = new Map<SVGElement, ComputeNode>()
            const changed = toComputeNode(root, rootNode, computeMap, zoom)
            if (!changed) {
                return
            }
            computeLayout(rootNode)
            for (const [elem, node] of computeMap) {
                if (!node.layout) {
                    continue
                }
                applyLayout(elem, node.layout, zoom)
            }
        }
        // Need to rerender if things change...
        rerender()
        let int = setInterval(rerender, 100)
        return () => clearInterval(int)
    }, [])
    
    return <>
        <rect ref={zoomRef} width="100" height="100" fill="#00000000" />
        <g ref={childRef} {...rest}>{children}</g>
    </>
}
