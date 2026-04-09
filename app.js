/**
 * VPN Store — Mini App Logic
 *
 * Поток:
 *   1. Пользователь нажимает «Купить» → открывается модальное окно.
 *   2. Подтверждает → sendData() отправляет JSON боту.
 *   3. Бот (handlers/webapp.py) создаёт заявку и уведомляет админа.
 */

/* ── Инициализация Telegram WebApp ─────────────────────── */
const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();           // Сообщаем Telegram, что приложение готово
  tg.expand();          // Разворачиваем на всю высоту
  tg.enableClosingConfirmation(); // Предупреждение при случайном закрытии
}

/* ── Состояние ─────────────────────────────────────────── */
let selectedPlan = null;

/* ── Выбор тарифа ──────────────────────────────────────── */
/**
 * Вызывается при нажатии кнопки «Купить» на карточке тарифа.
 *
 * @param {string} planId    - Ключ тарифа (trial | month | two_months)
 * @param {string} planName  - Читаемое название
 * @param {number} days      - Количество дней
 * @param {number} price     - Цена в рублях
 */
function selectPlan(planId, planName, days, price) {
  selectedPlan = { plan_id: planId, plan_name: planName, days, price };
  openModal(planName, days, price);
}

/* ── Модальное окно ────────────────────────────────────── */
function openModal(planName, days, price) {
  const perDay = (price / days).toFixed(1);

  document.getElementById('modal-body').innerHTML = `
    <div>📦 <strong>Тариф:</strong> ${planName}</div>
    <div>📅 <strong>Срок:</strong> ${days} дней</div>
    <div>💰 <strong>Сумма:</strong> ${price} ₽</div>
    <div>📊 <strong>Стоимость в день:</strong> ~${perDay} ₽</div>
  `;

  const modal = document.getElementById('modal');
  modal.classList.remove('hidden');

  // Вешаем обработчик на кнопку подтверждения
  const confirmBtn = document.getElementById('btn-confirm');
  confirmBtn.onclick = confirmOrder;
  confirmBtn.classList.remove('loading');
  confirmBtn.textContent = '✅ Отправить заявку';
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
  selectedPlan = null;
}

// Закрытие по клику на оверлей (вне модального окна)
document.getElementById('modal').addEventListener('click', function (e) {
  if (e.target === this) closeModal();
});

/* ── Подтверждение заказа ──────────────────────────────── */
function confirmOrder() {
  if (!selectedPlan) return;

  const confirmBtn = document.getElementById('btn-confirm');
  confirmBtn.classList.add('loading');
  confirmBtn.textContent = 'Отправляем...';

  const payload = JSON.stringify(selectedPlan);

  if (tg) {
    // Отправляем данные боту — бот получает их в handlers/webapp.py
    tg.sendData(payload);
  } else {
    // Режим разработки: выводим данные в консоль
    console.log('[DEV] Данные для бота:', payload);
    alert('[DEV] Данные отправлены в консоль. В Telegram они уйдут боту.');
    closeModal();
  }
}

/* ── Вспомогательное: подсветка выбранной карточки ─────── */
document.querySelectorAll('.btn-buy').forEach((btn) => {
  btn.addEventListener('click', function () {
    // Снимаем выделение со всех
    document.querySelectorAll('.plan-card').forEach((c) => c.classList.remove('selected'));
    // Выделяем родительскую карточку
    this.closest('.plan-card').classList.add('selected');
  });
});
