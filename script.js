import { quotes } from './data.js';

// حروف الفبای فارسی کامل (شامل پ و چ)
const persianAlphabet = "ابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی".split('');

let currentQuote = "";
let cipherMap = {};
let selectedCipherChar = null;

// المان‌های DOM
const board = document.getElementById('game-board');
const keyboardArea = document.getElementById('virtual-keyboard');
const messageBox = document.getElementById('message');
const quoteDisplay = document.getElementById('quote-display');
const newGameBtn = document.getElementById('new-game-btn');

// --- شروع بازی ---
function initGame() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    currentQuote = quotes[randomIndex];
    
    selectedCipherChar = null;

    createCipher();
    renderBoard();
    renderKeyboard();
    
    updateKeyboardState();
    
    messageBox.innerText = "";
    quoteDisplay.innerText = "";
    quoteDisplay.classList.remove('show');
}

function createCipher() {
    let shuffled = [...persianAlphabet].sort(() => 0.5 - Math.random());
    cipherMap = {};
    persianAlphabet.forEach((char, index) => {
        cipherMap[char] = shuffled[index];
    });
}

// --- ساخت برد بازی ---
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
                
                // *** حذف کدهای مربوط به نمایش حرف رمز در اینجا ***

                const input = document.createElement('input');
                input.className = 'user-input';
                input.readOnly = true;
                input.dataset.cipher = encryptedChar;
                input.dataset.real = char;

                input.addEventListener('click', (e) => {
                    e.stopPropagation();
                    selectCell(encryptedChar);
                });
                
                // فقط اینپوت اضافه می‌شود، حرف بالای آن حذف شد
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

// --- انتخاب یک سلول ---
function selectCell(cipherChar) {
    selectedCipherChar = cipherChar;
    
    document.querySelectorAll('.user-input').forEach(inp => {
        inp.classList.remove('active');
    });

    const targets = document.querySelectorAll(`input[data-cipher="${cipherChar}"]`);
    targets.forEach(inp => {
        inp.classList.add('active');
    });
}

// --- ساخت کیبورد مجازی ---
function renderKeyboard() {
    keyboardArea.innerHTML = '';
    
    const validCharsInGame = new Set(currentQuote.split(''));

    persianAlphabet.forEach(char => {
        const btn = document.createElement('button');
        btn.className = 'key-btn';
        btn.innerText = char;
        btn.dataset.char = char;
        
        if (!validCharsInGame.has(char)) {
            btn.disabled = true; 
        } else {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                handleVirtualKeyInput(char);
            });
        }
        
        keyboardArea.appendChild(btn);
    });

    // دکمه پاک کردن
    const delBtn = document.createElement('button');
    delBtn.className = 'key-btn delete-key';
    delBtn.innerHTML = 'پاک‌کردن';
    delBtn.addEventListener('click', () => handleVirtualKeyInput(''));
    keyboardArea.appendChild(delBtn);
}

// --- مدیریت وضعیت دکمه‌های کیبورد ---
function updateKeyboardState() {
    const usedLetters = new Set();
    const inputs = document.querySelectorAll('.user-input');
    inputs.forEach(input => {
        if (input.value) {
            usedLetters.add(input.value);
        }
    });

    const keys = document.querySelectorAll('.key-btn:not(.delete-key)');
    const validCharsInGame = new Set(currentQuote.split(''));

    keys.forEach(btn => {
        const char = btn.dataset.char;
        if (!validCharsInGame.has(char)) return;

        if (usedLetters.has(char)) {
            btn.disabled = true;
            btn.classList.add('is-used');
        } else {
            btn.disabled = false;
            btn.classList.remove('is-used');
        }
    });
}

// --- پردازش ورودی ---
function handleVirtualKeyInput(charToInsert) {
    if (!selectedCipherChar) return;

    const targets = document.querySelectorAll(`input[data-cipher="${selectedCipherChar}"]`);
    targets.forEach(input => {
        input.value = charToInsert;
        
        if (charToInsert !== '') {
            input.style.transform = "scale(1.1)";
            setTimeout(() => input.style.transform = "scale(1)", 100);
        }
    });

    updateKeyboardState();
    checkWin();
}

// --- بررسی وضعیت برد ---
function checkWin() {
    const inputs = document.querySelectorAll('.user-input');
    let isFull = true;
    let isCorrect = true;

    inputs.forEach(input => {
        if (!input.value) isFull = false;
        if (input.value !== input.dataset.real) isCorrect = false;
    });

    if (isFull && isCorrect) {
        messageBox.innerText = "✨ عالی بود! معما حل شد. ✨";
        
        quoteDisplay.innerText = currentQuote;
        quoteDisplay.classList.add('show');

        inputs.forEach(inp => {
            inp.classList.add('solved');
            inp.classList.remove('active');
        });
        selectedCipherChar = null;
        
        const allKeys = document.querySelectorAll('.key-btn');
        allKeys.forEach(k => k.disabled = true);

    } else {
        messageBox.innerText = "";
        inputs.forEach(inp => inp.classList.remove('solved'));
        quoteDisplay.classList.remove('show');
    }
}

newGameBtn.addEventListener('click', initGame);

initGame();
