// Extraction de l'_id pour le stocker dans la variable productId
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("_id");

// URL de l'API qu'on utilise
const PRODUCTS_API_URL = "http://localhost:3000/api/products";

// Fonction pour obtenir la liste de tous les produits
async function fetchProducts() {
  try {
    const res = await fetch(PRODUCTS_API_URL);
    const products = await res.json();
    return products;
  } catch (error) {
    console.error("Erreur lors du chargement des produits", error);
    return [];
  }
}

// Fonction pour obtenir les détails d'un produit spécifique par son ID
async function fetchProductDetails(productId) {
  try {
    const res = await fetch(`${PRODUCTS_API_URL}?_id=${productId}`);
    const product = await res.json();
    return product.length > 0 ? product[0] : null;
  } catch (error) {
    console.error("Erreur lors du chargement des détails du produit", error);
    return null;
  }
}

// Fonction pour afficher les détails du produit sur la page
function displayProductDetails(product) {
  const descriptionElement = document.getElementById("description");
  const titleElement = document.getElementById("title");
  const priceElement = document.getElementById("price");

  if (product && typeof product === "object") {
    const { description, name, price } = product;

    description
      ? (descriptionElement.innerText = description)
      : (descriptionElement.innerText = "Aucune description pour ce produit.");

    name
      ? (titleElement.innerText = name)
      : (titleElement.innerText = "Nom du produit non trouvé.");

    typeof price === "number"
      ? (priceElement.innerText = price)
      : (priceElement.innerText = "Prix non disponible.");
  } else {
    descriptionElement.innerText = "Aucune description pour ce produit.";
    titleElement.innerText = "Nom du produit non trouvé.";
    priceElement.innerText = "Prix non disponible.";
  }
}

// Fonction pour afficher les options des couleurs du produit
function displayColorOptions(product, showDefaultOption = true) {
  const colorSelectElement = document.getElementById("colors");
  colorSelectElement.innerHTML = "";

  if (showDefaultOption) {
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "--SVP, choisissez une couleur --";
    colorSelectElement.appendChild(defaultOption);
  }

  if (product && product.colors && product.colors.length > 0) {
    product.colors.forEach((color) => {
      const option = document.createElement("option");
      option.value = color;
      option.textContent = color;
      colorSelectElement.appendChild(option);
    });
  }
}

//* Fonction pour mettre à jour la quantité du produit dans le localStorage
function updateQuantity(product, newQuantity) {
  const cartItems = getCartItemsFromLocalStorage();

  const existingCartItemIndex = cartItems.findIndex(
    (item) =>
      item.productId === product._id &&
      item.color === product.colors[0] &&
      item.productName === product.name &&
      item.price === product.price
  );

  if (existingCartItemIndex !== -1) {
    cartItems[existingCartItemIndex].quantity = newQuantity;
  } else {
    cartItems.push({
      productId: product._id,
      productName: product.name,
      quantity: newQuantity,
      color: product.colors[0],
      price: product.price * newQuantity,
    });
  }

  saveCartItemsToLocalStorage(cartItems);
}

//* Fonction pour ajouter un produit au panier
function addToCart(product) {
  const cartItems = getCartItemsFromLocalStorage();

  const existingCartItem = cartItems.find(
    (item) =>
      item.productId === product._id &&
      item.color === product.colors[0] &&
      item.productName === product.name
  );

  if (existingCartItem) {
    return null;
  } else {
    cartItems.push({
      productId: product._id,
      productName: product.name,
      quantity: 1,
      color: product.colors[0],
    });
  }

  saveCartItemsToLocalStorage(cartItems);
}

// Déclaration de la fonction getCartItemsFromLocalStorage dans le scope global grâce à l'objet window
window.getCartItemsFromLocalStorage = function () {
  const cartItemsJSON = localStorage.getItem("cartItems");
  return cartItemsJSON ? JSON.parse(cartItemsJSON) : [];
};

// Fonction pour enregistrer les éléments du panier dans le localStorage
function saveCartItemsToLocalStorage(cartItems) {
  localStorage.setItem("cartItems", JSON.stringify(cartItems));
}

async function getDetails() {
  // Obtient la liste des produits du serveur
  const products = await fetchProducts();

  // Affiche les détails spécifiques du produit sur la page
  const product = products.find((p) => p._id === productId);
  displayProductDetails(product);

  // Affiche les options de couleur du produit
  displayColorOptions(product);

  // Récupère l'élément input de "quantity"
  const quantityInput = document.getElementById("quantity");
  let selectedColor = null;

  // Met à jour les couleurs du produit en fonction de la sélection de l'utilisateur.
  const colorSelectElement = document.getElementById("colors");
  colorSelectElement.addEventListener("change", (event) => {
    selectedColor = event.target.value;
    if (selectedColor) {
      const index = product.colors.indexOf(selectedColor);
      if (index === -1) {
        product.colors.push(selectedColor);
      } else {
        product.colors.splice(index, 1);
        product.colors.unshift(selectedColor);
      }

      displayColorOptions(product, false);
      quantityInput.removeAttribute("disabled");
    }
  });

  // Ajoute le produit au panier en fonction des choix de couleur et de quantité de l'utilisateur
  const addToCartButton = document.getElementById("addToCart");
  addToCartButton.addEventListener("click", () => {
    if (selectedColor) {
      const newQuantity = parseInt(quantityInput.value, 10);
      if (!isNaN(newQuantity) && newQuantity >= 1 && newQuantity <= 100) {
        updateQuantity(product, newQuantity);
        addToCart(product);
        alert("Le produit a été ajouté au panier.");

        window.location.href = `product.html?_id=${productId}`;
      } else {
        alert("Veuillez sélectionner une quantité valide entre 1 et 100.");
      }
    } else {
      alert("Veuillez d'abord sélectionner une couleur.");
    }
  });
}

getDetails();
