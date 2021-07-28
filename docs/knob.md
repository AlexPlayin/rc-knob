Renders a react knob component that can be widely customised.

```jsx
import React from 'react';
import { Knob, Arc, Pointer } from '../lib/index';
import colors from './assets/colors.js';

<Knob 
  size={100}  
  angleOffset={220} 
  angleRange={280}
  value={33}
  min={0}
  max={100}
>
  <Arc 
    arcWidth={5}
    color={colors.primary}
    background={colors.shadow}
  />
  <Pointer 
    width={5}
    height={40}
    radius={10}
    type="rect"
    color={colors.primary}
  />
</Knob>
```

The base of all knobs is the Knob component which handles all of the user
interaction and calculation of the knob value. The user can interact via
drag'n drop, mousewheel and keyboard. The knobs are accessible by the tab key.

The display part is splitted into the `Pointer`, `Scale`, `Arc`, `Value`
and few others.

One or more of them can be children of a Knob.

## `Knob`

The `Knob` component is root component that handles all the user interactions. 

It does not render any visual UI elements but a `<div><svg></svg></div>`.

All children will be added to the `<svg>` element.

It handles the user interaction by mouse, mouse wheel and keyboard arrow keys.
It is accessible by keyboard using `tab`.

```js static
<Knob 
  size={100}  
  angleOffset={220} 
  angleRange={280}
  value={33}
  min={0}
  max={100}
>
  ...
</Knob>
```

### Value

The knob hold a numeric `value`. This value is constained between `min` and
`max`.

### Geometry

The `size` is the diameter of the knob.

`angleOffset` and `angleRange` are used to define the knob geometry.

It is relative to the top of the knob, and clockwise.

```jsx
import React from 'react';
import { Knob, Pointer, Range, Label } from '../lib/index';
import colors from './assets/colors.js';


function Marker({angle}) {
    return (
    <>
    </>
  );
}


<Knob
  size={150}
  angleOffset={0}
  angleRange={360}
  min={0}
  max={100}
  >
    <Pointer 
      percentage={0 / 360}
      width={5}
      height={30}
      radius={0}
      type="rect"
      color={colors.primary}
      />
    <Label percentage={0.0}
      radius={50} label="0 deg"
      style={{fontSize: "80%"}}
      />
    <Pointer 
      percentage={140 / 360}
      width={5}
      height={30}
      radius={0}
      type="rect"
      color={colors.primary}
      />
    <Label percentage={140 / 360}
      radius={50} label="140 deg"
      style={{fontSize: "80%"}}
      />
    <Pointer 
      percentage={220 / 360}
      width={5}
      height={30}
      radius={0}
      type="rect"
      color={colors.primary}
      />
    <Label percentage={220 / 360}
      radius={50} label="220 deg"
      style={{fontSize: "80%"}}
      />
    <Range
      radius={30}
      arcWidth={5}
      color={colors.primary}
      percentageFrom={0.0}
      percentageTo={0.5}
      />
    <Range
      radius={30}
      arcWidth={5}
      color={colors.primary}
      percentageFrom={0.5}
      percentageTo={1.0}
      />
</Knob>;
```

### Anticlockwise

If `angleRange` is negative, the interaction anticlockwise.

```jsx
import React from 'react';
import { Knob, Arc, Pointer } from '../lib/index';
import colors from './assets/colors.js';

<Knob 
  size={100}  
  angleOffset={140} 
  angleRange={-280}
  value={33}
  min={0}
  max={100}
>
  <Arc 
    arcWidth={5}
    color={colors.primary}
    background={colors.shadow}
  />
  <Pointer 
    width={5}
    height={40}
    radius={10}
    type="rect"
    color={colors.primary}
  />
</Knob>
```
