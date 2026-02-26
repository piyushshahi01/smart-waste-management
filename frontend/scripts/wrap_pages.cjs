const fs = require('fs');
const files = [
    'src/pages/Admin/Alerts.jsx',
    'src/pages/Admin/Reports.jsx',
    'src/pages/Admin/RoutesPage.jsx',
    'src/pages/Admin/SmartBins.jsx'
];

files.forEach(filePath => {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        if (!content.includes('AnimatedPage')) {
            content = content.replace(/(import .*?lucide-react';?\n)/, "$1import AnimatedPage from '../../components/AnimatedPage';\n");
            content = content.replace(/(return\s*\(\s*)<div\s+className="(.*?)">/, '$1<AnimatedPage className="$2">');
            content = content.replace(/<\/div>(\s*\)\s*;\s*}\s*)$/, '</AnimatedPage>$1');
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Processed ${filePath}`);
        } else {
            console.log(`Skipped ${filePath}`);
        }
    }
});
