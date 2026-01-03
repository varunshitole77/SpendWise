declare module 'pdf-parse' {
  type PdfParseResult = {
    numpages?: number;
    numrender?: number;
    info?: any;
    metadata?: any;
    text: string;
    version?: string;
  };

  type PdfParseOptions = {
    max?: number;
    pagerender?: (pageData: any) => any;
    version?: string;
  };

  export default function pdfParse(
    data: Buffer | Uint8Array | ArrayBuffer,
    options?: PdfParseOptions
  ): Promise<PdfParseResult>;
}
