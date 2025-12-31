import { quotes } from './data.js';

const persianAlphabet = "ابتثجحخدذرزژسشصضطظعغفقکگلمنوهی".split('');
let currentQuote = "";
let cipherMap = {}; 
let selectedCipherChar = null; // نگه داشتن حرف رمزِ انتخاب شده

// المان‌های DOM
const board = document.getElementById('game-board');
const keyboardArea = document.getElementById('virtual-keyboard');
const messageBox = document.getElementById('message');
const newGameBtn = document.getElementById('new-game-btn');

function initGame() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    currentQuote = quotes[randomIndex];
    selectedCipherChar = null;

    createCipher();
    renderBoard();
    renderKeyboard();
    messageBox.innerText = "";
}

function createCipher() {
    let shuffled = [...persianAlphabet].sort(() => 0.5 - Math.random());
    cipherMap = {};
    persianAlphabet.forEach((char, index) => {
        cipherMap[char] = shuffled[index];
    });
}

// ساختن برد بازی
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
                
                const cipherSpan = document.createElement('span');
                cipherSpan.className = 'cipher-char';
                cipherSpan.innerText = encryptedChar;

                const input = document.createElement('input');
                input.className = 'user-input';
                input.readOnly = true; // غیرفعال کردن تایپ مستقیم
                input.dataset.cipher = encryptedChar;
                input.dataset.real = char;

                // رویداد کلیک برای انتخاب خانه
                input.addEventListener('click', () => selectCell(encryptedChar));
                
                letterBox.appendChild(cipherSpan);
                letterBox.appendChild(input);
            } else {
                const symbol = document.createElement('span');
                symbol.style.fontSize = "24px";
                symbol.style.alignSelf = "flex-end";
                symbol.style.marginBottom = "10px";
                symbol.innerText = char;
                letterBox.appendChild(symbol);
            }
            wordDiv.appendChild(letterBox);
        }
        board.appendChild(wordDiv);
    });
}

// ساختن کیبورد مجازی
function renderKeyboard() {
    keyboardArea.innerHTML = '';
    
    // دکمه‌های حروف
    persianAlphabet.forEach(char => {
        const btn = document.createElement('button');
        btn.className = 'key-btn';
        btn.innerText = char;
        
        // وقتی روی کیبورد کلیک شد
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // جلوگیری از پریدن فوکوس
            handleVirtualKeyInput(char);
        });
        
        keyboardArea.appendChild(btn);
    });

    // دکمه پاک کردن
    const delBtn = document.createElement('button');
    delBtn.className = 'key-btn delete-key';
    delBtn.innerHTML = 'پاک‌کردن'; // یا آیکون سطل زباله
    delBtn.addEventListener('click', () => handleVirtualKeyInput(''));
    keyboardArea.appendChild(delBtn);
}

// تابع انتخاب سلول (وقتی روی یک خانه در برد کلیک می‌شود)
function selectCell(cipherChar) {
    selectedCipherChar = cipherChar;
    
    // برداشتن کلاس اکتیو از همه
    document.querySelectorAll('.user-input').forEach(inp => {
        inp.classList.remove('active');
    });

    // اضافه کردن کلاس اکتیو به تمام خانه‌هایی که همین رمز را دارند
    const targets = document.querySelectorAll(`input[data-cipher="${cipherChar}"]`);
    targets.forEach(inp => {
        inp.classList.add('active');
    });
}

// تابع اعمال ورودی از کیبورد مجازی
function handleVirtualKeyInput(charToInsert) {
    if (!selectedCipherChar) return; // اگر هیچ خانه‌ای انتخاب نشده، کاری نکن

    // پیدا کردن تمام خانه‌های مربوط به حرف رمز انتخاب شده
    const targets = document.querySelectorAll(`input[data-cipher="${selectedCipherChar}"]`);
    
    targets.forEach(input => {
        input.value = charToInsert;
        // انیمیشن کوچک برای بازخورد
        input.style.transform = "scale(1.1)";
        setTimeout(() => input.style.transform = "scale(1)", 100);
    });

    checkWin();
}

function checkWin() {
    const inputs = document.querySelectorAll('.user-input');
    let isFull = true;
    let isCorrect = true;

    inputs.forEach(input => {
        if (!input.value) isFull = false;
        if (input.value !== input.dataset.real) isCorrect = false;
    });

    if (isFull && isCorrect) {
        messageBox.innerText = "✨ تبریک! معما حل شد. ✨";
        inputs.forEach(inp => {
            inp.classList.add('solved');
            inp.classList.remove('active');
        });
        selectedCipherChar = null; // غیرفعال کردن انتخاب
    } else {
        messageBox.innerText = "";
        inputs.forEach(inp => inp.classList.remove('solved'));
    }
}

newGameBtn.addEventListener('click', initGame);

initGame();
