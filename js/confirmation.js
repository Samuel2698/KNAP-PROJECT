// Récupère l'id de la commande
function getOrderIdFromURL() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get("_id");
}

// Affiche le numéro de la commande
function displayOrderNumber() {
  const orderIdElement = document.getElementById("orderId");
  const orderId = getOrderIdFromURL();

  if (orderId) {
    orderIdElement.innerText = orderId;
  } else {
    orderIdElement.innerText = "Numéro de commande non disponible";
  }
}

// Appele la fonction pour afficher le numéro de la commande lors du chargement de la page
document.addEventListener("DOMContentLoaded", displayOrderNumber);
