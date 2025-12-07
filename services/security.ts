
import { v4 as uuidv4 } from 'uuid';

// CONFIGURATION
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Megabytes
const ALLOWED_EXTENSIONS = ['pdf', 'png', 'jpg', 'jpeg'];

const ALLOWED_MIME_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
};

// Magic Numbers (Hex signatures)
const MAGIC_NUMBERS: Record<string, number[]> = {
  'pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
  'png': [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], // .PNG....
  'jpg': [0xFF, 0xD8, 0xFF] // ÿØÿ
};

/**
 * Validates an uploaded file for security risks (Size, Extension, Magic Numbers).
 * Renames the file with a UUID if valid.
 * @param file The File object from the input
 * @returns Promise resolving to the sanitized File object or rejecting with an error
 */
export const validateAndSecureFile = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    // 1. Check if file exists
    if (!file) {
      reject(new Error("No file selected"));
      return;
    }

    // 2. Check File Size
    if (file.size > MAX_FILE_SIZE) {
      reject(new Error("File exceeds maximum size of 5MB"));
      return;
    }

    // 3. Validate Extension (The "Weak" Check)
    const filename = file.name.toLowerCase();
    const ext = filename.split('.').pop();
    
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
      reject(new Error(`Extension .${ext} is not allowed`));
      return;
    }

    // 4. Validate Magic Numbers (The "Strong" Check)
    const reader = new FileReader();
    
    reader.onloadend = (e) => {
      if (!e.target || !e.target.result) {
        reject(new Error("Failed to read file"));
        return;
      }

      const arr = (new Uint8Array(e.target.result as ArrayBuffer)).subarray(0, 4);
      let header = "";
      for(let i = 0; i < arr.length; i++) {
        header += arr[i].toString(16).toUpperCase();
      }

      // Check against magic numbers
      let isValidMagic = false;
      let detectedType = "";

      // Check PDF
      if (compareBytes(arr, MAGIC_NUMBERS['pdf'])) {
        isValidMagic = true;
        detectedType = 'application/pdf';
      }
      // Check PNG
      else if (compareBytes(arr, MAGIC_NUMBERS['png'])) {
        isValidMagic = true;
        detectedType = 'image/png';
      }
      // Check JPG (Start only)
      else if (compareBytes(arr, MAGIC_NUMBERS['jpg'])) {
        isValidMagic = true;
        detectedType = 'image/jpeg';
      }

      if (!isValidMagic) {
        reject(new Error(`Security Alert: File content does not match allowed types (PDF, PNG, JPG)`));
        return;
      }

      // 5. Sanitize & Anonymize Filename
      const uniqueName = uuidv4();
      const safeFilename = `${uniqueName}.${ALLOWED_MIME_TYPES[detectedType] || ext}`;
      
      // Create a new File object with the safe name
      const safeFile = new File([file], safeFilename, { type: detectedType });
      
      resolve(safeFile);
    };

    reader.onerror = () => {
      reject(new Error("Error reading file"));
    };

    // Read first 2KB (or less) for magic number check
    // We actually only need the first few bytes, but reading a small chunk is fine.
    // slice is supported on File objects (Blob interface)
    const blob = file.slice(0, 2048);
    reader.readAsArrayBuffer(blob);
  });
};

function compareBytes(fileBytes: Uint8Array, magicBytes: number[]): boolean {
  if (fileBytes.length < magicBytes.length) return false;
  for (let i = 0; i < magicBytes.length; i++) {
    if (fileBytes[i] !== magicBytes[i]) return false;
  }
  return true;
}
