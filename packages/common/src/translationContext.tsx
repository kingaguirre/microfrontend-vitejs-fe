// packages/common/src/translationContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback
} from 'react'
import { useLocation } from 'react-router-dom'

type Dict = Record<string, string>

interface TranslationContextValue {
  t: (key: string) => string
  lang: string
  setLang: (lang: string) => Promise<void>
  translations: Record<string, string>
}

const TranslationContext = createContext<TranslationContextValue>({
  t: (k) => k,
  lang: 'en',
  setLang: async () => {},
  translations: {}
})

// 🔥 One-time glob at module scope
const allModules = import.meta.glob<Record<string, any>>('../../*/src/language/*.json', {
  eager: false
})

/** Recursively flatten a JSON object into [ "a.b.c", "value" ] pairs */
function deepFlatten(obj: any, prefix = ''): [string, string][] {
  let out: [string, string][] = []
  for (const [key, val] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      // recurse into objects
      out = out.concat(deepFlatten(val, path))
    } else {
      // leave primitives (string, number, etc.)
      out.push([path, String(val)])
    }
  }
  return out
}

export const TranslationProvider = ({ children }: { children: ReactNode }) => {
  const { search } = useLocation()
  const initial = new URLSearchParams(search).get('lang') || 'en'

  const [lang, _setLang] = useState(initial)
  const [dict, setDict] = useState<Dict>({})

  const loadLanguage = useCallback(async (newLang: string) => {
    const batches = await Promise.all(
      Object.entries(allModules)
        .filter(([path]) => path.endsWith(`/${newLang}.json`))
        .map(async ([path, loader]) => {
          const mod = await loader()
          const json = (mod as any).default ?? mod

          // derive pkgName
          const pkgMatch = path.match(/packages\/([^/]+)\/src\//)
          const pkgName = pkgMatch
            ? pkgMatch[1]
            : path.split('/').filter((p) => p !== '..' && p !== '.')[0]

          // deep flatten then namespace
          return deepFlatten(json).map(([k, v]) => [`${pkgName}.${k}`, v] as [string, string])
        })
    )

    setDict(Object.fromEntries(batches.flat()))
    _setLang(newLang)
  }, [])

  useEffect(() => {
    loadLanguage(initial)
  }, [initial, loadLanguage])

  useEffect(() => {
    const q = new URLSearchParams(search).get('lang') || 'en'
    if (q !== lang) {
      loadLanguage(q)
    }
  }, [search, lang, loadLanguage])

  const t = (fullKey: string) => dict[fullKey] ?? fullKey

  return (
    <TranslationContext.Provider value={{ t, lang, setLang: loadLanguage, translations: dict }}>
      {children}
    </TranslationContext.Provider>
  )
}

export const useTranslate = (ns?: string) => {
  const { t: rawT, lang, setLang, translations } = useContext(TranslationContext)
  const t = useCallback((key: string) => (ns ? rawT(`${ns}.${key}`) : rawT(key)), [ns, rawT])

  // if namespace, strip it off for keys
  const slice = ns
    ? Object.fromEntries(
        Object.entries(translations)
          .filter(([k]) => k.startsWith(`${ns}.`))
          .map(([k, v]) => [k.slice(ns.length + 1), v])
      )
    : { ...translations }

  return { t, lang, setLang, translations: slice }
}
