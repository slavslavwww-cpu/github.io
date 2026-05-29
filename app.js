// 1. Состояние корзины
let cart = [];

// 2. Инициализация при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
    // Восстановление корзины из LocalStorage, если она там была
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (e) {
            cart = [];
        }
    }
    
    // Запуск всех обработчиков событий
    setupCartEvents();
    setupDeliveryToggle();
    updateCartUI();
});

// 3. Функции изменения корзины (добавление, количество, удаление)
function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    updateCartUI();
}

function changeQuantity(name, delta) {
    const item = cart.find(item => item.name === name);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.name !== name);
        }
    }
    updateCartUI();
}

function removeFromCart(name) {
    cart = cart.filter(item => item.name !== name);
    updateCartUI();
}

// 4. Обновление интерфейса корзины
function updateCartUI() {
    // Сохраняем актуальное состояние в память браузера
    localStorage.setItem("cart", JSON.stringify(cart));

    const cartItemsContainer = document.getElementById("cartItems");
    if (!cartItemsContainer) return; // Защита, если корзина еще не отрендерилась в HTML

    cartItemsContainer.innerHTML = "";
    let totalPrice = 0;

    if (cart.length > 0) {
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            totalPrice += itemTotal;

            const itemRow = document.createElement("div");
            itemRow.className = "cart-item";
            itemRow.innerHTML = `
                <div class="cart-item-info">
                    <span class="cart-item-name">${item.name}</span>
                    <span class="cart-item-price">${item.price} ₽</span>
                </div>
                <div class="cart-item-controls">
                    <button onclick="changeQuantity('${item.name}', -1)">-</button>
                    <span class="cart-item-qty">${item.quantity}</span>
                    <button onclick="changeQuantity('${item.name}', 1)">+</button>
                    <button class="delete-btn" onclick="removeFromCart('${item.name}')">🗑️</button>
                </div>
            `;
            cartItemsContainer.appendChild(itemRow);
        });
    } else {
        cartItemsContainer.innerHTML = "<p style='color:#999;text-align:center;'>Ваша корзина пуста</p>";
    }

    const totalPriceEl = document.getElementById("cartTotalPrice");
    if (totalPriceEl) totalPriceEl.textContent = totalPrice;
    
    document.querySelectorAll(".total-summary").forEach(el => el.textContent = totalPrice);
}

// 5. Логика модального окна и многошаговой формы оформления
function setupCartEvents() {
    const modal = document.getElementById("cartModal");
    if (!modal) return;
    
    const openBtn = document.getElementById("openCartBtn");
    if (openBtn) openBtn.onclick = () => {
        updateCartUI();
        switchStep(1);
        modal.style.display = "flex";
    };
    
    const closeBtn = document.getElementById("closeCartBtn");
    if (closeBtn) closeBtn.onclick = () => modal.style.display = "none";
    
    const closeSuccessBtn = document.getElementById("closeSuccessBtn");
    if (closeSuccessBtn) closeSuccessBtn.onclick = () => modal.style.display = "none";

    // Переходы между шагами
    const toStep2Btn = document.getElementById("toStep2Btn");
    if (toStep2Btn) toStep2Btn.onclick = () => {
        if (cart.length === 0) return alert("Добавьте товары в корзину!");
        switchStep(2);
    };
    
    const backToStep1 = document.getElementById("backToStep1");
    if (backToStep1) backToStep1.onclick = () => switchStep(
