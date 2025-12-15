# 🔐 Env-Vault — Local-First Secrets Manager

Env-Vault is a **local-first, secure secrets manager** built as a **desktop application** using **Electron, React, TypeScript, and cryptographic best practices**.

It allows developers to manage all project environment variables **securely in one encrypted vault**, without ever storing secrets in plaintext on disk.

---

## 🚀 Key Features

- 🔑 **Single Master Password**
  - One strong password encrypts everything.
  - No cloud, no accounts, no servers.

- 🗄️ **Single Encrypted Vault File**
  - All secrets are stored inside one encrypted file (e.g. `my-secrets.vault`).
  - Uses **Argon2id** for key derivation and **XChaCha20-Poly1305** for encryption.

- 📥 **Import `.env` Files**
  - Import existing `.env` files from projects.
  - Secrets are encrypted immediately.
  - Original `.env` files can safely be deleted or added to `.gitignore`.

- 🧠 **Memory-Only Decryption**
  - Secrets are decrypted **only in memory**.
  - Nothing is ever written to disk in plaintext.

- 📋 **Secure Copy**
  - Copy individual secrets to clipboard.
  - Values are never shown directly on screen.

- ▶️ **Secure Environment Injection**
  - Run your projects directly from Env-Vault.
  - Secrets are injected into the child process via `process.env`.
  - No `.env` files needed inside projects.
  - Secrets flow:  
    **Encrypted vault → memory → child process → destroyed on exit**

- 🔒 **Instant Lock**
  - Lock or quit the app to wipe all secrets from memory instantly.

---

## 🧱 Tech Stack

### Desktop Runtime
- **Electron**

### Frontend
- **React**
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **Redux Toolkit**

### Backend (Electron Main Process)
- **Node.js**
- **libsodium (XChaCha20-Poly1305)**
- **Argon2id (password hashing)**
- **child_process** for secure command execution

---

## 🔐 Security Model

- **No cloud sync**
- **No plaintext secrets on disk**
- **No background services**
- **No analytics**
- **No telemetry**

### Cryptography
- **Key Derivation:** Argon2id  
- **Encryption:** XChaCha20-Poly1305 (AEAD)  
- **Salt & Nonce:** Cryptographically secure random values  
- **Atomic Writes:** Vault file is written safely using temp + rename  
- **File Permissions:** `0600` (owner-only)

---

## 📁 Project Structure

```text
env_vault/
├── electron.main.ts        # Electron main process
├── preload.ts              # Secure IPC bridge
├── src/                     # React frontend
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── store/
│   └── components/
├── src-main/                # Node-only logic
│   ├── vault/               # Encryption / decryption
│   └── runner/              # Secure process execution
├── tsconfig.json            # Frontend TS config (Vite)
├── tsconfig.electron.json   # Electron TS config
├── vite.config.ts
├── tailwind.config.js
├── .gitignore
└── README.md
