import type { Options } from 'prettier';

export async function formatCode(
  code: string,
  language: string,
): Promise<string> {
  const prettier = await import('prettier/standalone');

  type Plugin = NonNullable<Options['plugins']>[number];

  const { parser, plugins } = await (async (): Promise<{
    parser: string;
    plugins: Plugin[];
  }> => {
    if (['typescript', 'ts', 'tsx'].includes(language)) {
      return {
        parser: 'typescript',
        plugins: [
          (await import('prettier/plugins/typescript')) as Plugin,
          (await import('prettier/plugins/estree')) as Plugin,
        ],
      };
    }
    if (['css', 'scss', 'less'].includes(language)) {
      return {
        parser: 'css',
        plugins: [(await import('prettier/plugins/postcss')) as Plugin],
      };
    }
    if (language === 'html') {
      return {
        parser: 'html',
        plugins: [(await import('prettier/plugins/html')) as Plugin],
      };
    }
    return {
      parser: 'babel',
      plugins: [
        (await import('prettier/plugins/babel')) as Plugin,
        (await import('prettier/plugins/estree')) as Plugin,
      ],
    };
  })();

  return prettier.format(code, {
    parser,
    plugins,
    semi: true,
    singleQuote: true,
    tabWidth: 2,
    printWidth: 80,
  } satisfies Options);
}
