import AWS from 'aws-sdk';

AWS.config.update({
  region: 'ap-south-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const polly = new AWS.Polly();
const s3 = new AWS.S3();

export async function synthesizeSpeech(text, name) {
  const params = {
    OutputFormat: 'mp3',
    Text: text,
    VoiceId: 'Joanna',
    Engine: 'neural'
  };

  const audioStream = await polly.synthesizeSpeech(params).promise();

  const Key = `audio/${name}-${Date.now()}.mp3`;

  await s3.putObject({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key,
    Body: audioStream.AudioStream,
    ContentType: 'audio/mpeg'
  }).promise();

  const audioUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${Key}`;
  return audioUrl;
}