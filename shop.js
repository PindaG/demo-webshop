const PRODUCTS = {
  apple: { name: "Apple", emoji: "🍏" },
  banana: { name: "Banana", emoji: "🍌" },
  lemon: { name: "Lemon", emoji: "🍋" },
};

function getBasket() {
  try {
    const basket = localStorage.getItem("basket");
    if (!basket) return [];
    const parsed = JSON.parse(basket);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Error parsing basket from localStorage:", error);
    return [];
  }
}

function addToBasket(product) {
  const basket = getBasket();
  basket.push(product);
  localStorage.setItem("basket", JSON.stringify(basket));
}

function clearBasket() {
  localStorage.removeItem("basket");
}

function renderBasket() {
  const basket = getBasket();
  const basketList = document.getElementById("basketList");
  const cartButtonsRow = document.querySelector(".cart-buttons-row");
  if (!basketList) return;
  basketList.innerHTML = "";
  if (basket.length === 0) {
    basketList.innerHTML = "<li>No products in basket.</li>";
    if (cartButtonsRow) cartButtonsRow.style.display = "none";
    return;
  }
  // Group identical items into line items with a quantity
  const counts = basket.reduce((acc, p) => {
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {});

  Object.keys(counts).forEach((product) => {
    const item = PRODUCTS[product];
    if (!item) return;
    const li = document.createElement("li");
    li.className = "basket-lineitem";
    li.innerHTML = `
      <span class='basket-emoji'>${item.emoji}</span>
      <span class='product-name'>${item.name}</span>
      <div class='quantity-controls' aria-label='Quantity controls for ${item.name}'>
        <button class='qty-decrease' data-product='${product}' aria-label='Decrease quantity'>-</button>
        <span class='qty' aria-live='polite'>${counts[product]}</span>
        <button class='qty-increase' data-product='${product}' aria-label='Increase quantity'>+</button>
      </div>
    `;
    // Attach event listeners for buttons
    li.querySelector('.qty-increase').addEventListener('click', function () {
      changeQuantity(product, 1);
    });
    li.querySelector('.qty-decrease').addEventListener('click', function () {
      changeQuantity(product, -1);
    });
    basketList.appendChild(li);
  });
  if (cartButtonsRow) cartButtonsRow.style.display = "flex";
}

// Change quantity by adding or removing single occurrences of product
function changeQuantity(product, delta) {
  const basket = getBasket();
  if (delta > 0) {
    // add one instance
    basket.push(product);
  } else if (delta < 0) {
    // remove one instance (first found)
    const idx = basket.indexOf(product);
    if (idx > -1) basket.splice(idx, 1);
  }
  localStorage.setItem('basket', JSON.stringify(basket));
  // Re-render basket and indicator
  renderBasket();
  renderBasketIndicator();
}

function renderBasketIndicator() {
  const basket = getBasket();
  let indicator = document.querySelector(".basket-indicator");
  if (!indicator) {
    const basketLink = document.querySelector(".basket-link");
    if (!basketLink) return;
    indicator = document.createElement("span");
    indicator.className = "basket-indicator";
    basketLink.appendChild(indicator);
  }
  if (basket.length > 0) {
    indicator.textContent = basket.length;
    indicator.style.display = "flex";
  } else {
    indicator.style.display = "none";
  }
}

// Call this on page load and after basket changes
if (document.readyState !== "loading") {
  renderBasketIndicator();
} else {
  document.addEventListener("DOMContentLoaded", renderBasketIndicator);
}

// Patch basket functions to update indicator
const origAddToBasket = window.addToBasket;
window.addToBasket = function (product) {
  origAddToBasket(product);
  renderBasketIndicator();
};
const origClearBasket = window.clearBasket;
window.clearBasket = function () {
  origClearBasket();
  renderBasketIndicator();
};
