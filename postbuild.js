const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const { moveRemoveSync } = require('rimraf');

const htmlDirectory = __dirname + '/dist'; // Replace with the actual directory containing your HTML files
const jsDirectory = __dirname + '/dist/js'; // Replace with the actual directory containing your JS files
const cssDirectory = __dirname + '/dist/assets'; // Replace with the actual directory containing your JS files

// Read HTML files in the directory
const files = fs.readdirSync(htmlDirectory);

// Process each HTML file
files.filter(fileOrFolder => fileOrFolder.endsWith('.html')).forEach(file => {
  const htmlFilePath = path.join(htmlDirectory, file);
  const targetFolder = path.join(htmlDirectory, file.replace('.html', ''));

  // Read HTML file
  const data = fs.readFileSync(htmlFilePath, 'utf8');

  // Find script tags matching the pattern
  const newData = data.replace(/<link\s+(?:[^>]+\s+)?href="\/(js\/common|assets)\/([^"]+)"/g, (all, typeMatch, match) => {
    const type = typeMatch === 'js/common' ? 'js' : 'css';

    const jsOrCssFileName = match;
    const jsFilePath = path.join(jsDirectory, 'common', jsOrCssFileName);
    const cssFilePath = path.join(cssDirectory, jsOrCssFileName);

    // Copy JS file to the new directory
    const targetFilePath = path.join(targetFolder, jsOrCssFileName);
    mkdirp.sync(targetFolder); // Create target folder if it doesn't exist
    fs.copyFileSync(type === 'js' ? jsFilePath : cssFilePath, targetFilePath);
    return all.replace(/href="\/(js\/common|assets)\/([^"]+)"/, 'href="$2"');
  })
    .replace(/<script\s+(?:[^>]+\s+)?src="\/js\/([^"]+)"/g, (all) => all.replace(/src="\/js\/([^"]+)"/, 'src="$1"'))
    .replace('<head>', `<head><base href="/${file.replace('.html', '')}/">`);

  const jsEntryFile = path.join(jsDirectory, file.replace('.html', '.js'));

  fs.copyFileSync(jsEntryFile, path.join(targetFolder, file.replace('.html', '.js')));

  // move html to target folder
  const targetHtmlFilePath = path.join(targetFolder, 'index.html');
  
  fs.writeFileSync(htmlFilePath, newData);
  
  fs.copyFileSync(htmlFilePath, targetHtmlFilePath);
  
  fs.unlinkSync(htmlFilePath);


});

console.log('done post processing');

console.log('cleaning files');
// delete htmlFilePath / js folder
moveRemoveSync(jsDirectory);

// delete htmlFilePath / js folder
moveRemoveSync(cssDirectory);
console.log('done');