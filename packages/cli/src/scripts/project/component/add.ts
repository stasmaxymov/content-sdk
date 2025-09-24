import { Argv } from 'yargs';
import { execa } from 'execa';
import { handler as generateMapHandler } from './generate-map';

/**
 * Registers the `add` command which wraps `shadcn add`.
 * Usage: sitecore-tools project component add [shadcn-options]
 */
export function builder(yargs: Argv<AddArgs>) {
  return yargs.command<AddArgs>('add [args..]', 'Adds a component via shadcn/ui', args, handler);
}

export type AddArgs = {
  /** additional args to forward to shadcn */
  args?: string[];
};

export function args(yargs: Argv<AddArgs>) {
  return yargs.positional('args', {
    array: true,
    type: 'string',
    describe: 'Arguments forwarded to `shadcn add` (e.g. button input form)',
  });
}

export async function handler(argv: AddArgs) {
  const forwardedArgs = Array.isArray(argv.args) ? argv.args : [];
  // check if the first arhument is url
  let runGeneratemap = false;
  console.log('forwardedArgs', forwardedArgs);
  if (forwardedArgs[0]?.startsWith('http')) {
    // fetch json from url
    const response = await fetch(forwardedArgs[0]);
    const data = await response.json();
    console.log('data', data);
    if (data?.meta?.jssComponent && data?.meta?.['jss-component-type'] === 'variant') {
      runGeneratemap = true;
    }
  }

  console.log('Forwarding args to shadcn', forwardedArgs);

  // Prefer local npx execution to avoid global dependencies.
  const child = execa('npx', ['shadcn@latest', 'add', ...forwardedArgs], {
    stdio: 'inherit',
    cwd: process.cwd(),
    rejects: false,
  });

  const { exitCode } = await child;
  console.log('exitCode', exitCode);
  console.log('runGeneratemap', runGeneratemap);
  if (exitCode === 0 && runGeneratemap) {
    await generateMapHandler({ watch: false });
  }
  process.exit(exitCode ?? 0);
}
