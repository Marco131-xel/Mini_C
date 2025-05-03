declare module '@viz-js/viz' {
    export function instance(): Promise<any>;
    export function renderSVGElement(dot: string): SVGSVGElement;
}