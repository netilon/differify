const fs = require('fs');
const path = require('path');

(function () {
  try {
    const file = path.resolve(__dirname, '..', 'index.d.ts');
    const content = fs.readFileSync(file, { encoding: 'utf8' });
    const toAppend = 'export default Differify';
    if (!content.includes(toAppend)) {
      let newContent = '';
      newContent += content;
      newContent += '\n\n';
      newContent += toAppend;
      fs.writeFileSync(file, newContent);
      console.log('default export added!');
    } else {
      console.log('default export already exists!, aborting operation.');
    }
  } catch (e) {
    console.log('index.d.ts: ', e.message);
    console.log('aborting operation...');
  }
})();
