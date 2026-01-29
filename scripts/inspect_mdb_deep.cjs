const AdmZip = require('adm-zip');
const MDBReader = require('mdb-reader').default;
const path = require('path');

const ZIP_FILE = path.resolve(__dirname, '../database/avall.zip');
const zip = new AdmZip(ZIP_FILE);
const mdbEntry = zip.getEntries().find(e => e.entryName.toLowerCase().endsWith('.mdb'));
const buffer = zip.readFile(mdbEntry);
const reader = new MDBReader(buffer);

const aircraftTable = reader.getTable('aircraft');
const aircraftRows = aircraftTable.getData();

console.log('Total Aircraft Rows:', aircraftRows.length);
const samples = aircraftRows.slice(0, 10);
samples.forEach((row, i) => {
    console.log(`Row ${i} regis_no:`, row.regis_no || row.REGIS_NO);
});

// Search for N9305P
const n9305p = aircraftRows.filter(r => (r.regis_no || r.REGIS_NO) === 'N9305P');
console.log('Found N9305P in MDB:', n9305p.length);
if (n9305p.length > 0) {
    console.log('N9305P Entry:', n9305p[0]);
}
