export default function FormattedDate({ date }) {
  const months = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];

  const [year, month] = date.split("-"); // séparer l'année et le mois
  const monthName = months[parseInt(month, 10) - 1]; // obtenir le nom du mois

  return <span>{`${monthName} ${year}`}</span>;
}
