// types/pdfkit.d.ts
declare module 'pdfkit' {
  import { Writable } from 'node:stream';

  export type PDFKitDocumentOptions = {
    size?: string | [number, number];
    margin?: number;
  };

  export type PDFKitTextOptions = {
    width?: number;
    align?: 'left' | 'center' | 'right' | 'justify';
  };

  export default class PDFDocument extends Writable {
    x: number;
    y: number;

    constructor(options?: PDFKitDocumentOptions);

    fontSize(size: number): this;
    fillColor(color: string): this;
    moveDown(lines?: number): this;

    text(text: string, x?: number, y?: number, options?: PDFKitTextOptions): this;
    text(text: string, options?: PDFKitTextOptions): this;

    end(): void;

    on(event: 'data', listener: (chunk: Buffer) => void): this;
    on(event: 'end', listener: () => void): this;
    on(event: 'error', listener: (err: Error) => void): this;
  }
}
