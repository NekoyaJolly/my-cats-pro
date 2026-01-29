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
  const result = ts.transpileModule(content, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.React,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
    }
  });
  
  if (result.diagnostics && result.diagnostics.length > 0) {
    console.log(`\n❌ ${file}:`);
    result.diagnostics.forEach(diag => {
      console.log(`  Line ${diag.start}: ${diag.messageText}`);
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
