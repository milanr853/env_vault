import {
    FaReact,
    FaAngular,
    FaPython,
    FaJsSquare,
    FaNodeJs,
    FaPhp,
    FaRust,
    FaJava,
    FaDocker,
    FaLinux,
    FaGem,
} from 'react-icons/fa'
import {
    SiTypescript,
    SiTailwindcss,
    SiMarkdown,
    SiGo,
    SiRuby,
    SiCplusplus,
    SiYaml,
} from 'react-icons/si'
import { FileText, FileJson } from 'lucide-react'

type Props = {
    path: string
}

export function FileIcon({ path }: Props) {
    const lower = path.toLowerCase()
    const ext = lower.split('.').pop()

    // ---------- SPECIAL FILES ----------
    if (lower.endsWith('dockerfile')) {
        return <FaDocker className="text-blue-500" size={16} />
    }

    if (lower.endsWith('.env')) {
        return <FaLinux className="text-gray-500" size={16} />
    }

    // ---------- MARKDOWN ----------
    if (ext === 'md' || ext === 'markdown') {
        return <SiMarkdown className="text-slate-600" size={16} />
    }

    // ---------- REACT ----------
    if (ext === 'tsx' || ext === 'jsx') {
        return <FaReact className="text-sky-500" size={16} />
    }

    // ---------- ANGULAR ----------
    if (lower.includes('.component.ts')) {
        return <FaAngular className="text-red-600" size={16} />
    }

    // ---------- TAILWIND / CSS ----------
    if (lower.includes('tailwind') || ext === 'css') {
        return <SiTailwindcss className="text-cyan-500" size={16} />
    }

    // ---------- NODE ----------
    if (
        ext === 'js' &&
        (lower.includes('node') ||
            lower.includes('server') ||
            lower.includes('backend'))
    ) {
        return <FaNodeJs className="text-green-600" size={16} />
    }

    // ---------- LANGUAGE ICONS ----------
    switch (ext) {
        case 'ts':
            return <SiTypescript className="text-blue-600" size={16} />

        case 'js':
            return <FaJsSquare className="text-yellow-400" size={16} />

        case 'py':
            return <FaPython className="text-blue-500" size={16} />

        case 'php':
            return <FaPhp className="text-indigo-600" size={16} />

        case 'rs':
            return <FaRust className="text-orange-600" size={16} />

        case 'go':
            return <SiGo className="text-cyan-600" size={16} />

        case 'rb':
            return lower.includes('rails')
                ? <FaGem className="text-red-600" size={16} />
                : <SiRuby className="text-red-500" size={16} />

        case 'java':
            return <FaJava className="text-red-500" size={16} />

        case 'c':
        case 'cpp':
        case 'h':
            return <SiCplusplus className="text-blue-500" size={16} />

        case 'yml':
        case 'yaml':
            return <SiYaml className="text-orange-500" size={16} />

        case 'json':
            return <FileJson size={16} className="text-orange-500" />

        case 'sh':
            return <FaLinux className="text-gray-600" size={16} />

        default:
            return <FileText size={16} className="text-gray-400" />
    }
}
