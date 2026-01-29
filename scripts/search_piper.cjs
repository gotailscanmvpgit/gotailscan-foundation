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

const pipers = aircraftRows.filter(r => (r.acft_make || '').toLowerCase().includes('piper')).slice(0, 5);
pipers.forEach(p => console.log(p.regis_no, p.acft_make, p.acft_model));
