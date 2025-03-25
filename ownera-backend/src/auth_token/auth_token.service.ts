import { Injectable } from '@nestjs/common';
import { createSign, randomBytes } from 'crypto';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig(); 

@Injectable()
export class AuthTokenService {
    private readonly API_KEY = process.env.API_KEY;
    private readonly ORGANIZATION_ID = process.env.ORGANIZATION_ID;
    private readonly PRIVATE_KEY_PATH = (() => {
        if (!process.env.PRIVATE_KEY_PATH) {
          throw new Error('PRIVATE_KEY_PATH environment variable is not set.');
        }
        return process.env.PRIVATE_KEY_PATH;
    })();

    private loadKey(keyPath: string): string {
    const fullPath = resolve(keyPath);
        return readFileSync(fullPath, 'utf8');
    }

    generateToken(): string {
        const ALGORITHM = "RS256";
        const PRIVATE_KEY = this.loadKey(this.PRIVATE_KEY_PATH);

        const buffer = Buffer.alloc(32);
        buffer.fill(randomBytes(24), 0, 24);
        const nowEpochSeconds = Math.floor(new Date().getTime() / 1000);
        buffer.writeBigInt64BE(BigInt(nowEpochSeconds), 24);
        const nonce = buffer;

        const timestamp = Math.floor(new Date().getTime() / 1000);
        const expireAt = timestamp + 30;

        const payload = {
            aud: this.ORGANIZATION_ID,
            apiKey: this.API_KEY,
            nonce: nonce.toString('hex'),
            iat: timestamp,
            exp: expireAt,
        };

        const base64UrlEncode = (str: string) =>
            Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

        const toBeSigned = `${base64UrlEncode(JSON.stringify({ alg: ALGORITHM, typ: "JWT" }))}.${base64UrlEncode(
            JSON.stringify(payload)
        )}`;

        const signature = createSign('RSA-SHA256').update(toBeSigned).sign(PRIVATE_KEY, 'base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        return `${toBeSigned}.${signature}`;
    }
}

