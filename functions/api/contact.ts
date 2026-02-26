interface Env {
  WEB3FORMS_ACCESS_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    // Get form data
    const formData = await request.formData();
    const name = formData.get('name');
    const email = formData.get('email');
    const topic = formData.get('topic');
    const message = formData.get('message');

    // Basic validation
    if (!name || !email || !topic || !message) {
      return new Response(JSON.stringify({ error: 'All fields are required' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Check if access key is available
    if (!env.WEB3FORMS_ACCESS_KEY) {
      console.error('WEB3FORMS_ACCESS_KEY not found in environment variables');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Send to Web3Forms
    const web3formsData = new FormData();
    web3formsData.append('access_key', env.WEB3FORMS_ACCESS_KEY);
    web3formsData.append('name', name as string);
    web3formsData.append('email', email as string);
    web3formsData.append('subject', `[virtualpavi.com] ${topic}`);
    web3formsData.append('message', message as string);

    console.log('Sending to Web3Forms...');
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: web3formsData
    });

    const result = await response.json() as { success: boolean; message?: string };
    console.log('Web3Forms response:', result);

    if (result.success) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } else {
      console.error('Web3Forms error:', result);
      return new Response(JSON.stringify({ error: result.message || 'Failed to send' }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  } catch (error) {
    console.error('Contact form error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to send message',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};
