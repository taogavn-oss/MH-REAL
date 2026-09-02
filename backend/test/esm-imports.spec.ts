import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const sourceRoot = join(process.cwd(), 'src');
const relativeImportPattern = /from\s+['"](\.{1,2}\/(?:[^'"]+))['"]/g;

async function listTypeScriptFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = join(directory, entry.name);
      if (entry.isDirectory()) return listTypeScriptFiles(entryPath);
      return entry.isFile() && entry.name.endsWith('.ts') ? [entryPath] : [];
    }),
  );

  return nested.flat();
}

describe('Node ESM source imports', () => {
  it('uses .js extensions for every relative runtime import', async () => {
    const files = await listTypeScriptFiles(sourceRoot);
    const extensionlessImports: string[] = [];

    for (const filePath of files) {
      const source = await readFile(filePath, 'utf8');
      for (const match of source.matchAll(relativeImportPattern)) {
        const specifier = match[1];
        if (!specifier.endsWith('.js')) {
          extensionlessImports.push(`${relative(sourceRoot, filePath)} -> ${specifier}`);
        }
      }
    }

    expect(extensionlessImports).toEqual([]);
  });
});
