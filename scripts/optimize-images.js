const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            if (f !== 'node_modules' && f !== 'dist' && f !== '.git') {
                walkDir(dirPath, callback);
            }
        } else if (f.endsWith('.tsx') || f.endsWith('.jsx')) {
            callback(path.join(dir, f));
        }
    });
}

walkDir(path.join(__dirname, 'src'), (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    // Add loading="lazy" if not present
    let newContent = content.replace(/<img(?![^>]*loading=["']lazy["'])/g, '<img loading="lazy"');
    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Optimized images in ${filePath}`);
    }
});
console.log('Image optimization complete.');
