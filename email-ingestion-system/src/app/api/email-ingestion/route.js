// /src/app/api/email-ingestion/route.js
export async function POST(req) {
  try {
    const body = await req.json();
    const { emailAddress, connectionType, username, password, host } = body;

    if (!emailAddress || !connectionType || !username || !password || !host) {
      return new Response(JSON.stringify({ success: false, message: 'All fields are required' }), {
        status: 400,
      });
    }

    // Simulate saving the config
    const newConfig = { emailAddress, connectionType, username, password, host };
    return new Response(JSON.stringify(newConfig), { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ success: false, message: 'Server error' }), {
      status: 500,
    });
  }
}
