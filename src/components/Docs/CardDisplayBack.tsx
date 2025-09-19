import { Color } from "@/docs/card";
import type { CardDisplayVariantProps } from "./CardDisplayType";
import { CARD_HEIGHT, CARD_WIDTH, CardSvg } from "./CardSvg";
import PermanentMarker from "@/utils/PermanentMarker";
import { useEffect, useMemo, useRef } from "react";
import { move } from "../Util/Layout";
import ShipporiAntique from "@/utils/ShipporiAntiqueB1";

type SvgSizeElem = {
    elem: SVGElement,
    bounds: { width: number, height: number }
}
type SvgSizeElems<Props extends string[]> = {
    [key in Props[number]]: SvgSizeElem | undefined
}

const ZOOM_WIDTH = 100
const ZOOM_HEIGHT = 100

type Zoom = {
    x: number
    y: number
}

function useSvgSize<Props extends string[]>(
    props: Props,
    callback: (elems: SvgSizeElems<Props>) => void
) {
    const zoomRef = useRef<SVGRectElement>(null)
    const { refs, elems } = useMemo(() => {
        const elems = {} as { [key in Props[number]]: SVGElement }
        const refs = Object.fromEntries(props.map((name: Props[number]) => ([
            name,
            (elem: SVGElement | null) => {
                if (!elem) {
                    delete elems[name]
                } else {
                    elems[name] = elem
                }
            }
        ]))) as { [key in Props[number]]: (elem: SVGElement | null) => void}
        return {
            refs, elems
        }
    }, props)

    useEffect(
        () => {
            const zoomElem = zoomRef.current
            if (!zoomElem) {
                return
            }
            for (const prop of props) {
                if (elems[prop as Props[number]] === undefined) {
                    return
                }
            }
            let prevDeps: any[] = []
            const render = () => {
                const sizes = getSizes(elems)
                const entries = Object.entries(sizes) as [name: string, sizeElem: SvgSizeElem][]
                const deps = entries.reduce((result, [name, { elem, bounds }]) => {
                    result.push(name, elem, bounds.width, bounds.height)
                    return result
                }, [] as Array<string|number|SVGElement>)
                let changed = false
                if (prevDeps.length !== deps.length) {
                    changed = true
                } else {
                    for (let i = 0; i < deps.length; i++) {
                        if (prevDeps[i] !== deps[i]) {
                            console.log('changed!', i)
                            changed = true
                            break
                        }
                    }
                }
                prevDeps = deps
                if (changed) {
                    callback(sizes)
                }
            }
            render()
            const int = setInterval(render, 50)
            return () => clearInterval(int)
        },
        [...props, ...Object.values(elems)]
    )
    
    return {
        ...refs,
        zoom: <rect width={ZOOM_WIDTH} height={ZOOM_HEIGHT} ref={zoomRef} fill="#00000000" opacity={0} />
    }
}

export function CardDisplayBack({ json, isCut }: CardDisplayVariantProps) {
    const { callname, callname_kana, zoom } = useSvgSize(
        ['callname', 'callname_kana'] as const,
        ({ callname, callname_kana }) => {
            if (callname) {
                const centerX = (CARD_WIDTH / 2)
                const centerY = (CARD_HEIGHT / 2)
                move(
                    callname.elem,
                    centerX - callname.bounds.width,
                    centerY + callname.bounds.height / 2
                )
                if (callname_kana) {
                    move(
                        callname_kana.elem,
                        centerX - callname_kana.bounds.width,
                        centerY - callname.bounds.height / 2 - callname_kana.bounds.height
                    )
                }
            }
        }
    )
    return <CardSvg isCut={isCut} background={((json.color ? Color[json.color] : null) || Color.red).rgb}>
        <style>{`
            ${PermanentMarker}
            ${ShipporiAntique}
            text {
                color: #fff;
                font-size: 105;
            }     
        `}</style>
        {zoom}
        <image href="https://public.oktech.jp/images/logo-and-design/OKTech-logo-white.svg" width={200} x={20} y={20} />
        <text ref={callname} style={{ fontSize: 100, fontFamily: 'Permanent Marker', fill: "white" }}>{json.callname}</text>
        <text ref={callname_kana} style={{ fontSize: 30, fontFamily: 'Shippori Antique B1', fill: "white" }}>{json.callname_kana}</text>
    </CardSvg>
}

function getSizes<Props extends string[]>(
    elems: { [key in Props[number]]: SVGElement; }
): SvgSizeElems<Props> {
    const entries = Object.entries(elems) as [name: Props[number], elem: SVGElement][]
    return Object.fromEntries(entries.map(([name, elem]) => {
        const { width, height } = (elem as SVGElement).getBoundingClientRect()
        return [name, {
            elem,
            bounds: { width, height }
        }]
    })) as SvgSizeElems<Props>
}
