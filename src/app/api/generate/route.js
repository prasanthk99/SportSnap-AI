import { generateScript } from "@/utils/openai";
import { synthesizeSpeech } from "@/utils/polly";
import { generateVideoFromImage } from "@/utils/runway";
import { uploadToS3 } from "@/utils/aws";
import { writeFileSync, existsSync, mkdirSync, readFileSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";
import { Readable } from "stream";
import { generateImage } from "@/utils/generateImage";
import axios from "axios";

export async function POST(req) {
  try {
    const { celebrity } = await req.json();
    const script = await generateScript(celebrity);

    const audioUrl = await synthesizeSpeech(script, celebrity);

    // ✅ Generate AI image of the celebrity
    const imagePrompt = `"a realistic portrait of ${celebrity} with a neutral background"`;
    const { imageUrl: imageUrlFromPexels } = await generateImage(imagePrompt);
    const response = await axios.get(imageUrlFromPexels, {
      responseType: "arraybuffer",
    });
    const imageBuffer = Buffer.from(response.data);

    const imageKey = `${celebrity}-${Date.now()}.png`;
    const imageUrl = await uploadToS3(
      imageBuffer,
      imageKey,
      "image/png",
      "images"
    );

    const mimeType = "image/jpeg";

    // Generate video from image and script from runway
    const audioBuffer = await axios.get(audioUrl, { responseType: "arraybuffer" }).then(res => Buffer.from(res.data));

    const videoBuffer = await generateVideoFromImage(imageBuffer, mimeType, script,audioBuffer);

    // Upload video to S3
    const videoKey = `${celebrity}-${Date.now()}.mp4`;
    const uploadedVideoUrl = await uploadToS3(
      videoBuffer,
      videoKey,
      "video/mp4",
      "videos"
    );

    // Update meta with real S3 URL
    const title = `Reels of ${celebrity}`;
    const newMeta = {
      celebrity,
      title,
      script,
      videoUrl: uploadedVideoUrl,
      audioUrl,
      imageUrl,
      createdAt: new Date().toISOString(),
    };

    const filePath = join(process.cwd(), "data", "videos.json");
    const dataDir = join(process.cwd(), "data");
    if (!existsSync(dataDir)) mkdirSync(dataDir);

    let existing = [];
    if (existsSync(filePath)) {
      existing = JSON.parse(readFileSync(filePath, "utf-8"));
    }

    existing.unshift(newMeta);
    writeFileSync(filePath, JSON.stringify(existing, null, 2));

    return NextResponse.json({ success: true, data: newMeta });
  } catch (err) {
    console.error("Generate Error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
