import React from "react";

import './NumberDisplay.css'

export type NumberDisplayType = {
    value: number;
}

export const NumberDisplay: React.FC<NumberDisplayType> = ({ value }) => {
    return <div className='number-display'>{value.toString().padStart(3, '0')}</div>
};