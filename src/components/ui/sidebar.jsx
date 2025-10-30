import { Slot } from '@radix-ui/react-slot';
import React from 'react';

const SidebarProvider = ({ children }) => <div>{children}</div>;
const Sidebar = React.forwardRef((props, ref) => <aside ref={ref} {...props} />);
const SidebarHeader = React.forwardRef((props, ref) => <header ref={ref} {...props} />);
const SidebarContent = React.forwardRef((props, ref) => <div ref={ref} {...props} />);
const SidebarGroup = React.forwardRef((props, ref) => <div ref={ref} {...props} />);
const SidebarGroupLabel = React.forwardRef((props, ref) => <h4 ref={ref} {...props} />);
const SidebarGroupContent = React.forwardRef((props, ref) => <div ref={ref} {...props} />);
const SidebarMenu = React.forwardRef((props, ref) => <ul ref={ref} {...props} />);
const SidebarMenuItem = React.forwardRef((props, ref) => <li ref={ref} {...props} />);
const SidebarFooter = React.forwardRef((props, ref) => <footer ref={ref} {...props} />);

const SidebarMenuButton = React.forwardRef(({ asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return <Comp ref={ref} {...props} />;
});

const SidebarTrigger = React.forwardRef(({ asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return <Comp ref={ref} {...props} />;
});

export {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
};
