export const onRequestPost: PagesFunction = async ({ request, env }) => {
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
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Send to Web3Forms
    const web3formsData = new FormData();
    web3formsData.append('access_key', env.WEB3FORMS_ACCESS_KEY);
    web3formsData.append('name', name);
    web3formsData.append('email', email);
    web3formsData.append('subject', `[virtualpavi.com] ${topic}`);
    web3formsData.append('message', message);

    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: web3formsData
    });

    const result = await response.json();

    if (result.success) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      throw new Error('Failed to send message');
    }
  } catch (error) {
    console.error('Contact form error:', error);
    return new Response(JSON.stringify({ error: 'Failed to send message' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
