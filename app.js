// 1. Каталог товаров
const PRODUCTS = [
    { id: 1, title: 'Сплит-система Centek CT-65A09', price: 19990, category: 'mixes', img: 'https://placehold.co|200?text=Centek+CT-65A09' },
    { id: 2, title: 'Инверторный кондиционер Haier', price: 32500, category: 'mixes', img: 'https://placehold.cox200?text=Haier+Inverter' },
    { id: 3, title: 'Морозильный ларь Бирюса 100L', price: 14200, category: 'bricks', img: 'https://placehold.cox200?text=Biryusa+100L' },
    { id: 4, title: 'Морозильная камера Atlant', price: 24800, category: 'bricks', img: 'https://placehold.cox200?text=Atlant+Freezer' },
    { id: 5, title: 'Шланг поливочный армированный 20м', price: 1250, category: 'roof', img: 'https://placehold.cox200?text=Garden+Hose' },
    { id: 6, title: 'Газонокосилка электрическая 1300W', price: 8900, category: 'roof', img: 'https://placehold.cox200?text=Mower+1300W' },
    { id: 7, title: 'Набор инструментов SATA 86 пред.', price: 5400, category: 'tools', img: 'https://placehold.cox200?text=SATA+Tools' },
    { id: 8, title: 'Перфоратор Makita HR2470', price: 11900, category: 'tools', img: 'https://placehold.cox200?text=Makita+HR2470' }
];

let cart = [];

// DOM Элементы
const productsContainer = document.getElementById('productsContainer');
const categoryFilters = document.getElementById('categoryFilters');
const cartBadge = document.getElementById('cartBadge');
const cartModal = document.getElementById('cartModal');
const openCartBtn = document.getElementById('openCartBtn');
const closeCartBtn = document.getElementById('closeCartBtn');

const steps = {
    1: document.getElementById('step-1'),
    2: document.getElementById('step-2'),
    3: document.getElementById('step-3'),
    4: document.getElementById('step-4')
};

const cartItemsList = document.getElementById('cartItemsList');
const cartTotalPrice = document.getElementById('cartTotalPrice');
const totalSummaries = document.querySelectorAll('.total-summary');
const deliveryOptions = document.getElementsByName('delivery');
const deliveryAddressBlock = document.getElementById('deliveryAddressBlock');
const orderTextResult = document.getElementById('orderTextResult');

// Инициализация
function init() {
    render( 'all' );
    categoryFilters.addEventListener('click', (e) => {
        const btn = e.target.closest('.cat-btn');
        if (!btn) return;
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        render(btn.dataset.category);
    });
}

function render(filter) {
    productsContainer.innerHTML = '';
    const list = filter === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);
    
    list.forEach(p => {
        const el = document.createElement('div');
        el.className = 'product-card';
        el.innerHTML = `
            <img src="${p.img}" alt="${p.title}">
            <h3>${p.title}</h3>
            <div class="price">${p.price.toLocaleString()} ₽</div>
            <button class="btn-primary buy-btn" data-id="${p.id}">В корзину</button>
        `;
        productsContainer.appendChild(el);
    });
}

// Поведение корзины
productsContainer.addEventListener('click', (e) => {
    if (!e.target.classList.contains('buy-btn')) return;
    const id = parseInt(e.target.dataset.id);
    const inCart = cart.find(c => c.id === id);
    if(inCart) inCart.count++; 
    else cart.push({...PRODUCTS.find(p => p.id === id), count: 1});
    updateUI();
});

function updateUI() {
    cartBadge.textContent = cart.reduce((s, i) => s + i.count, 0);
    cartItemsList.innerHTML = '';
    let sum = 0;
    
    cart.forEach(i => {
        sum += i.price * i.count;
        const row = document.createElement('div');
        row.className = 'cart-item';
        row.innerHTML = `
            <div><b>${i.title}</b><br><small>${i.price} ₽</small></div>
            <div>
                <button class="m" data-id="${i.id}">-</button>
                <span style="margin:0 8px">${i.count}</span>
                <button class="p" data-id="${i.id}">+</button>
            </div>
        `;
        cartItemsList.appendChild(row);
    });
    
    if(!cart.length) cartItemsList.innerHTML = '<p style="text-align:center;color:#999">Корзина пуста</p>';
    cartTotalPrice.textContent = sum.toLocaleString();
    totalSummaries.forEach(s => s.textContent = sum.toLocaleString());
}

cartItemsList.addEventListener('click', (e) => {
    const id = parseInt(e.target.dataset.id);
    if(!id) return;
    const item = cart.find(c => c.id === id);
    if (e.target.classList.contains('p')) item.count++;
    if (e.target.classList.contains('m')) {
        item.count--;
        if(item.count <= 0) cart = cart.filter(c => c.id !== id);
    }
    updateUI();
});

// Навигация
function go(step) {
    Object.values(steps).forEach(s => s.classList.remove('id-active'));
    steps[step].classList.add('id-active');
}

openCartBtn.addEventListener('click', () => { cartModal.style.display = 'flex'; go(1); });
closeCartBtn.addEventListener('click', () => { cartModal.style.display = 'none'; });

deliveryOptions.forEach(o => o.addEventListener('change', (e) => {
    deliveryAddressBlock.style.display = e.target.value === 'Доставка' ? 'block' : 'none';
}));

document.getElementById('toStep2Btn').addEventListener('click', () => { if(cart.length) go(2); });
document.getElementById('backToStep1').addEventListener('click', () => go(1));
document.getElementById('backToStep2').addEventListener('click', () => go(2));

document.getElementById('toStep3Btn').addEventListener('click', () => {
    const name = document.getElementById('userName').value;
    const phone = document.getElementById('userPhone').value;
    if(!name || !phone) return alert('Заполните поля!');
    
    let t = `📦 ЗАКАЗ:\n👤 ${name}\n📞 ${phone}\n\n🛒 ТОВАРЫ:\n`;
    cart.forEach(c => t += `• ${c.title} x${c.count} (${c.price * c.count} ₽)\n`);
    orderTextResult.value = t;
    go(3);
});

document.getElementById('copyOrderBtn').addEventListener('click', () => {
    orderTextResult.select();
    navigator.clipboard.writeText(orderTextResult.value);
    document.getElementById('copySuccess').style.display = 'block';
});

document.getElementById('finishOrderBtn').addEventListener('click', () => { go(4); cart = []; updateUI(); document.getElementById('orderForm').reset(); });
document.getElementById('closeSuccessBtn').addEventListener('click', () => { cartModal.style.display = 'none'; });

init();
