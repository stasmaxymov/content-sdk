import {
  ComponentFile,
  GenerateMapArgs,
  GenerateMapFunction,
  getComponentList,
  ComponentImport,
} from '@sitecore-content-sdk/core/tools';
import path from 'path';
import fs from 'fs';

/**
 * Generate and write componentMap.ts file based on provided params.
 * @param {GenerateMapArgs} param0 params for generateMap
 */
export const generateMap: GenerateMapFunction = ({
  paths,
  destination = '.sitecore',
  exclude,
  componentImports,
  mapTemplate = nextjsMapTemplate,
}: GenerateMapArgs) => {
  const components = getComponentList(paths, exclude);

  const componentMapContent = mapTemplate(components, componentImports);

  const componentMapFile = path.join(process.cwd(), destination, 'component-map.ts');

  try {
    fs.writeFileSync(componentMapFile, componentMapContent, {
      encoding: 'utf8',
    });
  } catch (error) {
    console.error(`Component Map generation failed. Error writing to file ${destination}:`, error);
    throw error;
  }
};

const nextjsMapTemplate = (
  components: ComponentFile[],
  componentImports?: ComponentImport[]
): string => {
  const wildcardImports: string[] = [];
  const namedImports: string[] = [];

  const componentMapEntries: string[] = [];

  // Import all components as wildcard modules
  components.forEach((component) => {
    wildcardImports.push(`import * as ${component.moduleName} from '${component.importPath}';`);
  });

  // Group components by folder (via importPath dirname) and base name (before any dot-suffix)
  const groupedByBaseName = components.reduce((acc, component) => {
    const baseRaw = component.componentName.split('.')[0];
    const baseKey = baseRaw.replace(/[^\w]+/g, '');
    const dir = component.importPath.slice(0, component.importPath.lastIndexOf('/'));
    const groupKey = `${dir}|${baseKey}`;
    if (!acc[groupKey])
      acc[groupKey] = [] as { moduleName: string; isBase: boolean; baseKey: string }[];
    acc[groupKey].push({
      moduleName: component.moduleName,
      isBase: component.componentName === baseRaw,
      baseKey,
    });
    return acc;
  }, {} as Record<string, { moduleName: string; isBase: boolean; baseKey: string }[]>);

  // Build entries merging variants under the same base key
  Object.values(groupedByBaseName).forEach((modules) => {
    const mapKey = modules[0].baseKey;
    if (modules.length === 1) {
      componentMapEntries.push(`['${mapKey}', ${modules[0].moduleName}]`);
      return;
    }
    const sorted = modules.sort((a, b) =>
      a.isBase === b.isBase ? a.moduleName.localeCompare(b.moduleName) : a.isBase ? -1 : 1
    );
    const spreads = sorted.map((m) => `...${m.moduleName}`).join(', ');
    componentMapEntries.push(`['${mapKey}', { ${spreads} }]`);
  });

  componentImports?.forEach((packageEntry) => {
    if (packageEntry.importInfo.namedImports) {
      namedImports.push(
        `import { ${packageEntry.importInfo.namedImports.join(', ')} } from '${
          packageEntry.importInfo.importFrom
        }';`
      );
      packageEntry.importInfo.namedImports.forEach((importName) => {
        componentMapEntries.push(`['${importName}', ${importName}]`);
      });
    } else {
      wildcardImports.push(
        `import * as ${packageEntry.importName} from '${packageEntry.importInfo.importFrom}';`
      );
      componentMapEntries.push(`['${packageEntry.importName}', ${packageEntry.importName}]`);
    }
  });

  return `// Below are built-in components that are available in the app, it's recommended to keep them as is
import { BYOCWrapper, NextjsContentSdkComponent, FEaaSWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';
// end of built-in components

// Components imported from the app itself
${wildcardImports.join('\n')}
${namedImports.join('\n')}

// Components must be registered within the map to match the string key with component name in Sitecore
export const componentMap = new Map<string, NextjsContentSdkComponent>([
  ['BYOCWrapper', BYOCWrapper],
  ['FEaaSWrapper', FEaaSWrapper],
  ['Form', Form],
${componentMapEntries
  .map((component) => {
    return `  ${component},\n`;
  })
  .join('')}]);

export default componentMap;
`;
};
