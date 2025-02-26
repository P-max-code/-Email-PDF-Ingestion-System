import { NextResponse } from 'next/server';
import { ImapFlow } from 'imapflow';
import fs from 'fs';
import path from 'path';
import prisma from '@/lib/prisma';


export async function POST() {
  try {
    // Replace with your actual IMAP config
    const client = new ImapFlow({
      host: 'imap.example.com', // Your IMAP host (e.g., imap.gmail.com)
      port: 993,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER, // Set in .env
        pass: process.env.EMAIL_PASS, // Set in .env
      },
    });

    await client.connect();

    // Select inbox
    let lock = await client.getMailboxLock('INBOX');
    try {
      // Search unseen emails
      for await (let message of client.fetch({ seen: false }, { envelope: true, source: true })) {
        const fromAddress = message.envelope.from[0].address;
        const subject = message.envelope.subject;
        const dateReceived = message.envelope.date;

        // Process attachments
        for (let part of message.envelope.attachments || []) {
          if (part.filename.endsWith('.pdf')) {
            const attachmentPath = path.join('./pdfs', part.filename);
            fs.writeFileSync(attachmentPath, part.content);

            // Save metadata in DB
            await prisma.pDFMetadata.create({
              data: {
                fromAddress,
                subject,
                dateReceived,
                attachmentFileName: part.filename,
                emailConfigId: 1, // Link to the correct email configuration
              },
            });
          }
        }
      }
    } finally {
      lock.release();
    }

    await client.logout();
    return NextResponse.json({ success: true, message: 'Checked inbox successfully!' });
  } catch (error) {
    console.error('Inbox Check Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to check inbox.' });
  }
}
