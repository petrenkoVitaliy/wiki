import { Routes } from '@nestjs/core';
import { PrefixedRouteTree } from './routes.types';

export const mapToRoutes = (prefixedRoutes: PrefixedRouteTree[], prefix = ''): Routes => {
  return prefixedRoutes.map((routeConfig) => {
    return {
      path: `${prefix}/${routeConfig.path}`,
      module: routeConfig.module,
      children: [
        ...(routeConfig.children ? mapToRoutes(routeConfig.children) : []),
        ...(routeConfig.prefixedChildren
          ? mapToRoutes(routeConfig.prefixedChildren.children, routeConfig.prefixedChildren.prefix)
          : []),
      ],
    };
  });
};
