import { useRef, useState, type ChangeEvent } from 'react'
import type { AppConfig, ConfigPatch } from '../../config/schema'
import { toTimeOfDay } from '../../utils/time'
import { faqTemplate } from '../faq/faqTemplate'
import { newWeeklyFramapadUrl } from '../faq/framapad'
import styles from './ConfigPanel.module.css'
import { downloadConfig, readConfigFile } from './configFile'

interface ConfigActionsProps {
  config: AppConfig
  onChange: (patch: ConfigPatch) => void
  onReplace: (patch: ConfigPatch) => void
  onReset: () => void
}

export function ConfigActions({ config, onChange, onReplace, onReset }: ConfigActionsProps) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState('')

  const importFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const { config: imported, invalid } = await readConfigFile(file)
      onReplace(imported)
      setMessage(invalid.length > 0 ? `Importé. Champs invalides ignorés : ${invalid.join(', ')}` : 'Configuration importée')
    } catch {
      setMessage('Fichier JSON invalide')
    }
  }

  const copyTemplate = async () => {
    const copied = await copyText(faqTemplate(config))
    setMessage(copied ? 'Modèle de FAQ copié : collez-le dans le pad (Ctrl+V)' : 'Copie impossible')
  }

  /**
   * The app cannot write into a pad (Etherpad only accepts edits from its
   * editor or its secret-key API), so the empty FAQ template is put in the
   * clipboard before opening the pad, which is what makes Framapad create it.
   * The copy must happen first: once the new tab has focus, the clipboard is
   * no longer writable from this page.
   */
  const createFramapad = async () => {
    const pad = newWeeklyFramapadUrl()
    onChange({ pad })
    const copied = await copyText(faqTemplate(config))
    window.open(pad, '_blank', 'noopener,noreferrer')
    setMessage(
      copied
        ? 'Pad créé pour une semaine : collez-y le modèle de FAQ (Ctrl+V) à la place du texte d’accueil'
        : 'Pad créé pour une semaine, mais le modèle n’a pas pu être copié : utilisez « Copier le modèle FAQ »',
    )
  }

  const copyLink = async () => {
    setMessage((await copyText(window.location.href)) ? 'Lien copié' : 'Copie impossible')
  }

  return (
    <div className={styles.actions}>
      <div className={styles.buttons}>
        <button type="button" data-primary onClick={() => onChange({ start: toTimeOfDay(new Date()) })}>
          Démarrer maintenant
        </button>
        <button type="button" onClick={() => onChange({ start: '' })} disabled={!config.start}>
          Arrêter
        </button>
      </div>
      <div className={styles.buttons}>
        <button type="button" onClick={() => downloadConfig(config)}>
          Exporter JSON
        </button>
        <button type="button" onClick={() => fileInput.current?.click()}>
          Importer JSON
        </button>
        <button type="button" onClick={createFramapad}>
          Nouveau Framapad (1 semaine)
        </button>
        <button type="button" onClick={copyTemplate}>
          Copier le modèle FAQ
        </button>
        <button type="button" onClick={copyLink}>
          Copier le lien
        </button>
        <button type="button" onClick={onReset}>
          Réinitialiser
        </button>
      </div>
      <input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={importFile} />
      {message && (
        <p className={styles.message} role="status">
          {message}
        </p>
      )}
    </div>
  )
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
