const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client();

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('📲 Scan the QR code above to authenticate');
});

client.on('ready', async () => {
    console.log('✅ WhatsApp client is ready');

    const groupNameToFind = 'Your Group Name Here'; // Change this to your actual group name

    const chats = await client.getChats();
    const group = chats.find(chat => chat.isGroup && chat.name === groupNameToFind);

    if (group) {
        console.log(`📌 Group Found: ${group.name}`);
        console.log(`✅ Group ID: ${group.id._serialized}`);
    } else {
        console.log('❌ Group not found. Make sure you have joined the group.');
    }

    await client.destroy(); // Close session
});

client.initialize();
