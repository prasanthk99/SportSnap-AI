import axios from 'axios';

export async function generateImage(query) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/images/generations', 
      {
        prompt: query,
        n: 1, 
        size: '1024x1024',
      }, 
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        }
      }
    );

    const imageUrl = response.data.data[0]?.url;

    if (!imageUrl) {
      return { error: 'Image not found', status: 404 };
    }

    return { imageUrl };
  } catch (error) {
    console.error('DALL·E API Error:', error);
    return { error: 'Failed to fetch image', status: 500 };
  }
}
