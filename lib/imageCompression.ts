import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jyfxflqsqlngwpfjleiy.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5ZnhmbHFzcWxuZ3dwZmpsZWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1NjE0MjUsImV4cCI6MjEwNzEzNzQyNX0.9t43vXbWGrW74FzxJGcu34rGKtzER9euLFHwFxebQlY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0 (default 0.75 for heavy KB savings)
}

/**
 * Compresses any user-selected image (PNG, JPG, HEIC, etc.)
 * into a lightweight WebP image file under small KB size using HTML5 Canvas.
 */
export async function compressImageToWebP(
  file: File,
  options: CompressionOptions = {}
): Promise<{ webpBlob: Blob; originalSizeKb: number; compressedSizeKb: number }> {
  const { maxWidth = 1400, maxHeight = 1400, quality = 0.75 } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        // Maintain aspect ratio while bounding within max dimensions
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to create canvas context for image compression'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to encode image to WebP'));
              return;
            }

            const originalSizeKb = Math.round(file.size / 1024);
            const compressedSizeKb = Math.round(blob.size / 1024);

            console.log(
              `⚡ Image compressed: ${file.name} | Original: ${originalSizeKb} KB ➔ WebP: ${compressedSizeKb} KB (${Math.round((1 - compressedSizeKb / originalSizeKb) * 100)}% reduction)`
            );

            resolve({ webpBlob: blob, originalSizeKb, compressedSizeKb });
          },
          'image/webp',
          quality
        );
      };

      img.onerror = () => reject(new Error('Could not load image file'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Compresses image to WebP and uploads directly to Supabase Storage bucket 'property-assets'.
 * Returns the short, clean public CDN URL (no base64 stored in database!).
 */
export async function uploadImageToStorage(
  file: File,
  folder: string = 'properties'
): Promise<string> {
  try {
    // 1. Convert and compress image to WebP format in KBs
    const { webpBlob } = await compressImageToWebP(file);

    // 2. Generate clean, unique filename
    const timestamp = Date.now();
    const cleanName = file.name
      .toLowerCase()
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-z0-9]/g, '-');
    const filePath = `${folder}/${cleanName}-${timestamp}.webp`;

    // 3. Upload to Supabase Storage bucket
    const { error: uploadError } = await supabase.storage
      .from('property-assets')
      .upload(filePath, webpBlob, {
        contentType: 'image/webp',
        cacheControl: '31536000', // 1 year immutable cache
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw uploadError;
    }

    // 4. Retrieve clean public CDN URL
    const { data: urlData } = supabase.storage
      .from('property-assets')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Failed to compress and upload image:', error);
    throw error;
  }
}

/**
 * Compresses multiple user-selected images in parallel to WebP
 * and uploads them to Cloud Storage bucket. Returns array of public URLs.
 */
export async function uploadMultipleImagesToStorage(
  files: FileList | File[],
  folder: string = 'properties'
): Promise<string[]> {
  const fileArray = Array.from(files);
  const uploadPromises = fileArray.map((file) => uploadImageToStorage(file, folder));
  return Promise.all(uploadPromises);
}

/**
 * Uploads master plan PDF or documents directly to Cloud Storage bucket 'property-assets'.
 * Returns the public CDN URL.
 */
export async function uploadPdfToStorage(
  file: File,
  folder: string = 'master-plans'
): Promise<string> {
  try {
    const timestamp = Date.now();
    const cleanName = file.name
      .toLowerCase()
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-z0-9]/g, '-');
    const filePath = `${folder}/${cleanName}-${timestamp}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from('property-assets')
      .upload(filePath, file, {
        contentType: 'application/pdf',
        cacheControl: '31536000',
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage PDF upload error:', uploadError);
      throw uploadError;
    }

    const { data: urlData } = supabase.storage
      .from('property-assets')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Failed to upload PDF document:', error);
    throw error;
  }
}

