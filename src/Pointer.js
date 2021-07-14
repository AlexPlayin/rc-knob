import React from 'react'

export const Pointer = ({
    children,
    width,
    height = width,
    angleOffset,
    angleRange,
    percentage,
    radius,
    center,
    type,
    color,
    className,
}) => (
    <g
        transform={`
        rotate(${angleOffset + angleRange * percentage} ${center} ${center})
        translate( ${center} ${center - radius - height})
        `}
    >
        {children &&
            React.Children.map(children, child =>
                React.cloneElement(child, {
                    width,
                    height,
                    percentage,
                })
            )}
        {type === 'rect' && (
            <rect
                x={-width * 0.5}
                width={width}
                height={height}
                fill={color}
                className={className}
            />
        )}
        {type === 'circle' && (
            <circle r={width} fill={color} className={className} />
        )}
    </g>
)
