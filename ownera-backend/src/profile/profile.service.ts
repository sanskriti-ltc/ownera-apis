import { Injectable } from '@nestjs/common';
import { Sdk } from "@owneraio/finp2p-sdk-js";
import { publicKeyCreate, privateKeyVerify, sign } from 'secp256k1';
import { randomBytes } from 'crypto';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

@Injectable()
export class ProfileService {
    private sdk: Sdk;
    private readonly API_ENDPOINT = process.env.API_ENDPOINT;
    private readonly ORGANIZATION_ID = process.env.ORGANIZATION_ID;

    constructor() {
        this.sdk = new Sdk({ orgId: this.ORGANIZATION_ID, owneraAPIAddress: this.API_ENDPOINT });
    }

    createCrypto() {
        let privKey;
        do {
            privKey = randomBytes(32);
        } while (!privateKeyVerify(privKey));

        const pubKey = publicKeyCreate(privKey, true);
        return { private: privKey, public: pubKey };
    }

    signingMethod(privateKey: Buffer) {
        return (hash: string) => Promise.resolve(
            sign(Buffer.from(hash, 'hex'), privateKey)
        );
    }

    async createUser() {
        const { private: privateKey, public: publicKey } = this.createCrypto();

        const user = await this.sdk.createUser({
            withSignatureProvider: {
                publicKey: publicKey.toString('hex'),
                signingMethod: this.signingMethod(privateKey),
            },
        });
        return user;
    }

    async getUser(userId: string) {
        const user = await this.sdk.getUser({ userId });
        return user;
    }
}
