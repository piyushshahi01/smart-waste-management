const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            if (!file.includes('node_modules') && !file.includes('.git') && !file.includes('dist')) {
                results = results.concat(walk(fullPath));
            }
        } else {
            if (file.endsWith('.js') || file.endsWith('.jsx')) {
                results.push(fullPath);
            }
        }
    });
    return results;
}

const srcDir = 'c:/Users/Piyush/waste management/frontend/src';
const files = walk(srcDir);
let updatedCount = 0;

files.forEach(file => {
    if (file.includes('apiConfig.js')) return; // Don't edit the config itself

    let content = fs.readFileSync(file, 'utf8');
    const localhostRegex = /http:\/\/localhost:5000/g;

    if (localhostRegex.test(content)) {
        // 1. Add import if not present
        if (!content.includes('import { API_BASE_URL }')) {
            const relativePath = path.relative(path.dirname(file), path.join(srcDir, 'apiConfig.js')).replace(/\\/g, '/');
            const importPath = relativePath.startsWith('.') ? relativePath.replace('.js', '') : `./${relativePath.replace('.js', '')}`;
            content = `import { API_BASE_URL } from '${importPath}';\n` + content;
        }

        // 2. Replace URLs - both string literals and backticks
        content = content.replace(/['"]http:\/\/localhost:5000(.*?)['"]/g, '`${API_BASE_URL}$1`');
        content = content.replace(/`http:\/\/localhost:5000(.*?)`/g, '`${API_BASE_URL}$1`');

        fs.writeFileSync(file, content, 'utf8');
        console.log('Centralized:', file);
        updatedCount++;
    }
});

console.log('Total files centralized:', updatedCount);
