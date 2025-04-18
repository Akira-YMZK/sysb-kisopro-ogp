import { NextResponse } from 'next/server';
import classroomsData from '../../../lib/data/classrooms.json';

export async function GET() {
  return NextResponse.json(classroomsData);
}
