// URL de l'API qu'on utilise
const PRODUCTS_API_URL = "http://localhost:3000/api/products";

// Obtient la liste des produits
async function productsFromApi() {
  const res = await fetch(PRODUCTS_API_URL);
  const products = await res.json();
  return products;
}

// Obtient la liste des produits et les afficher sur la page
async function fetchProducts() {
  try {
    const products = await productsFromApi();
    displayProducts(products);
  } catch (error) {
    console.error("Erreur lors de l'obtention de la liste de produits", error);
  }
}

// Affiche la liste des produits sur la page
function displayProducts(products) {
  const articleElement = document.querySelector(".items");

  products.forEach((product) => {
    const pieceElement = createProductElement(product);

    pieceElement.addEventListener("click", () => {
      navigateToProductDetailPage(product._id);
    });

    articleElement.appendChild(pieceElement);
  });
}

// Crée l'item d'un produit dans la liste
function createProductElement(product) {
  const pieceElement = document.createElement("article");
  pieceElement.dataset.id = product._id;

  const imageElement = document.createElement("img");
  imageElement.src = product.imageUrl;

  const nameElement = document.createElement("h3");
  nameElement.innerText = product.name;

  const descriptionElement = document.createElement("p");
  descriptionElement.innerText = product.description;

  pieceElement.appendChild(imageElement);
  pieceElement.appendChild(nameElement);
  pieceElement.appendChild(descriptionElement);

  return pieceElement;
}

// Navigue vers la page 'product'
function navigateToProductDetailPage(productId) {
  window.location.href = `product.html?_id=${productId}`;
}

fetchProducts();
