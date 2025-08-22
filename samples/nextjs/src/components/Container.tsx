import { withServerPlaceholder } from '@sitecore-content-sdk/nextjs/utils';
import { DefaultContainer } from './Container.client';

export const Default = withServerPlaceholder(DefaultContainer, ['container-{*}']);

export const isRsc = true;
