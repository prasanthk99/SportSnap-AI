// src/app/api/videos/route.js
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'data', 'videos.json');

    if (!existsSync(filePath)) {
      return NextResponse.json({ videos: [] }); // return empty if file not there
    }

    const file = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(file);

    return NextResponse.json({ videos: data });
  } catch (err) {
    console.error('Fetch videos error:', err);
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
  }
}
