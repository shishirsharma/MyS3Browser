import {
  S3Client,
  ListBucketsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  GetBucketLocationCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { Credential, BucketInfo, S3ListResult, S3Object, S3Folder } from '@/types';

let s3Client: S3Client | null = null;

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function initializeClient(credential: Credential, region?: string): S3Client {
  const clientRegion = region || credential.region;
  s3Client = new S3Client({
    region: clientRegion,
    credentials: {
      accessKeyId: credential.accessKeyId,
      secretAccessKey: credential.secretAccessKey,
    },
  });
  return s3Client;
}

function createClientForRegion(credential: Credential, region: string): S3Client {
  return new S3Client({
    region,
    credentials: {
      accessKeyId: credential.accessKeyId,
      secretAccessKey: credential.secretAccessKey,
    },
  });
}

export function getClient(): S3Client | null {
  return s3Client;
}

export async function listBuckets(credential: Credential): Promise<BucketInfo[]> {
  const client = initializeClient(credential);

  const command = new ListBucketsCommand({});
  const response = await client.send(command);

  const buckets = response.Buckets || [];

  // Fetch region for each bucket
  const bucketsWithRegions = await Promise.all(
    buckets.map(async (bucket) => {
      const bucketName = bucket.Name || '';
      let region: string | undefined;

      try {
        const locationCommand = new GetBucketLocationCommand({
          Bucket: bucketName,
        });
        const locationResponse = await client.send(locationCommand);

        // AWS returns null for us-east-1, need to handle this
        region = locationResponse.LocationConstraint || 'us-east-1';
      } catch (error) {
        console.warn(`Failed to get region for bucket ${bucketName}:`, error);
        // Fall back to credential region if we can't determine bucket region
        region = credential.region;
      }

      return {
        name: bucketName,
        creationDate: bucket.CreationDate,
        region,
      };
    })
  );

  return bucketsWithRegions;
}

export async function listObjects(
  credential: Credential,
  bucket: string,
  prefix: string = '',
  continuationToken?: string,
  bucketRegion?: string
): Promise<S3ListResult> {
  const client = bucketRegion
    ? createClientForRegion(credential, bucketRegion)
    : initializeClient(credential);

  const command = new ListObjectsV2Command({
    Bucket: bucket,
    Prefix: prefix,
    Delimiter: '/',
    MaxKeys: 100,
    ContinuationToken: continuationToken,
  });

  const response = await client.send(command);

  const folders: S3Folder[] = (response.CommonPrefixes || []).map(cp => {
    const folderPrefix = cp.Prefix || '';
    const displayName = folderPrefix
      .slice(prefix.length)
      .replace(/\/$/, '');
    return {
      prefix: folderPrefix,
      displayName,
    };
  });

  const objects: S3Object[] = (response.Contents || [])
    .filter(obj => obj.Key !== prefix) // Filter out the prefix itself
    .map(obj => {
      const key = obj.Key || '';
      const displayName = key.slice(prefix.length);
      return {
        key,
        displayName,
        size: obj.Size || 0,
        humanSize: formatBytes(obj.Size || 0),
        lastModified: obj.LastModified || new Date(),
      };
    });

  return {
    folders,
    objects,
    nextToken: response.NextContinuationToken,
  };
}

export async function uploadFile(
  credential: Credential,
  bucket: string,
  key: string,
  file: File,
  onProgress?: (progress: number) => void,
  bucketRegion?: string
): Promise<void> {
  const client = bucketRegion
    ? createClientForRegion(credential, bucketRegion)
    : initializeClient(credential);

  // Read file as ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: uint8Array,
    ContentType: file.type || 'application/octet-stream',
  });

  await client.send(command);

  // Since AWS SDK v3 doesn't support progress events in browser,
  // we simulate completion
  if (onProgress) {
    onProgress(100);
  }
}

export async function deleteObject(
  credential: Credential,
  bucket: string,
  key: string,
  bucketRegion?: string
): Promise<void> {
  const client = bucketRegion
    ? createClientForRegion(credential, bucketRegion)
    : initializeClient(credential);

  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  await client.send(command);
}

export async function createFolder(
  credential: Credential,
  bucket: string,
  prefix: string,
  bucketRegion?: string
): Promise<void> {
  const client = bucketRegion
    ? createClientForRegion(credential, bucketRegion)
    : initializeClient(credential);

  // Create folder by uploading an empty object with trailing slash
  const folderKey = prefix.endsWith('/') ? prefix : prefix + '/';

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: folderKey,
    Body: new Uint8Array(0),
  });

  await client.send(command);
}

export async function getDownloadUrl(
  credential: Credential,
  bucket: string,
  key: string,
  expiresIn: number = 3600,
  bucketRegion?: string
): Promise<string> {
  const client = bucketRegion
    ? createClientForRegion(credential, bucketRegion)
    : initializeClient(credential);

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  const url = await getSignedUrl(client, command, { expiresIn });
  return url;
}

export async function downloadObject(
  credential: Credential,
  bucket: string,
  key: string,
  bucketRegion?: string
): Promise<void> {
  const url = await getDownloadUrl(credential, bucket, key, 3600, bucketRegion);

  // Extract filename from key
  const filename = key.split('/').pop() || key;

  // Create a temporary anchor element and trigger download
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
