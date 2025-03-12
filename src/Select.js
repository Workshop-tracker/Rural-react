import React from 'react';

export function Select({ onValueChange, children }) {
    return (
        <select
            onChange={(e) => onValueChange(e.target.value)}
            className="border rounded-md p-2"
        >
            {children}
        </select>
    );
}

export function SelectItem({ value, children }) {
    return <option value={value}>{children}</option>;
}
