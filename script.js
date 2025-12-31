import { quotes } from './data.js';

const persianAlphabet = "ابتثجحخدذرزژسشصضطظعغفقکگلمنوهی".split('');
let currentQuote = "";
let cipherMap = {}; 
let selectedCipherChar = null; 

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
    renderKeyboard(); // این تابع حالا هوشمند شده است
    messageBox.innerText = "";
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

function renderKeyboard() {
    keyboardArea.innerHTML = '';
    
    // شناسایی حروفی که در جمله فعلی وجود دارند
    // ما از Set استفاده می‌کنیم تا حروف تکراری حذف شوند و جستجو سریع باشد
    const validCharsInGame = new Set(currentQuote.split(''));

    persianAlphabet.forEach(char => {
        const btn = document.createElement('button');
        btn.className = 'key-btn';
        btn.innerText = char;
        
        // اگر حرف در جمله اصلی نبود، دکمه را غیرفعال کن
        if (!validCharsInGame.has(char)) {
            btn.disabled = true; 
        } else {
            // فقط اگر دکمه فعال بود ایونت کلیک داشته باشد
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                handleVirtualKeyInput(char);
            });
        }
        
        keyboardArea.appendChild(btn);
    });

    // دکمه پاک کردن (همیشه فعال است)
    const delBtn = document.createElement('button');
    delBtn.className = 'key-btn delete-key';
    delBtn.innerHTML = 'پاک‌کردن';
    delBtn.addEventListener('click', () => handleVirtualKeyInput(''));
    keyboardArea.appendChild(delBtn);
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
        selectedCipherChar = null; 
    } else {
        messageBox.innerText = "";
        inputs.forEach(inp => inp.classList.remove('solved'));
    }
}

newGameBtn.addEventListener('click', initGame);

initGame();
