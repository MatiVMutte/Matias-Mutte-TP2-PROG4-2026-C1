import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseStorageService {
  private readonly supabase: SupabaseClient;
  private readonly publicUrl: string;

  constructor() {
    const url = process.env.SUPABASE_URL ?? '';
    const key = process.env.SUPABASE_ANON_KEY ?? '';
    this.supabase = createClient(url, key);
    this.publicUrl = `${url}/storage/v1/object/public`;
  }

  async upload(
    bucket: 'avatars' | 'posts',
    file: Express.Multer.File,
  ): Promise<string> {
    const ext = file.originalname.split('.').pop();
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
    const path = `${bucket}/${filename}`;

    const { error } = await this.supabase.storage
      .from(bucket)
      .upload(filename, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) throw new Error(`Error subiendo imagen: ${error.message}`);

    return `${this.publicUrl}/${path}`;
  }
}
