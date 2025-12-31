import { quotes } from './data.js';

const persianAlphabet = "ابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی".split('');
let currentQuote = "";
let cipherMap = {};
let selectedCipherChar = null;

// المان‌های DOM
const board = document.getElementById('game-board');
const keyboardArea = document.getElementById('virtual-keyboard');
const messageBox = document.getElementById('message');
const quoteDisplay = document.getElementById('quote-display'); // المنت جدید
const newGameBtn = document.getElementById('new-game-btn');

function initGame() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    currentQuote = quotes[randomIndex];
    selectedCipherChar = null;

    createCipher();
    renderBoard();
    renderKeyboard();
    updateKeyboardState();
    
    // پاک کردن پیام‌ها و مخفی کردن شعر قبلی
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
                input.readOnly = true;
                input.dataset.cipher = encryptedChar;
                input.dataset.real = char;

                input.addEventListener('click', (e) => {
                    e.stopPropagation();
                    selectCell(encryptedChar);
                });
                
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

    const delBtn = document.createElement('button');
    delBtn.className = 'key-btn delete-key';
    delBtn.innerHTML = 'پاک کردن';
    delBtn.addEventListener('click', () => handleVirtualKeyInput(''));
    keyboardArea.appendChild(delBtn);
}

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
        
        // --- نمایش شعر نهایی ---
        quoteDisplay.innerText = currentQuote;
        quoteDisplay.classList.add('show');
        // ---------------------

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
        quoteDisplay.classList.remove('show'); // پنهان کردن اگر کاربر پاک کرد
    }
}

newGameBtn.addEventListener('click', initGame);

initGame();
