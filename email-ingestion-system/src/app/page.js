'use client';
import React, { useState } from 'react';

export default function EmailConfigPage() {
  const [showConfigDetails, setShowConfigDetails] = useState(false);
  const [configs, setConfigs] = useState([]);
  const [form, setForm] = useState({
    emailAddress: '',
    connectionType: '',
    username: '',
    password: '',
    host: '',
  });

  const handleAddConfig = async () => {
    const response = await fetch('/api/email-ingestion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
  
    if (response.ok) {
      const newConfig = await response.json();
      setConfigs([...configs, newConfig]);
      setShowConfigDetails(true);
      setForm({ emailAddress: '', connectionType: '', username: '', password: '', host: '' });
    } else {
      const errorData = await response.json();
      console.error('Failed to save configuration:', errorData.message);
    }
  };

  const handleCheckInbox = async () => {
    try {
      const response = await fetch('/api/email-ingestion/check-inbox', {
        method: 'POST',
      });

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const result = await response.json();
        if (result.success) {
          alert('Inbox checked successfully!');
        } else {
          alert('Failed to check inbox.');
          console.log('IMAP Host:', process.env.EMAIL_HOST);
        }
      } else {
        console.error('Unexpected response format:', await response.text());
      }
    } catch (error) {
      console.error('Error checking inbox:', error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Email Configuration</h1>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Email Address"
          value={form.emailAddress}
          onChange={(e) => setForm({ ...form, emailAddress: e.target.value })}
          className="p-2 border rounded w-full text-black"
        />
        <input
          type="text"
          placeholder="Connection Type (IMAP, POP3, etc.)"
          value={form.connectionType}
          onChange={(e) => setForm({ ...form, connectionType: e.target.value })}
          className="p-2 border rounded w-full text-black"
        />
        <input
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          className="p-2 border rounded w-full text-black"
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="p-2 border rounded w-full text-black"
        />
        <input
          type="text"
          placeholder="Host (e.g., imap.gmail.com)"
          value={form.host}
          onChange={(e) => setForm({ ...form, host: e.target.value })}
          className="p-2 border rounded w-full text-black"
        />
        <button
          onClick={handleAddConfig}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Configuration
        </button>
        <button
          onClick={handleCheckInbox}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Check Inbox
        </button>
      </div>

      {/* Config Details Display */}
      {showConfigDetails && (
        <div className="mt-4 p-4 border rounded bg-gray-100 text-black">
          <h2 className="text-lg font-semibold">Configuration Details</h2>
          <ul>
            {configs.map((config, index) => (
              <li key={index}>
                {config.emailAddress} - {config.connectionType} - {config.host}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
