alert('Не удалось связаться с Telegram.');
        switchStep(4);
    })
    .finally(() => {
        finishBtn.disabled = false;
        finishBtn.textContent = "Завершить заказ";
    });
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
