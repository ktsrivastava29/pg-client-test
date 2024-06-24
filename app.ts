import express from 'express';
import bodyParser from 'body-parser';
import pool from './db';

const app = express();
const port = 3000;
import dotenv from 'dotenv';
dotenv.config();

app.use(bodyParser.json());

app.post('/identify', async (req, res) => {
  const { email, phoneNumber } = req.body;

  if (!email && !phoneNumber) {
    return res.status(400).send({ error: 'email or phoneNumber is required' });
  }

  try {
    const client = await pool.connect();

    // Find all contacts that match the given email or phoneNumber
    const result = await client.query(`
      SELECT * FROM contacts 
      WHERE email = $1 OR phoneNumber = $2
    `, [email, phoneNumber]);

    const contacts = result.rows;

    if (contacts.length === 0) {
      // No existing contact found, create a new primary contact
      const insertResult = await client.query(`
        INSERT INTO contacts (email, phoneNumber, linkPrecedence)
        VALUES ($1, $2, 'primary')
        RETURNING *
      `, [email, phoneNumber]);

      const newContact = insertResult.rows[0];

      return res.status(200).send({
        contact: {
          primaryContactId: newContact.id,
          emails: [newContact.email],
          phoneNumbers: [newContact.phoneNumber],
          secondaryContactIds: []
        }
      });
    }

    // Determine the primary contact
    let primaryContact = contacts.find(contact => contact.linkPrecedence === 'primary');
    if (!primaryContact) {
      primaryContact = contacts.reduce((oldest, contact) => 
        new Date(contact.createdAt) < new Date(oldest.createdAt) ? contact : oldest
      );
    }

    // Collect all related contacts
    const relatedContacts = contacts.filter(contact => 
      contact.id !== primaryContact.id
    );

    // Update secondary contacts if necessary
    const emails = new Set([primaryContact.email]);
    const phoneNumbers = new Set([primaryContact.phoneNumber]);
    const secondaryContactIds = [];

    for (const contact of relatedContacts) {
      if (contact.email) emails.add(contact.email);
      if (contact.phoneNumber) phoneNumbers.add(contact.phoneNumber);
      if (contact.linkPrecedence !== 'secondary') {
        await client.query(`
          UPDATE contacts SET linkedId = $1, linkPrecedence = 'secondary'
          WHERE id = $2
        `, [primaryContact.id, contact.id]);
      }
      secondaryContactIds.push(contact.id);
    }

    // Close the database connection
    client.release();

    // Send the consolidated contact response
    res.status(200).send({
      contact: {
        primaryContactId: primaryContact.id,
        emails: Array.from(emails),
        phoneNumbers: Array.from(phoneNumbers),
        secondaryContactIds
      }
    });
  } catch (error) {
    console.error('Error handling /identify request:', error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Identity reconciliation service listening at http://localhost:${port}`);
});
