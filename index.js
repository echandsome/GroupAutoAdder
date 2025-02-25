const fs = require('fs');
const csv = require('csv-parser');
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Initialize WhatsApp Web client
const client = new Client();

// Define Group ID and Group Invite Link
const groupId = '1203630xxxxxxxxxxxx@g.us'; // 🔄 Replace with actual Group ID (only if you are admin)
const groupInviteLink = 'https://chat.whatsapp.com/your-invite-link-here'; // 🔄 Replace with actual Group Link

// Read contacts from CSV
async function readContactsFromCsv(csvFilePath) {
    return new Promise((resolve, reject) => {
        const contacts = [];
        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on('data', (row) => {
                if (row.phoneNumber) {
                    contacts.push(row.phoneNumber.trim());
                }
            })
            .on('end', () => resolve(contacts))
            .on('error', (err) => reject(err));
    });
}

// Function to add users to the WhatsApp group using Group ID
async function addUsersToGroup(contacts) {
    try {
        const group = await client.getChatById(groupId);
        for (const phoneNumber of contacts) {
            try {
                await group.addParticipants([`${phoneNumber}@c.us`]);
                console.log(`✅ Added ${phoneNumber} to the group`);
                
                // Wait before adding the next user to avoid being flagged
                await new Promise((resolve) => setTimeout(resolve, 10000)); // 10 sec delay
            } catch (error) {
                console.log(`❌ Failed to add ${phoneNumber}, sending invite instead.`);
                await sendGroupInvite(phoneNumber);
            }
        }
    } catch (error) {
        console.log('❌ Error accessing group by ID. Switching to invite link method.');
        await sendGroupInvitesToAll(contacts);
    }
}

// Function to send a group invite link to a contact
async function sendGroupInvite(phoneNumber) {
    try {
        const chatId = `${phoneNumber}@c.us`; // Format phone number for WhatsApp
        const chat = await client.getChatById(chatId);

        // Send invite message
        await chat.sendMessage(`📢 Join our WhatsApp group: ${groupInviteLink}`);
        console.log(`✅ Sent invite link to ${phoneNumber}`);

        // Wait before sending the next message
        await new Promise((resolve) => setTimeout(resolve, 10000)); // 10 sec delay
    } catch (error) {
        console.log(`❌ Error sending link to ${phoneNumber}: ${error.message}`);
    }
}

// Function to send invites to all users if Group ID fails
async function sendGroupInvitesToAll(contacts) {
    for (const phoneNumber of contacts) {
        await sendGroupInvite(phoneNumber);
    }
}

// Handle QR Code for Authentication
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('📲 Scan the QR code above to authenticate');
});

// When WhatsApp is Ready
client.on('ready', async () => {
    console.log('✅ WhatsApp client is ready');

    try {
        const contacts = await readContactsFromCsv('contacts.csv');
        console.log('📂 Contacts Loaded:', contacts);

        if (groupId) {
            await addUsersToGroup(contacts);
        } else {
            await sendGroupInvitesToAll(contacts);
        }
    } catch (error) {
        console.log('❌ Error:', error);
    }
});

// Initialize WhatsApp client
client.initialize();
