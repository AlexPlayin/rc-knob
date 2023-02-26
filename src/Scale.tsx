import React from 'react';
import type { PropsWithKnobState } from 'types';

interface RenderProps {
    translateX: number;
    translateY: number;
    angleOffset: number;
    stepSize: number;
    center: number;
    color: string;
    className: string;
    active: number;
    activeColor: string;
    activeClassName: string;
}

const renderCircle =
    ({
        tickWidth,
        translateX,
        translateY,
        angleOffset,
        stepSize,
        center,
        color,
        active,
        activeColor,
        activeClassName,
        className,
    }: RenderProps & { tickWidth: number }) =>
    (_: any, i: number) =>
        (
            <circle
                r={tickWidth}
                key={i}
                className={i === active ? activeClassName : className}
                fill={i === active ? activeColor : color}
                stroke="none"
                transform={`
        rotate(${angleOffset + stepSize * i} ${center} ${center}) 
        translate(${translateX} ${translateY})
        `}
            />
        );

const renderRect =
    ({
        tickWidth,
        tickHeight,
        translateX,
        translateY,
        angleOffset,
        stepSize,
        center,
        color,
        active,
        activeColor,
        activeClassName,
        className,
    }: RenderProps & { tickWidth: number; tickHeight: number }) =>
    (_: any, i: number) =>
        (
            <rect
                className={i === active ? activeClassName : className}
                fill={i === active ? activeColor : color}
                stroke="none"
                width={tickWidth}
                height={tickHeight}
                key={i}
                transform={`
        rotate(${angleOffset + stepSize * i} ${center} ${center}) 
        translate(${translateX} ${translateY})
        `}
            />
        );

export interface RenderCustomProps extends RenderProps {
    i: number;
    tickWidth: number;
    tickHeight: number;
    steps: number;
    percentage: number;
}

const renderCustom =
    ({
        fn,
        ...props
    }: {
        fn: (props: RenderCustomProps) => void;
        tickWidth: number;
        tickHeight: number;
        steps: number;
        percentage: number;
    } & RenderProps) =>
    (_: any, i: number) =>
        fn({ ...props, i });

interface Props {
    angleRange: number;
    steps: number;
    type?: string;
    radius: number;
    tickWidth: number;
    tickHeight: number;
    color: string;
    activeColor?: string;
    className: string;
    activeClassName?: string;
    fn?: (props: RenderCustomProps) => void;
}

export const Scale = ({
    angleRange,
    steps,
    type = 'rect',
    radius,
    tickWidth,
    tickHeight,
    angleOffset,
    center,
    color,
    activeColor = color,
    className,
    activeClassName = className,
    fn,
    percentage,
}: PropsWithKnobState<Props>) => {
    const stepSize = angleRange / steps;
    const length = steps + (angleRange === 360 ? 0 : 1);
    const translateX = center - tickWidth / 2;
    const translateY = center - radius;
    if (percentage === null) {
        return <></>;
    }

    const active = Math.round((length - 1) * percentage);

    function getRenderFn() {
        if (type === 'circle') {
            return renderCircle({
                tickWidth,
                translateX,
                translateY,
                center,
                angleOffset,
                stepSize,
                color,
                active,
                activeColor,
                className,
                activeClassName,
            });
        }
        if (type === 'rect' && !fn) {
            return renderRect({
                tickWidth,
                tickHeight,
                translateX,
                translateY,
                angleOffset,
                stepSize,
                center,
                color,
                active,
                activeColor,
                className,
                activeClassName,
            });
        }
        if (fn) {
            if (percentage === null) {
                return <></>;
            }
            return renderCustom({
                fn,
                tickWidth,
                tickHeight,
                translateX,
                translateY,
                angleOffset,
                stepSize,
                center,
                color,
                active,
                activeColor,
                className,
                activeClassName,
                steps,
                percentage,
            });
        }
    }

    const renderFn = getRenderFn();

    // @ts-expect-error
    return <g>{Array.from({ length }, renderFn)}</g>;
};
