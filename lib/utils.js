import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function formatDate(
  date,
  formatString = "dd MMMM yyyy 'à' HH:mm" // Ajoutons l'heure pour voir le résultat
) {
  // new Date(date) convertit la chaîne ISO (UTC) de la BDD en objet Date local au navigateur
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, formatString, { locale: fr });
}
