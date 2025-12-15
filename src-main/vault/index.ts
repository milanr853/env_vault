import sodium from "libsodium-wrappers-sumo"
import argon2 from "argon2"
import { readFileSync, writeFileSync, renameSync } from "fs"
import { Buffer } from "buffer"

/**
 * Ensure libsodium is fully initialized.
 * Required because CommonJS does NOT allow top-level await.
 */
let sodiumReady: Promise<void> | null = null

async function ensureSodiumReady(): Promise<void> {
    if (!sodiumReady) {
        sodiumReady = sodium.ready
    }
    await sodiumReady
}

/**
 * Create a new encrypted vault file
 */
export async function createVault(
    plaintextJson: object,
    password: string,
    outPath: string
): Promise<void> {
    await ensureSodiumReady()

    // Generate salt for Argon2
    const salt = Buffer.from(sodium.randombytes_buf(16))

    // Derive key using Argon2id
    const key = await argon2.hash(Buffer.from(password), {
        raw: true,
        type: argon2.argon2id,
        salt
    })

    // Generate nonce for XChaCha20-Poly1305
    const nonce = sodium.randombytes_buf(
        sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES
    )

    const plaintext = Buffer.from(JSON.stringify(plaintextJson), "utf8")

    // Encrypt
    const cipher = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
        plaintext,
        null, // additional data (none)
        null, // secret nonce (not used)
        nonce,
        key
    )

    const payload = {
        version: 1,
        kdf: {
            algo: "argon2id",
            salt: Buffer.from(salt).toString("base64")
        },
        aead: {
            algo: "xchacha20poly1305",
            nonce: Buffer.from(nonce).toString("base64")
        },
        ciphertext: Buffer.from(cipher).toString("base64")
    }

    // Atomic write
    writeFileSync(outPath + ".tmp", JSON.stringify(payload, null, 2), {
        encoding: "utf8",
        mode: 0o600
    })
    renameSync(outPath + ".tmp", outPath)
}

/**
 * Decrypt an existing vault file
 */
export async function decryptVault(
    vaultPath: string,
    password: string
): Promise<any> {
    await ensureSodiumReady()

    const raw = JSON.parse(readFileSync(vaultPath, "utf8"))

    const salt = Buffer.from(raw.kdf.salt, "base64")

    const key = await argon2.hash(Buffer.from(password), {
        raw: true,
        type: argon2.argon2id,
        salt
    })

    const nonce = Buffer.from(raw.aead.nonce, "base64")
    const cipher = Buffer.from(raw.ciphertext, "base64")

    const plaintext = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
        null,
        cipher,
        null,
        nonce,
        key
    )

    return JSON.parse(Buffer.from(plaintext).toString("utf8"))
}
