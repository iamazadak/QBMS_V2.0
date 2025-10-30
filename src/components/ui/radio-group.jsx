import React from 'react';

const RadioGroup = ({ children, ...props }) => <div {...props}>{children}</div>;
const RadioGroupItem = (props) => <input type="radio" {...props} />;

export { RadioGroup, RadioGroupItem };
