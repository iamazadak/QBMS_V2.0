import React from 'react';

const Table = ({ children, ...props }) => <table {...props}>{children}</table>;
const TableHeader = ({ children, ...props }) => <thead {...props}>{children}</thead>;
const TableBody = ({ children, ...props }) => <tbody {...props}>{children}</tbody>;
const TableRow = ({ children, ...props }) => <tr {...props}>{children}</tr>;
const TableHead = ({ children, ...props }) => <th {...props}>{children}</th>;
const TableCell = ({ children, ...props }) => <td {...props}>{children}</td>;

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
