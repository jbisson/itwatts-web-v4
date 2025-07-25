function formatDateToYYYYMMDD(date) {
  const year = date.getFullYear();

  // Add leading zeros to month and day if necessary
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed in JavaScript, so add 1
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function shortDate(date) {
  const day = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet',
    'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  return `${day[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export { formatDateToYYYYMMDD, shortDate }