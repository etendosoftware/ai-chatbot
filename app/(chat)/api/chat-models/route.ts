import { NextResponse } from 'next/server';
import { References } from '@/utils/references';
import { auth } from '@/app/(auth)/auth';

export async function GET(request: Request) {
  const session = await auth();
  if (!session || !session.user || !session.user.jwt) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = `${process.env.ETENDO_URL}/${References.url.COPILOT}/${References.url.GET_ASSISTANTS}`;
  console.log('Fetching chat models from:', url);
  const options: RequestInit = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + process.env.NEXT_PUBLIC_ACCESS_TOKEN,
    },
  };
  console.log('Request options:', options);

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error('Failed to fetch models');
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch chat models:', error);
    return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 });
  }
}