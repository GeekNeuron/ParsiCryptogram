// script.js
import { quotes } from './data.js';

const persianAlphabet = "ابتثجحخدذرزژسشصضطظعغفقکگلمنوهی".split('');
let currentQuote = "";
let cipherMap = {}; // نگاشت: حرف اصلی -> حرف رمز

// المان‌های DOM
const board = document.getElementById('game-board');
const messageBox = document.getElementById('message');
const newGameBtn = document.getElementById('new-game-btn');

function initGame() {
    // انتخاب تصادفی شعر
    const randomIndex = Math.floor(Math.random() * quotes.length);
    currentQuote = quotes[randomIndex];

    createCipher();
    renderBoard();
    messageBox.innerText = "";
}

function createCipher() {
    // کپی الفبا و بر هم زدن ترتیب آن
    let shuffled = [...persianAlphabet].sort(() => 0.5 - Math.random());
    cipherMap = {};
    
    // ایجاد نگاشت رمزنگاری
    persianAlphabet.forEach((char, index) => {
        cipherMap[char] = shuffled[index];
    });
}

function renderBoard() {
    board.innerHTML = '';
    const words = currentQuote.split(' ');

    words.forEach(word => {
        const wordDiv = document.createElement('div');
        wordDiv.className = 'word';

        for (let char of word) {
            const letterBox = document.createElement('div');
            letterBox.className = 'letter-box';

            if (persianAlphabet.includes(char)) {
                const encryptedChar = cipherMap[char];
                
                // حرف رمز (بالا)
                const cipherSpan = document.createElement('span');
                cipherSpan.className = 'cipher-char';
                cipherSpan.innerText = encryptedChar;

                // ورودی کاربر (پایین)
                const input = document.createElement('input');
                input.className = 'user-input';
                input.maxLength = 1;
                input.dataset.cipher = encryptedChar; // شناسه برای گروه‌بندی
                input.dataset.real = char; // برای چک کردن نهایی (اختیاری)

                // ایونت‌ها
                input.addEventListener('input', (e) => handleInput(e, encryptedChar));
                
                letterBox.appendChild(cipherSpan);
                letterBox.appendChild(input);
            } else {
                // کاراکترهای نگارشی (مثل فاصله مجازی یا ویرگول)
                const symbol = document.createElement('span');
                symbol.style.fontSize = "24px";
                symbol.style.alignSelf = "flex-end";
                symbol.style.marginBottom = "12px";
                symbol.innerText = char;
                letterBox.appendChild(symbol);
            }
            wordDiv.appendChild(letterBox);
        }
        board.appendChild(wordDiv);
    });
}

function handleInput(e, cipherChar) {
    const val = e.target.value;
    
    // همگام‌سازی: همه خانه‌هایی که رمز یکسانی دارند پر شوند
    const allInputs = document.querySelectorAll(`input[data-cipher="${cipherChar}"]`);
    allInputs.forEach(input => {
        input.value = val;
    });

    checkWin();
}

function checkWin() {
    const inputs = document.querySelectorAll('.user-input');
    let isFull = true;
    let isCorrect = true;

    // بررسی هر خانه
    inputs.forEach(input => {
        if (!input.value) {
            isFull = false;
        }
        if (input.value !== input.dataset.real) {
            isCorrect = false;
        }
    });

    if (isFull && isCorrect) {
        messageBox.innerText = "✨ عالی بود! شعر را کامل کردی. ✨";
        inputs.forEach(inp => inp.classList.add('solved'));
    } else {
        messageBox.innerText = "";
        inputs.forEach(inp => inp.classList.remove('solved'));
    }
}

// دکمه بازی جدید
newGameBtn.addEventListener('click', initGame);

// شروع اولین بازی
initGame();
