'use client';

import { Menu as MenuPrimitive } from '@base-ui/react/menu';
import { Slot } from '@radix-ui/react-slot';

import { cn } from '@/lib/utils';
import { ChevronRightIcon, CheckIcon } from 'lucide-react';

function DropdownMenu({ ...props }: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuPortal({ ...props }: MenuPrimitive.Portal.Props) {
  return <MenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />;
}

function DropdownMenuTrigger({ asChild, ...props }: any) {
  const Comp = asChild ? Slot : MenuPrimitive.Trigger;
  return <Comp data-slot="dropdown-menu-trigger" {...props} />;
}

function DropdownMenuContent({
  align = 'center',
  alignOffset = 0,
  side = 'bottom',
  sideOffset = 4,
  className,
  children,
  asChild,
  ...props
}: any) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        data-slot="dropdown-menu-content"
        className="isolate z-50 outline-none"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <MenuPrimitive.Popup
          className={cn(
            'z-50 max-h-(--available-height) w-(--anchor-width) min-w-48 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-none bg-popover p-1.5 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
            className,
          )}
          {...props}
        >
          {children}
        </MenuPrimitive.Popup>
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}

function DropdownMenuGroup({ asChild, ...props }: any) {
  const Comp = asChild ? Slot : MenuPrimitive.Group;
  return <Comp data-slot="dropdown-menu-group" {...props} />;
}

function DropdownMenuLabel({
  className,
  inset,
  asChild,
  ...props
}: any) {
  const Comp = asChild ? Slot : MenuPrimitive.GroupLabel;
  return (
    <Comp
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        'px-3 py-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase data-[inset]:pl-9.5',
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuItem({
  className,
  inset,
  variant = 'default',
  asChild,
  ...props
}: any) {
  const Comp = asChild ? Slot : MenuPrimitive.Item;
  return (
    <Comp
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "group/dropdown-menu-item relative flex cursor-default items-center gap-2.5 rounded-none px-3 py-2 text-xs font-medium tracking-wider uppercase outline-none select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuSub({ ...props }: MenuPrimitive.SubmenuRoot.Props) {
  return <MenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuSubTrigger({
  className,
  inset,
  asChild,
  children,
  ...props
}: any) {
  const Comp = asChild ? Slot : MenuPrimitive.SubmenuTrigger;
  return (
    <Comp
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn('group', className)}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto" />
    </Comp>
  );
}

function DropdownMenuSubContent({
  align = 'start',
  alignOffset = -3,
  side = 'right',
  sideOffset = 0,
  className,
  children,
  asChild,
  ...props
}: any) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50 outline-none"
      >
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-sub-content"
          className={cn(
            'z-50 min-w-36 max-h-(--available-height) w-(--anchor-width) origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-none bg-popover p-1.5 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
            className,
          )}
          {...props}
        >
          {children}
        </MenuPrimitive.Popup>
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  asChild,
  ...props
}: any) {
  const Comp = asChild ? Slot : MenuPrimitive.CheckboxItem;
  return (
    <Comp
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "group/dropdown-menu-checkbox-item relative flex cursor-default items-center gap-2.5 rounded-none py-2 pr-8 pl-3 text-xs font-medium tracking-wider uppercase outline-none select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3.5",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span
        className="pointer-events-none absolute right-2 flex items-center justify-center"
        data-slot="dropdown-menu-checkbox-item-indicator"
      >
        <MenuPrimitive.CheckboxItemIndicator>
          <CheckIcon />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </Comp>
  );
}

function DropdownMenuRadioGroup({ asChild, ...props }: any) {
  const Comp = asChild ? Slot : MenuPrimitive.RadioGroup;
  return <Comp data-slot="dropdown-menu-radio-group" {...props} />;
}

function DropdownMenuRadioItem({
  className,
  children,
  asChild,
  ...props
}: any) {
  const Comp = asChild ? Slot : MenuPrimitive.RadioItem;
  return (
    <Comp
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "group/dropdown-menu-radio-item relative flex cursor-default items-center gap-2.5 rounded-none py-2 pr-8 pl-3 text-xs font-medium tracking-wider uppercase outline-none select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3.5",
        className,
      )}
      {...props}
    >
      <span
        className="pointer-events-none absolute right-2 flex items-center justify-center"
        data-slot="dropdown-menu-radio-item-indicator"
      >
        <MenuPrimitive.RadioItemIndicator>
          <CheckIcon />
        </MenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </Comp>
  );
}

function DropdownMenuSeparator({ className, asChild, ...props }: any) {
  const Comp = asChild ? Slot : MenuPrimitive.Separator;
  return (
    <Comp
      data-slot="dropdown-menu-separator"
      className={cn('-mx-1.5 my-1.5 h-px bg-muted', className)}
      {...props}
    />
  );
}

function DropdownMenuShortcut({ className, asChild, ...props }: any) {
  const Comp = asChild ? Slot : 'span';
  return (
    <Comp
      data-slot="dropdown-menu-shortcut"
      className={cn('ml-auto text-xs tracking-wider text-muted-foreground', className)}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
};
