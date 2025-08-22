'use client';
import React, { JSX, useState } from 'react';
import { ComponentProps } from 'lib/component-props';

export interface ContainerProps extends ComponentProps {
  params: ComponentProps['params'] & {
    BackgroundImage?: string;
    DynamicPlaceholderId: string;
  };
  placeholders: Record<string, React.ReactNode>;
}

const Container = ({ params, placeholders }: ContainerProps): JSX.Element => {
  const { styles, RenderingIdentifier: id, BackgroundImage: backgroundImage } = params;
  const [count, setCount] = useState(0);

  // Extract the mediaurl from rendering parameters
  const mediaUrlPattern = new RegExp(/mediaurl=\"([^"]*)\"/, 'i');

  let backgroundStyle: { [key: string]: string } = {};

  if (backgroundImage && backgroundImage.match(mediaUrlPattern)) {
    const mediaUrl = backgroundImage.match(mediaUrlPattern)?.[1] || '';

    backgroundStyle = {
      backgroundImage: `url('${mediaUrl}')`,
    };
  }

  return (
    <div className={`component container-default ${styles}`} id={id}>
      <p>Container</p>
      <button
        onClick={() => {
          setCount(count + 1);
        }}
      >
        {count}
      </button>
      <div className="component-content" style={backgroundStyle}>
        <div className="row">{placeholders['container-{*}']}</div>
      </div>
    </div>
  );
};

export const DefaultContainer = (props: ContainerProps): JSX.Element => {
  const styles = props.params?.styles?.split(' ');

  return styles?.includes('container') ? (
    <div className="container-wrapper">
      <Container {...props} />
    </div>
  ) : (
    <Container {...props} />
  );
};
