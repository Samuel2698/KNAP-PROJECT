// URL de l'API qu'on utilise pour la rêquete POST
const PRODUCTS_ORDER_API_URL = "http://localhost:3000/api/products/order";

// Affiche le tableau des achats dans la page
function displayCartItems() {
  const cartItems = window.getCartItemsFromLocalStorage();
  const cartItemsSection = document.getElementById("cart__items");

  // Objet pour stocker les produits en les regroupant par ID + couleur
  const groupedProducts = {};

  //* Regroupe les produits par ID + couleur pour éviter les duplications
  cartItems.forEach((item) => {
    const key = `${item.productId}_${item.color}`;
    if (groupedProducts[key]) {
      groupedProducts[key].quantity += item.quantity;
    } else {
      groupedProducts[key] = { ...item };
    }
  });

  // Supprime le contenu existant de la section pour éviter les duplications
  cartItemsSection.innerHTML = "";

  // Parcours l'objet regroupé et affiche chaque produit dans le panier
  for (const key in groupedProducts) {
    const product = groupedProducts[key];
    const cartItemElement = createCartItemElement(product);
    cartItemsSection.appendChild(cartItemElement);
  }

  // Calcule le prix total du panier
  let totalPrice = 0;
  for (const key in groupedProducts) {
    const product = groupedProducts[key];
    totalPrice += product.price * product.quantity;
  }

  // Met à jour le contenu de l'élément HTML pour afficher le résultat
  const totalQuantityElement = document.getElementById("totalQuantity");
  const totalPriceElement = document.getElementById("totalPrice");
  totalQuantityElement.innerText = cartItems.length;
  totalPriceElement.innerText = totalPrice.toFixed(2);
}

displayCartItems();

// Crée les éléments HTML du tableau des achats
function createCartItemElement(item) {
  const cartItemElement = document.createElement("article");
  cartItemElement.classList.add("cart__item");
  cartItemElement.setAttribute("data-id", item.productId);
  cartItemElement.setAttribute("data-color", item.color);

  const contentDiv = document.createElement("div");
  contentDiv.classList.add("cart__item__content");

  const descriptionDiv = document.createElement("div");
  descriptionDiv.classList.add("cart__item__content__description");
  const productName = document.createElement("p");
  productName.innerText = item.productName;
  const productColor = document.createElement("p");
  productColor.innerText = `Couleur: ${item.color}`;
  const productPrice = document.createElement("p");
  productColor.innerText = `Prix: ${item.price}€`;
  descriptionDiv.appendChild(productName);
  descriptionDiv.appendChild(productColor);
  descriptionDiv.appendChild(productPrice);

  const quantityDiv = document.createElement("div");
  quantityDiv.classList.add("cart__item__content__settings__quantity");
  const quantityLabel = document.createElement("p");
  quantityLabel.innerText = "Qté: ";
  const quantityInput = document.createElement("input");
  quantityInput.classList.add("itemQuantity");
  quantityInput.type = "number";
  quantityInput.value = item.quantity;
  quantityInput.min = "1";
  const deleteButton = document.createElement("button");
  deleteButton.classList.add("deleteItem");
  deleteButton.innerText = "Supprimer";

  // Écouteur d'événements pour cet "input quantity"
  quantityInput.addEventListener("change", handleQuantityChange);

  // Écouteur d'événements pour ce bouton "Supprimer"
  deleteButton.addEventListener("click", handleDeleteItem);

  // Ajoute les éléments dans l'ordre approprié
  contentDiv.appendChild(descriptionDiv);
  contentDiv.appendChild(quantityDiv);
  cartItemElement.appendChild(contentDiv);
  quantityDiv.appendChild(quantityLabel);
  quantityDiv.appendChild(quantityInput);
  quantityDiv.appendChild(deleteButton);

  return cartItemElement;
}

// Gère la modification de la quantité du produit dans le panier
function handleQuantityChange(event) {
  let newQuantity = parseInt(event.target.value);
  if (isNaN(newQuantity) || newQuantity < 1 || newQuantity > 100) {
    alert("Veuillez entrer une quantité valide entre 1 et 100.");

    // Récupérer la quantité d'origine depuis le local storage
    const cartItem = event.target.closest(".cart__item");
    const productId = cartItem.getAttribute("data-id");
    const color = cartItem.getAttribute("data-color");
    const cartItems = window.getCartItemsFromLocalStorage();
    const originalQuantity = cartItems.find(
      (item) => item.productId === productId && item.color === color
    ).quantity;

    event.target.value = originalQuantity;
    newQuantity = originalQuantity;
  }

  const cartItem = event.target.closest(".cart__item");
  const productId = cartItem.getAttribute("data-id");
  const color = cartItem.getAttribute("data-color");

  const cartItems = window.getCartItemsFromLocalStorage();
  const itemIndex = cartItems.findIndex(
    (item) => item.productId === productId && item.color === color
  );

  if (itemIndex !== -1) {
    cartItems[itemIndex].quantity = newQuantity;
    window.saveCartItemsToLocalStorage(cartItems);
    displayCartItems(); // Met à jour les articles du panier sur la page
  }
}

// Gère la suppression d'un produit du panier
function handleDeleteItem(event) {
  const cartItem = event.target.closest(".cart__item");
  const productId = cartItem.getAttribute("data-id");
  const color = cartItem.getAttribute("data-color");

  const cartItems = window.getCartItemsFromLocalStorage();
  const updatedCartItems = cartItems.filter(
    (item) => !(item.productId === productId && item.color === color)
  );

  window.saveCartItemsToLocalStorage(updatedCartItems);
  displayCartItems();
}

// Envoie le formulaire de commande
function handleOrderSubmit(event) {
  event.preventDefault(); // Pour empêcher le rechargement de la page

  // Récupère les données du formulaire
  const firstName = document.getElementById("firstName").value;
  const lastName = document.getElementById("lastName").value;
  const address = document.getElementById("address").value;
  const city = document.getElementById("city").value;
  const email = document.getElementById("email").value;

  // Valide l'adresse e-mail
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("Veuillez saisir une adresse e-mail valide.");
    return;
  }

  // Crée l'objet contact à partir des données du formulaire
  const contact = {
    firstName,
    lastName,
    address,
    city,
    email,
  };

  // Récupère les produits du panier
  const cartItems = window.getCartItemsFromLocalStorage();

  // Créee le tableau de produits avec les informations requises
  const products = cartItems.map((item) => item.productId);

  // Envoie la commande au serveur
  const orderData = {
    contact,
    products,
  };

  // Effectue une requête POST pour passer la commande
  fetch(PRODUCTS_ORDER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  })
    .then((response) => response.json())
    .then((data) => {
      const orderId = data.orderId;

      alert("Commande passée avec succès !");

      window.saveCartItemsToLocalStorage([]);

      // Navigue vers la page 'confirmation'
      window.location.href = `confirmation.html?_id=${orderId}`;
    })
    .catch((error) => {
      console.error("Erreur lors de l'envoie de la commande :", error);

      alert(
        "Une erreur est survenue lors de l'envoie de la commande. Veuillez réessayer plus tard."
      );
    });
}

// Écoute d'événement pour l'envoie du formulaire de commande
const orderForm = document.querySelector(".cart__order__form");
orderForm.addEventListener("submit", handleOrderSubmit);
