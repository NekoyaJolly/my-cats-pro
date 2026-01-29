const fs = require('fs');
const ts = require('typescript');

const files = [
  'src/components/kittens/BulkWeightRecordModal.tsx',
  'src/components/kittens/KittenManagementModal.tsx',
  'src/components/kittens/WeightRecordModal.tsx',
  'src/app/gallery/components/GalleryAddModal.tsx'
];

let hasErrors = false;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const sourceFile = ts.createSourceFile(
    file,
    content,
    ts.ScriptTarget.ES2020,
    /* setParentNodes */ true,
    ts.ScriptKind.TSX
  );
  const result = ts.transpileModule(content, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.React,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
    },
    reportDiagnostics: true,
  });
  
  if (result.diagnostics && result.diagnostics.length > 0) {
    console.log(`\n❌ ${file}:`);
    result.diagnostics.forEach(diag => {
      const position =
        typeof diag.start === 'number'
          ? sourceFile.getLineAndCharacterOfPosition(diag.start)
          : null;
      const lineNumber = position ? position.line + 1 : '?';
      const columnNumber = position ? position.character + 1 : '?';
      const message = ts.flattenDiagnosticMessageText(diag.messageText, '\n');
      console.log(`  Line ${lineNumber}, Column ${columnNumber}: ${message}`);
    });
    hasErrors = true;
  } else {
    console.log(`✅ ${file}: OK`);
  }
});

if (!hasErrors) {
  console.log('\n✨ All files passed syntax check!');
}

process.exit(hasErrors ? 1 : 0);
