import { spawn } from 'child_process'


export function runWithEnv(cmd: string, args: string[], extraEnv: Record<string, string>) {
    const env = { ...process.env, ...extraEnv }
    const child = spawn(cmd, args, { env, stdio: 'pipe' })
    child.stdout.on('data', d => { /* forward to renderer via ipc */ })
    child.stderr.on('data', d => { /* forward */ })
    child.on('exit', code => { /* notify renderer */ })
    return child.pid
}