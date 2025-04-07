import RunwayML from '@runwayml/sdk';

const client = new RunwayML({
  apiKey: process.env.RUNWAY_API_KEY,
});

export async function generateVideoFromImage(imageBuffer, mimeType, script,audioBuffer) {
  try {
    const base64Image = imageBuffer.toString('base64');
    const audioBase64 = audioBuffer.toString('base64');

    const imageToVideo = await client.imageToVideo.create({
      model: 'gen3a_turbo',
      promptImage: `data:${mimeType};base64,${base64Image}`,
      promptText:`Generate a Video with audio`,
      promptAudio: `data:audio/mpeg;base64,${audioBase64}`
    });

    const taskId = imageToVideo.id;
    let task;

    do {
      await new Promise(resolve => setTimeout(resolve, 10000));
      task = await client.tasks.retrieve(taskId);
    } while (!['SUCCEEDED', 'FAILED'].includes(task.status));

    if (task.status === 'SUCCEEDED') {
      console.log(task);
      // const videoBuffer = await client.tasks.download(taskId, 'video');
      return task.output[0];
    } else {
      console.error('RunwayML task failed:', task);
      throw new Error('RunwayML video generation failed');
    }
  } catch (err) {
    console.error('RunwayML Task Error:', err);
    throw err;
  }
}
