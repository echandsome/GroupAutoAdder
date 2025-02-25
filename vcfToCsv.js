const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Function to convert VCF to CSV
function convertVcfToCsv(vcfFilePath, csvFilePath) {
    fs.readFile(vcfFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading .vcf file:', err);
            return;
        }

        // Parse VCF data
        const contacts = parseVcfData(data);

        // Write contacts to CSV
        writeToCsv(contacts, csvFilePath);
    });
}

// Function to parse VCF file
function parseVcfData(data) {
    const contacts = [];
    const vCards = data.split(/(?=BEGIN:VCARD)/); // Split each contact

    vCards.forEach(vCard => {
        if (!vCard.includes('BEGIN:VCARD')) return;

        const nameMatch = vCard.match(/FN:(.+)/);
        const phoneMatches = vCard.match(/TEL[^:]*:([^\r\n]+)/g); 

        const name = nameMatch ? nameMatch[1].trim() : 'Unknown';
        const phoneNumbers = phoneMatches ? phoneMatches.map(p => p.split(':')[1].trim()).join(', ') : '';

        contacts.push({ name, phoneNumber: phoneNumbers });
    });

    return contacts;
}

// Function to write data to CSV
function writeToCsv(contacts, csvFilePath) {
    const csvWriter = createCsvWriter({
        path: csvFilePath,
        header: [
            { id: 'name', title: 'Name' },
            { id: 'phoneNumber', title: 'Phone Number' }
        ]
    });

    csvWriter.writeRecords(contacts)
        .then(() => console.log(`CSV file written to: ${csvFilePath}`))
        .catch((err) => console.error('Error writing CSV file:', err));
}

// Usage
const vcfFilePath = 'contacts.vcf'; // Input VCF file
const csvFilePath = 'contacts.csv'; // Output CSV file

convertVcfToCsv(vcfFilePath, csvFilePath);
