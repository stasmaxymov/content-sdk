/* eslint-disable react/display-name */
import React from 'react';
import { ComponentType } from 'react';
import {
  ComponentMap,
  ComponentRendering,
  ServerPlaceholder,
  SitecoreProviderPageContext,
} from '..';

export type ComponentProps = {
  rendering: ComponentRendering;
  placeholders: Record<string, React.ReactNode>;
  componentMap?: ComponentMap;
};

export type WrapperProps = {
  pageContext: SitecoreProviderPageContext;
  componentMap?: ComponentMap;
};

export const withServerPlaceholder = <T extends ComponentProps, W extends T & WrapperProps>(
  Component: ComponentType<T>,
  placeholders: string[]
) => {
  return (props: W) => {
    const phProps: Record<string, unknown> = {};
    for (const placeholder of placeholders) {
      phProps[placeholder] = (
        <ServerPlaceholder
          name={placeholder}
          rendering={props.rendering}
          pageContext={props.pageContext}
          componentMap={props.componentMap}
        />
      );
    }
    const propsCopy: T = { ...props };
    delete propsCopy.componentMap;

    return <Component {...propsCopy} placeholders={phProps} />;
  };
};
