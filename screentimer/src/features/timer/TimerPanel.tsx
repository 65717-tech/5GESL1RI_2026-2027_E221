import type { AppConfig } from '../../config/schema'
import { useNow } from '../../hooks/useNow'
import { formatClock, formatDuration } from '../../utils/time'
import { computeTimer, type TimerState } from './computeTimer'
import styles from './TimerPanel.module.css'

export function TimerPanel({ config }: { config: AppConfig }) {
  const now = useNow()
  const timer = computeTimer(config, now)
  const canLeave = timer.leaveAt !== null && now >= timer.leaveAt

  return (
    <section className={styles.panel} data-status={timer.status}>
      <header className={styles.heading}>
        <h1 className={styles.course}>{config.course || (config.mode === 'break' ? 'Pause' : 'Examen')}</h1>
        {config.room && <p className={styles.room}>Salle {config.room}</p>}
      </header>

      <p className={styles.countdown} role="timer" aria-live="off">
        {formatDuration(timer.remainingMs)}
      </p>

      <StatusLine timer={timer} />

      <ul className={styles.meta}>
        {timer.endsAt && (
          <li>
            {config.mode === 'break' ? 'Reprise' : 'Fin'} à {formatClock(timer.endsAt)}
          </li>
        )}
        {config.mode === 'exam' && timer.leaveAt && (
          <li className={styles.leave} data-allowed={canLeave}>
            {canLeave ? 'Sortie autorisée' : `Sortie autorisée à partir de ${formatClock(timer.leaveAt)}`}
          </li>
        )}
      </ul>
    </section>
  )
}

function statusLabel({ status, startsAt }: TimerState): string | null {
  switch (status) {
    case 'idle':
      return 'En attente du début'
    case 'scheduled':
      return startsAt && `Début à ${formatClock(startsAt)}`
    case 'warning':
      return 'Dernières minutes'
    case 'finished':
      return 'Temps écoulé'
    default:
      return null
  }
}

function StatusLine({ timer }: { timer: TimerState }) {
  const label = statusLabel(timer)
  return label && <p className={styles.status}>{label}</p>
}
