import { Type } from '@nestjs/common';

export type PrefixedRouteTree = {
  path: string;
  module?: Type<unknown>;

  prefixedChildren?: {
    prefix: string;
    children: PrefixedRouteTree[];
  };

  children?: PrefixedRouteTree[];
};
