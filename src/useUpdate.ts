import { useReducer, useEffect, useRef } from 'react';
import {
    calculatePositionFromMouseAngle,
    getValueFromPercentage,
    clamp,
    getPercentageFromValue,
    snapPosition,
    snapPercentage,
} from './utils';
import { onKeyDown, handleEventListener } from './eventHandling';
import type { Action, Callbacks } from 'types';

interface InternalState {
    min: number;
    max: number;
    value: number | null;
    isActive: boolean;
    startPercentage?: number;
    startValue?: number;
    tracking: boolean;
    angleOffset: number;
    angleRange: number;
    updated?: boolean;
    mouseAngle: number | null;
    percentage: number | null;
    multiRotation: boolean;
    size: number;
    steps?: number;
    svg: any;
    container: any;
    callBackValue: number;
    startX?: number;
    startY?: number;
}

interface KnobConfiguration extends Callbacks {
    min: number;
    max: number;
    multiRotation: boolean;
    initialValue?: number | null;
    angleOffset: number;
    angleRange: number;
    size: number;
    steps?: number;
    readOnly: boolean;
    tracking: boolean;
    useMouseWheel: boolean;
}

const reduceOnStart = (
    state: InternalState,
    action: Action,
    callbacks: Callbacks,
): InternalState => {
    console.log("start");
    const mouseAngle = state.mouseAngle as number;
    const percentage = state.percentage as number;
    const position = calculatePositionFromMouseAngle({
        previousMouseAngle: null,
        previousPercentage: null,
        ...state,
        mouseAngle: mouseAngle,
        percentage: percentage,
        ...action,
    });
    const steps = action.steps || state.steps;
    const position2 = snapPosition(position, state, steps);
    const value = getValueFromPercentage({ ...state, ...position2 });
    callbacks.onStart();
    callbacks.onInteractiveChange(value);
    if (state.tracking) {
        //callbacks.onChange(value);
    }
    return {
        ...state,
        isActive: true,
        //...position2,
        // @ts-ignore
        startX: action.mouseX,
        // @ts-ignore
        startY: action.mouseY,
        startPercentage: state.percentage as number,
        startValue: state.value as number,
        //value,
        //callBackValue: value,
    };
};

const reduceOnMove = (
    state: InternalState,
    action: Action,
    callbacks: Callbacks,
): InternalState => {
    console.log("MOVE")
    //console.log("IN ", action);
    /*const mouseAngle = state.mouseAngle as number;
    const percentage = state.percentage as number;
    const position = calculatePositionFromMouseAngle({
        previousMouseAngle: state.mouseAngle,
        previousPercentage: state.percentage,
        ...state,
        mouseAngle: mouseAngle,
        percentage: percentage,
        ...action,
    });
    */
    const startX = state.startX as number;
    const startY = state.startY as number;

    const factor = 10;

    // @ts-ignore
    const deltaX = Math.round(action.mouseX - startX) / factor;

    // @ts-ignore
    const deltaY = -Math.round(action.mouseY - startY) / factor;
    
    const steps = action.steps || state.steps || state.max - state.min;
    console.log("per", state.startPercentage, (deltaX + deltaY)/(state.max - state.min), deltaX, deltaY, state.max, state.min, steps)
    let percentage = snapPercentage((state.startPercentage as number + (deltaX + deltaY)/(steps)), steps);
    console.log("pr2", percentage)
    //const position2 = snapPosition(position, state, steps);
    const mouseAngle = (state.angleOffset + state.angleRange * percentage) % 360;
    let value = getValueFromPercentage({ ...state, percentage });

    if (value > state.max) {
        percentage = 1;
        value = state.max;
    } 

    if (value < state.min) {
        percentage = 0;
        value = state.min;
    }

    console.log("Value", value)
    callbacks.onInteractiveChange(value);
    if (state.tracking) {
        //callbacks.onChange(value);
    }
    //console.log(percentage)
   //console.log("EYY", mouseAngle, value, percentage)
    return {
        ...state,
        mouseAngle: mouseAngle < 0 ? mouseAngle + 360 : mouseAngle,
        percentage,
        //...position2,
        value,
        callBackValue: value,
    };
};

const reduceOnStop = (
    state: InternalState,
    action: Action,
    callbacks: Callbacks,
): InternalState => {
    console.log("STOP")
    if (state.value !== null) {
        if (!state.tracking) {
            //callbacks.onChange(state.value);
        }
    }
    callbacks.onEnd();
    return {
        ...state,
        isActive: false,
        value: state.value,
        percentage: state.percentage,
        startPercentage: undefined,
        startValue: undefined,
        startX: undefined,
        startY: undefined
    };
};

const reduceOnCancel = (
    state: InternalState,
    action: Action,
    callbacks: Callbacks,
): InternalState => {
    console.log("CANCEL")
    const percentage = state.startPercentage as number;
    const value = state.startValue as number;
    callbacks.onEnd();
    if (state.tracking) {
        //callbacks.onChange(value);
    }
    return {
        ...state,
        isActive: false,
        value,
        percentage,
        callBackValue: value,
        startPercentage: undefined,
        startValue: undefined,
    };
};

const reduceOnSteps = (
    state: InternalState,
    action: Action,
    callbacks: Callbacks,
): InternalState => {
    console.log("STEPS")
    if (action.direction === undefined) {
        throw Error('Missing direction from Steps action');
    }
    if (state.value === null) {
        return state;
    }
    const value = clamp(
        state.min,
        state.max,
        state.value + 1 * action.direction,
    );
    //callbacks.onChange(value);
    return {
        ...state,
        value,
        callBackValue: value,
        percentage: getPercentageFromValue({ ...state, value }),
    };
};

const reduceOnSet = (
    state: InternalState,
    action: Action,
    callbacks: Callbacks,
): InternalState => {
    if (state.value === null) {
        return state;
    }
    if (action.steps === null || action.steps === undefined) return state;
    const newValue = action.steps;
    const percentage = getPercentageFromValue({ ...state, value: newValue });
    console.log("KNOB: In Dispatch on Set", newValue, percentage)
    return {
        ...state,
        value: newValue,
        percentage: percentage,
    };
};

const reducer =
    (callbacks: Callbacks) =>
    (state: InternalState, action: Action): InternalState => {
        switch (action.type) {
            case 'START':
                return reduceOnStart(state, action, callbacks);
            case 'MOVE':
                return reduceOnMove(state, action, callbacks);
            case 'STOP':
                return reduceOnStop(state, action, callbacks);
            case 'CANCEL':
                return reduceOnCancel(state, action, callbacks);
            case 'STEPS':
                return reduceOnSteps(state, action, callbacks);
            case 'SET':
                return reduceOnSet(state, action, callbacks);
            default:
                return { ...state, isActive: false, value: state.value };
        }
    };

export default ({
    min,
    max,
    multiRotation,
    initialValue,
    angleOffset = 0,
    angleRange = 360,
    size,
    steps,
    onChange,
    onInteractiveChange,
    interactiveHook,
    onStart,
    onEnd,
    readOnly,
    tracking,
    useMouseWheel,
}: KnobConfiguration) => {
    const svg = useRef<SVGSVGElement>(null);
    const container = useRef<HTMLDivElement>(null);
    const callbacks = {
        onChange,
        onInteractiveChange,
        onStart,
        onEnd,
    };
    const [{ percentage, value , callBackValue}, dispatch] = useReducer(reducer(callbacks), {
        isActive: false,
        min,
        max,
        multiRotation,
        angleOffset,
        angleRange,
        mouseAngle: null,
        percentage: (initialValue !== null && initialValue !== undefined) ? (initialValue - min) / (max - min) : 0,
        value: initialValue || 0,
        svg,
        tracking,
        container,
        size,
        steps,
        callBackValue: initialValue || 0
    });

    useEffect(
        handleEventListener({
            container,
            dispatch,
            readOnly,
            useMouseWheel,
            interactiveHook,
        }),
        [useMouseWheel, readOnly],
    );

    useEffect(() => {
        
        callbacks.onChange(callBackValue);
        
    }, [callBackValue])

    const setValue = (newValue: number) => {
        console.log("KNOB: In setValue");
        dispatch({
            type: "SET",
            steps: newValue
        });
    }

    return {
        svg,
        container,
        percentage: percentage,
        value: value,
        onKeyDown: onKeyDown(dispatch),
        setValue
    };
};
