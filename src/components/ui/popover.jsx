import React from 'react';

const Popover = ({ children, ...props }) => <div {...props}>{children}</div>;
const PopoverTrigger = ({ children, ...props }) => <div {...props}>{children}</div>;
const PopoverContent = ({ children, ...props }) => <div {...props}>{children}</div>;

export { Popover, PopoverTrigger, PopoverContent };
