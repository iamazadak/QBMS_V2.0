import React from 'react';

const Card = ({ children, ...props }) => <div {...props}>{children}</div>;
const CardHeader = ({ children, ...props }) => <div {...props}>{children}</div>;
const CardTitle = ({ children, ...props }) => <h3 {...props}>{children}</h3>;
const CardContent = ({ children, ...props }) => <div {...props}>{children}</div>;

export { Card, CardHeader, CardTitle, CardContent };
