/**
 * Wraps this repo as a Safari Web Extension using Apple's converter (macOS + Xcode only).
 * @see https://developer.apple.com/documentation/safariservices/packaging-a-web-extension-for-safari
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'safari', 'GoonopticonApp');

if (process.platform !== 'darwin') {
    console.log(
        'The Safari converter only runs on macOS with Xcode Command Line Tools.\n\n' +
            'Quick test without Xcode: run `npm run build`, then in Safari (macOS) open\n' +
            'Safari → Settings → Developer → "Add Temporary Extension…" and choose this\n' +
            'folder (the one that contains manifest.json).\n',
    );
    process.exit(0);
}

fs.mkdirSync(path.dirname(outDir), { recursive: true });

const args = [
    'safari-web-extension-converter',
    root,
    '--project-location',
    outDir,
    '--macos-only',
    '--copy-resources',
    '--bundle-identifier',
    'com.crudepixels.goonopticon.extension',
    '--swift',
    '--force',
    '--no-open',
    '--no-prompt',
];

const result = spawnSync('xcrun', args, {
    stdio: 'inherit',
    cwd: root,
    shell: false,
});

if (result.error) {
    console.error(result.error.message);
    process.exit(1);
}

if (result.status !== 0) {
    console.error(
        '\nxcrun safari-web-extension-converter failed. Install Xcode, then try:\n' +
            '  xcode-select --install\n' +
            'If Apple renamed the tool, run: xcrun --find safari-web-extension-converter\n',
    );
    process.exit(result.status || 1);
}

console.log(`\n✓ Safari app shell created at:\n  ${outDir}\n`);
console.log('Open GoonopticonApp.xcodeproj in Xcode, select the macOS scheme, then Product → Run.\n');
console.log('Distribution requires an Apple Developer Program membership (Mac App Store).\n');
