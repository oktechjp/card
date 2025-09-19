declare module "css-layout" {
    export interface ComputeNodeLayout {
        width: number
        height: number
        top: number
        left: number
        right: number
        bottom: number
        direction: 'ltr' | 'rtl'
    }
    export interface ComputeNodeStyle {
        width?: number
        height?: number
        minWidth?: number
        minHeight?: number
        maxWidth?: number
        maxHeight?: number
        left?: number
        right?: number
        top?: number
        bottom?: number
        margin?: number
        marginLeft?: number
        marginTop?: number
        marginRight?: number
        marginBottom?: number
        padding?: number
        paddingLeft?: number
        paddingTop?: number
        paddingRight?: number
        paddingBottom?: number
        flexDirection?: 'column' | 'row'
        justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around'
        alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch'
        alignSelf?: 'flex-start' | 'center' | 'flex-end' | 'stretch'
        flex?: number
        flexWrap?: 'wrap' | 'nowrap'
        position?: 'relative' | 'absolute'
    }
    export interface ComputeNode {
        children: ComputeNode[]
        style: ComputeNodeStyle
        layout?: ComputeNodeLayout
    }
    export default function computeLayout(node: ComputeNode, parentMaxWidth?: number, parentDirection?: 'row' | 'column'): void;
}