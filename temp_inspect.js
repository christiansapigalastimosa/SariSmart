const fs = require('fs');
const path = require('path');
const modPath = path.join(process.cwd(), 'node_modules', 'expo-file-system', 'build', 'ExponentFileSystem.js');
if(fs.existsSync(modPath)){
  const content = fs.readFileSync(modPath, 'utf8');
  console.log('exists', modPath, content.includes('StorageAccessFramework') ? 'yes' : 'no');
  console.log(content.split('\n').filter(l => l.includes('StorageAccessFramework')).slice(0,20).join('\n'));
} else {
  console.log('no file', modPath);
}
