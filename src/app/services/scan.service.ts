import { Injectable } from '@angular/core';

const OCR_SCRIPT_URL = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';

@Injectable({
  providedIn: 'root'
})
export class ScanService {
  private tesseractPromise: Promise<any> | null = null;

  async recognize(file: File): Promise<string> {
    const tesseract = await this.loadOcrEngine();
    const result = await tesseract.recognize(file, 'eng');
    return (result && result.data && result.data.text) || '';
  }

  private loadOcrEngine(): Promise<any> {
    const existing = (window as any).Tesseract;
    if (existing) {
      return Promise.resolve(existing);
    }
    if (this.tesseractPromise) {
      return this.tesseractPromise;
    }
    this.tesseractPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = OCR_SCRIPT_URL;
      script.async = true;
      script.onload = () => {
        const loaded = (window as any).Tesseract;
        if (loaded) {
          resolve(loaded);
        } else {
          reject(new Error('OCR engine did not initialize'));
        }
      };
      script.onerror = () => reject(new Error('Unable to load the OCR engine'));
      document.body.appendChild(script);
    });
    return this.tesseractPromise;
  }
}

export function normalizeScanText(text: string): string {
  return text
    .replace(/\r/g, '\n')
    .split('\n')
    .map(line => line.replace(/\s+/g, ' ').trim())
    .filter(line => !!line)
    .join('\n');
}

export function extractChemicalCandidates(text: string): string[] {
  const lines = normalizeScanText(text).split('\n');
  const candidates: string[] = [];

  for (const raw of lines) {
    const line = raw
      .replace(/\b\d+(?:[.,]\d+)?\s?%/g, ' ')
      .replace(/\b(?:mg|g|kg|ml|l|mm|um|nm|mol|mmol|mM|uM|pH)\b/gi, ' ')
      .replace(/\b(?:lot|batch|cat|ref|cas)\b\s*[:#]?\s*[A-Za-z0-9-]+/gi, ' ')
      .replace(/[™®©]/g, ' ')
      .replace(/[^A-Za-z0-9()\[\]\-+,.' ]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/^[^A-Za-z]+/, '')
      .replace(/[^A-Za-z0-9)\]]+$/, '')
      .trim();

    if (line.length < 2 || !/[A-Za-z]{2}/.test(line)) {
      continue;
    }
    if (/\b(?:warning|danger|caution|keep out|do not|ingredients?|contains)\b/i.test(line)) {
      continue;
    }
    if (candidates.some(candidate => candidate.toLowerCase() === line.toLowerCase())) {
      continue;
    }
    candidates.push(line);
  }

  return candidates.sort((a, b) => scoreCandidate(b) - scoreCandidate(a)).slice(0, 8);
}

function scoreCandidate(value: string): number {
  const words = value.split(/\s+/).filter(Boolean);
  let score = 0;
  if (words.length > 0 && words.length <= 4) {
    score += 2;
  }
  if (words.length >= 2) {
    score += 1;
  }
  if (/[a-z]/.test(value)) {
    score += 1;
  }
  if (/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+$/.test(value)) {
    score += 2;
  }
  if (/\d/.test(value) || /^[A-Za-z]{2,12}$/.test(value)) {
    score += 1;
  }
  return score;
}
