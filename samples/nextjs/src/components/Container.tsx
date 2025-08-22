'use client';
import { Placeholder } from '@sitecore-content-sdk/nextjs';
import React, { JSX, useState } from 'react';
import { ComponentProps } from 'lib/component-props';

interface ContainerProps extends ComponentProps {
  params: ComponentProps['params'] & {
    BackgroundImage?: string;
    DynamicPlaceholderId: string;
  };
}

const Container = ({ params, rendering }: ContainerProps): JSX.Element => {
  const {
    styles,
    RenderingIdentifier: id,
    BackgroundImage: backgroundImage,
    DynamicPlaceholderId,
  } = params;
  const [count, setCount] = useState(0);
  const phKey = `container-${DynamicPlaceholderId}`;

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
        <div className="row">
          <Placeholder name={phKey} rendering={rendering} />
        </div>
      </div>
    </div>
  );
};

export const Default = (props: ContainerProps): JSX.Element => {
  const styles = props.params?.styles?.split(' ');

  return styles?.includes('container') ? (
    <div className="container-wrapper">
      <Container {...props} />
    </div>
  ) : (
    <Container {...props} />
  );
};
