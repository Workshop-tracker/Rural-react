import React from 'react';

export function Table({ children }) {
    return <table className="w-full border-collapse border">{children}</table>;
}

export function TableHeader({ children }) {
    return <thead className="bg-gray-200">{children}</thead>;
}

export function TableRow({ children }) {
    return <tr>{children}</tr>;
}

export function TableHead({ children }) {
    return <th className="border p-2">{children}</th>;
}

export function TableBody({ children }) {
    return <tbody>{children}</tbody>;
}

export function TableCell({ children }) {
    return <td className="border p-2">{children}</td>;
}
