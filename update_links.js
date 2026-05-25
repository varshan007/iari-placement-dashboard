import fs from 'fs';

let dataJs = fs.readFileSync('js/data.js', 'utf-8');

// I will use regex to find each object and add careersLink before the description or at the end.
// A better way: eval the data, modify it, then stringify it. But it's an ES module.
// Let's strip the export, eval, modify, stringify, and write back.

const dataStr = dataJs.replace('export default companiesData;', '').replace('const companiesData = ', '').trim();
// removing trailing semicolon
const arrayStr = dataStr.endsWith(';') ? dataStr.slice(0, -1) : dataStr;

// we can't eval easily if it's not strictly JSON (it has unquoted keys).
