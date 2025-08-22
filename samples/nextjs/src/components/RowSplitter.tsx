import React, { JSX } from 'react';
import {
  ComponentMap,
  ComponentRendering,
  ServerPlaceholder,
  SitecoreProviderPageContext,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

/**
 * The number of rows that can be inserted into the row splitter component.
 * The maximum number of rows is 8.
 */
type RowNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/**
 * The styles specified for each rendered row.
 * The key is the row number, and the value is the styles.
 */
type RowStyles = {
  [K in `Styles${RowNumber}`]?: string;
};

interface RowSplitterProps extends ComponentProps {
  rendering: ComponentRendering;
  params: ComponentProps['params'] & RowStyles;
  componentMap: ComponentMap;
  pageContext: SitecoreProviderPageContext;
}

export const Default = async ({
  params,
  rendering,
  componentMap,
  pageContext,
}: RowSplitterProps): Promise<JSX.Element> => {
  const enabledPlaceholders = params.EnabledPlaceholders?.split(',') ?? [];
  const id = params.RenderingIdentifier;

  await new Promise((resolve) => setTimeout(resolve, 2000));

  return (
    <div className={`component row-splitter ${params.styles}`} id={id}>
      <p>Async RowSplitter</p>
      {enabledPlaceholders.map((ph, index) => {
        const num = Number(ph) as RowNumber;
        const placeholderKey = `row-${num}-{*}`;
        const rowStyles = `${params[`Styles${num}`] ?? ''}`.trimEnd();

        return (
          <div key={index} className={`container-fluid ${rowStyles}`.trimEnd()}>
            <div>
              <div className="row">
                <ServerPlaceholder
                  name={placeholderKey}
                  rendering={rendering}
                  componentMap={componentMap}
                  pageContext={pageContext}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const isRsc = true;
