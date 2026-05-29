// 1. База данных строительных товаров (заменяет меню бургеров)
const productsData = [
    { id: 1, name: "Цемент холсим М500 ЦЕМ II (50 кг)", price: 540, category: "mixes", img: "https://unsplash.com" },
    { id: 2, name: "Шпатлевка Кнауф Ротбанд Паста (20 кг)", price: 1250, category: "mixes", img: "https://unsplash.com" },
    { id: 3, name: "Кирпич забутовочный М-125 красный", price: 18, category: "bricks", img: "https://unsplash.com" },
    { id: 4, name: "Газоблок ВКБлок 625х300х200 мм", price: 195, category: "bricks", img: "https://unsplash.com" },
    { id: 5, name: "Профнастил С8 оцинкованный (2х1.2 м)", price: 850, category: "roof", img: "https://unsplash.com" },
    { id: 6, name: "Рулетка строительная магнитная 5м", price: 340, category: "tools", img: "https://unsplash.com" }
];

// Состояние приложения (Корзина)
let cart = [];

// Инициализация при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
    renderProducts("all");
    setupCategoryFilters();
    setupCartEvents();
    setupDeliveryToggle();
});

// 2. Вывод карточек товаров в HTML
function renderProducts(categoryFilter) {
    const container = document.getElementById("productsContainer");
    container.innerHTML = "";

    const filtered = categoryFilter === "all" 
        ? productsData 
        : productsData.filter(p => p.category === categoryFilter);

    filtered.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
            <div>
                <img src="${product.img}" alt="${product.name}">
                <div class="product-title">${product.name}</div>
            </div>
            <div class="product-footer">
                <div class="product-price">${product.price} ₽</div>
                <button class="add-to-cart" onclick="interactiveAddToCart(${product.id})">+</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// 3. Логика переключения категорий (Табы меню)
function setupCategoryFilters() {
    const buttons = document.querySelectorAll(".cat-btn");
    buttons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            buttons.forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            const cat = e.target.getAttribute("data-category");
            renderProducts(cat);
        });
    });
}

// 4. Функции управления корзиной
window.interactiveAddToCart = function(id) {
    const product = productsData.find(p => p.id === id);
    const existItem = cart.find(item => item.id === id);

    if (existItem) {
        existItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateCartUI();
};

function changeQuantity(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    
    item.quantity += delta;
    if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== id);
    }
    updateCartUI();
}

function updateCartUI() {
    // Обновление счетчика в шапке
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById("cartBadge").textContent = totalItems;

    // Сборка списка товаров в окне
    const listContainer = document.getElementById("cartItemsList");
    listContainer.innerHTML = "";
    
    let totalPrice = 0;

    cart.forEach(item => {
        totalPrice += item.price * item.quantity;
        const row = document.createElement("div");
        row.className = "cart-item-row";
        row.innerHTML = `
            <span>${item.name}</span>
            <div class="item-controls">
                <button onclick="changeQuantity(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="changeQuantity(${item.id}, 1)">+</button>
                <span>${item.price * item.quantity} ₽</span>
            </div>
        `;
        listContainer.appendChild(row);
    });

    if(cart.length === 0) {
        listContainer.innerHTML = "<p style='color:#999;text-align:center;'>Ваша корзина пуста</p>";
    }

    document.getElementById("cartTotalPrice").textContent = totalPrice;
    document.querySelectorAll(".total-summary").forEach(el => el.textContent = totalPrice);
}

// 5. Логика модального окна и многошаговой формы оформления
function setupCartEvents() {
    const modal = document.getElementById("cartModal");
    
    document.getElementById("openCartBtn").onclick = () => {
        updateCartUI();
        switchStep(1);
        modal.style.display = "flex";
    };
    
    document.getElementById("closeCartBtn").onclick = () => modal.style.display = "none";
    document.getElementById("closeSuccessBtn").onclick = () => modal.style.display = "none";

    // Переходы между шагами
    document.getElementById("toStep2Btn").onclick = () => {
        if (cart.length === 0) return alert("Добавьте товары в корзину!");
        switchStep(2);
    };
    
    document.getElementById("backToStep1").onclick = () => switchStep(1);
    
    document.getElementById("toStep3Btn").onclick = () => {
        const name = document.getElementById("userName").value.trim();
        const phone = document.getElementById("userPhone").value.trim();
        if (!name || !phone) return alert("Пожалуйста, заполните Имя и Телефон!");
        
        generateOrderSummary();
        switchStep(3);
    };

    document.getElementById("backToStep2").onclick = () => switchStep(2);
    
    document.getElementById("finishOrderBtn").onclick = () => {
        // Финал
        cart = [];
        updateCartUI();
        document.getElementById("orderForm").reset();
        switchStep(4);
    };

    // Копирование в буфер обмена (как в RuRuBurger)
    document.getElementById("copyOrderBtn").onclick = () => {
        const textarea = document.getElementById("orderTextResult");
        textarea.select();
        document.execCommand("copy");
        
        const successMsg = document.getElementById("copySuccess");
        successMsg.style.display = "block";
        setTimeout(() => successMsg.style.display = "none", 2500);
    };
}

function switchStep(stepNumber) {
    document.querySelectorAll(".modal-step").forEach(step => step.classList.remove("id-active"));
    document.getElementById(`step-${stepNumber}`).classList.add("id-active");
}

// Переключение отображения поля адреса
function setupDeliveryToggle() {
    const radios = document.querySelectorAll('input[name="delivery"]');
    radios.forEach(radio => {
        radio.addEventListener("change", (e) => {
            const block = document.getElementById("deliveryAddressBlock");
            block.style.display = e.target.value === "Доставка" ? "block" : "none";
        });
    });
}

// 6. Генерация текстового отчета по заказу (полная копия механики RuRuBurger)
function generateOrderSummary() {
    const name = document.getElementById("userName").value;
    const phone = document.getElementById("userPhone").value;
    const delivery = document.querySelector('input[name="delivery"]:checked').value;
    const address = document.getElementById("userAddress").value;

    let text = `📦 ЗАКАЗ: СТРОЙ ДОМ\n`;
    text += `👤 Клиент: ${name}\n`;
    text += `📞 Телефон: ${phone}\n`;
    text += `🚚 Получение: ${delivery}\n`;
    if (delivery === "Доставка" && address) {
        text += `🏠 Адрес: ${address}\n`;
    }
    text += `-------------------------\n`;
    
    let total = 0;
    cart.forEach(item => {
        text += `▪️ ${item.name} (x${item.quantity}) — ${item.price * item.quantity} ₽\n`;
        total += item.price * item.quantity;
    });
    
    text += `-------------------------\n`;
    text += `💰 ИТОГО К ОПЛАТЕ: ${total} ₽`;

    document.getElementById("orderTextResult").value = text;
}
