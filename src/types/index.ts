export interface Credential {
  name: string;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucket: string;
}

export interface S3Object {
  key: string;
  displayName: string;
  size: number;
  humanSize: string;
  lastModified: Date;
  downloadUrl?: string;
}

export interface S3Folder {
  prefix: string;
  displayName: string;
}

export interface S3ListResult {
  folders: S3Folder[];
  objects: S3Object[];
  nextToken?: string;
}

export interface BucketInfo {
  name: string;
  creationDate?: Date;
  region?: string;
}

// Google Analytics types
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}
