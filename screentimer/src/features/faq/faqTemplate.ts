import type { AppConfig } from '../../config/schema'

/**
 * Starting content for a new pad: an empty `faq` list, plus a help text and an
 * example that the parser ignores (JSON has no comments).
 */
export function faqTemplate({ course, room }: Pick<AppConfig, 'course' | 'room'>): string {
  const exam = [course, room && `salle ${room}`].filter(Boolean).join(' – ')
  const document = {
    ...(exam && { examen: exam }),
    aide: 'Ajoutez une entrée par question dans la liste « faq », séparées par des virgules. « reponse » est facultatif. Pour aller à la ligne dans un texte, écrivez un antislash suivi de n. Seule la liste « faq » est affichée.',
    exemple: { question: 'La calculatrice est-elle autorisée ?', reponse: 'Non, aucun appareil électronique.' },
    faq: [],
  }
  return `${JSON.stringify(document, null, 2)}\n`
}
