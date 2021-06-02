export interface CryptographyStrategy {
  decrypt(data: Buffer): Buffer;
  encrypt(data: Buffer): Buffer;
}
