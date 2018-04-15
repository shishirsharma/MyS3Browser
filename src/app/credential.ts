
export class Credential {
  constructor(
    public access_key_id: string,
    public secret_access_key: string,
    public s3_region: string,
    public s3_bucket: string,
    public name: string = ''
  ) {  }

}
