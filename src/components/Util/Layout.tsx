import { useEffect, useRef, type ReactNode, type Ref, type SVGProps } from "react"
import computeLayout, { type ComputeNode, type ComputeNodeLayout, type ComputeNodeStyle } from 'css-layout';

export type LayoutProps = {
    children?: ReactNode,
    ref?: Ref<SVGGElement>
} & SVGProps<SVGGElement>


function getStyleNum(map: StylePropertyMapReadOnly, name: string): number | undefined {
    const prop = map.get(name)
    if (!prop) return undefined

    // CSSImageValue
    // CSSKeywordValue
    // CSSNumericValue
    // CSSPositionValue
    // CSSTransformValue
    // CSSUnparsedValue

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

function toComputeNode(elem: ChildNode | undefined | null, lookup: Map<SVGElement, ComputeNode>, zoom: Zoom): ComputeNode | undefined {
    if (!elem) {
        return undefined
    }
    if (elem instanceof SVGElement) {
        const computeNode = {
            style: svgNodeToNodeStyle(elem, zoom),
            children: Array.from(elem.childNodes, child => toComputeNode(child, lookup, zoom)).filter(Boolean) as ComputeNode[]
        }
        lookup.set(elem, computeNode)
        return computeNode
    }
}

function svgNodeToNodeStyle(node: SVGElement, zoom: Zoom): ComputeNodeStyle {
    const { width, height } = node.getBoundingClientRect()
    const styleMap = node.computedStyleMap()
    const w = getStyleNum(styleMap, 'width')
    const h = getStyleNum(styleMap, 'height')
    return {
        width: w ? w / zoom.x : ((node instanceof SVGGElement) ? undefined : width),
        height: h ? h / zoom.y : ((node instanceof SVGGElement) ? undefined : height),
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
}

function isInstanceOf<Types extends Function[]>(node: any, ...types: Types): node is Types[number] {
    for (const type of types) {
        if (node instanceof type) {
            return true
        }
    }
    return false
}

function applyLayout(node: SVGElement, layout: ComputeNodeLayout, zoom: { x: number, y: number }) {
    if (node instanceof SVGCircleElement) {
        const r = getStyleNum(node.computedStyleMap(), 'r') ?? 0
        node.setAttribute('cx', ((layout.left + r) * zoom.x).toString())
        node.setAttribute('cy', ((layout.top + r) * zoom.y).toString())
        return
    }
    if (node instanceof SVGEllipseElement) {
        const map = node.computedStyleMap()
        const rx = getStyleNum(map, 'rx') ?? 0
        const ry = getStyleNum(map, 'ry') ?? 0
        node.setAttribute('cx', ((layout.left + rx) * zoom.x).toString())
        node.setAttribute('cy', ((layout.top + ry) * zoom.y).toString())
        return
    }
    if (isInstanceOf(node, SVGGElement, SVGPathElement, SVGPolygonElement, SVGPolylineElement)) {
        node.setAttribute('transform', `translate(${layout.left * zoom.x}, ${layout.top * zoom.y})`)
        return
    }
    if (node instanceof SVGElement) {
        node.setAttribute('x', (layout.left * zoom.x).toString())
        node.setAttribute('y', (layout.top * zoom.y).toString())
    }
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
        const computeMap = new Map<SVGElement, ComputeNode>()
        const node = toComputeNode(childRef.current, computeMap, zoom)
        if (!node) {
            return
        }
        computeLayout(node)
        console.log(node)
        for (const [elem, node] of computeMap) {
            if (!node.layout) {
                continue
            }
            applyLayout(elem, node.layout, zoom)
        }
    }, [])
    
    return <>
        <rect ref={zoomRef} width="100" height="100" fill="#00000000" />
        <g ref={childRef} {...rest}>{children}</g>
    </>
}
