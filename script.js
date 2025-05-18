// DOM Elements
const booksContainer = document.getElementById('books-container');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const bookDetails = document.getElementById('book-details');
const detailsContainer = document.getElementById('details-container');
const closeDetails = document.getElementById('close-details');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('i');
const logo = document.getElementById('logo');

// PDF Viewer Elements
const pdfViewer = document.getElementById('pdf-viewer');
const pdfCanvas = document.getElementById('pdf-canvas');
const pdfTextLayer = document.getElementById('pdf-text-layer');
const closePdf = document.getElementById('close-pdf');
const prevPage = document.getElementById('prev-page');
const nextPage = document.getElementById('next-page');
const currentPageEl = document.getElementById('current-page');
const totalPagesEl = document.getElementById('total-pages');
const zoomIn = document.getElementById('zoom-in');
const zoomOut = document.getElementById('zoom-out');
const zoomLevel = document.getElementById('zoom-level');

// Text-to-Speech Elements
const ttsPlay = document.getElementById('tts-play');
const ttsPause = document.getElementById('tts-pause');
const ttsStop = document.getElementById('tts-stop');
const ttsVoice = document.getElementById('tts-voice');
const ttsRate = document.getElementById('tts-rate');
const ttsRateValue = document.getElementById('tts-rate-value');

// PDF.js variables
let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
let scale = 1.0;
let pdfTextContent = '';

// Speech synthesis variables
let synth = window.speechSynthesis;
let utterance = null;
let voices = [];
let isSpeaking = false;

// Display books in the container
function displayBooks(books = getBooks()) {
    booksContainer.innerHTML = '';
    
    if (books.length === 0) {
        booksContainer.innerHTML = '<div class="no-results">No se encontraron libros que coincidan con tu búsqueda.</div>';
        return;
    }

    books.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.dataset.id = book.id;
        
        bookCard.innerHTML = `
            <img src="${book.cover}" alt="${book.title}" class="book-cover">
            <div class="book-info">
                <div class="book-title">${book.title}</div>
                <div class="book-author">${book.author}</div>
                <div class="book-category">${book.category}</div>
            </div>
        `;
        
        bookCard.addEventListener('click', () => showBookDetails(book.id));
        booksContainer.appendChild(bookCard);
    });
}

// Show book details
function showBookDetails(bookId) {
    const books = getBooks();
    const book = books.find(b => b.id === bookId);
    
    if (!book) return;
    
    detailsContainer.innerHTML = `
        <div class="details-header">
            <h2 class="details-title">${book.title}</h2>
            <div class="details-author">por ${book.author}</div>
        </div>
        <div class="details-content">
            <img src="${book.cover}" alt="${book.title}" class="details-cover">
            <div class="details-info">
                <p class="details-description">${book.description}</p>
                <div class="details-meta">
                    <div class="meta-item"><i class="fas fa-calendar-alt"></i> ${book.year}</div>
                    <div class="meta-item"><i class="fas fa-file-alt"></i> ${book.pages} páginas</div>
                    <div class="meta-item"><i class="fas fa-language"></i> ${book.language}</div>
                    <div class="meta-item"><i class="fas fa-tag"></i> ${book.category}</div>
                </div>
                <button class="read-button" onclick="openPdf(${book.id})">
                    <i class="fas fa-book-open"></i> Leer libro
                </button>
            </div>
        </div>
    `;
    
    bookDetails.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close book details
function closeBookDetails() {
    bookDetails.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Open PDF
function openPdf(bookId) {
    const books = getBooks();
    const book = books.find(b => b.id === bookId);
    
    if (!book || !book.pdfUrl) return;
    
    // Close book details
    closeBookDetails();
    
    // Show PDF viewer
    pdfViewer.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Load PDF
    loadPdf(book.pdfUrl);
}

// Load PDF
function loadPdf(url) {
    // Reset PDF viewer
    pageNum = 1;
    scale = 1.0;
    pdfTextContent = '';
    updateZoomLevel();
    
    // Get PDF
    pdfjsLib.getDocument(url).promise.then(function(pdf) {
        pdfDoc = pdf;
        totalPagesEl.textContent = pdf.numPages;
        
        // Render first page
        renderPage(pageNum);
        
        // Enable/disable navigation buttons
        updateUIState();
    }).catch(function(error) {
        console.error('Error loading PDF:', error);
        pdfTextLayer.innerHTML = `<div style="color: red; padding: 20px;">Error al cargar el PDF: ${error.message}</div>`;
    });
}

// Render PDF page
function renderPage(num) {
    pageRendering = true;
    
    // Update current page display
    currentPageEl.textContent = num;
    
    // Get page
    pdfDoc.getPage(num).then(function(page) {
        // Set scale
        const viewport = page.getViewport({ scale });
        pdfCanvas.height = viewport.height;
        pdfCanvas.width = viewport.width;
        
        // Render PDF page
        const renderContext = {
            canvasContext: pdfCanvas.getContext('2d'),
            viewport: viewport
        };
        
        const renderTask = page.render(renderContext);
        
        // Get text content for TTS
        page.getTextContent().then(function(textContent) {
            // Clear previous text
            pdfTextLayer.innerHTML = '';
            
            // Extract text for TTS
            const textItems = textContent.items.map(item => item.str).join(' ');
            pdfTextContent = textItems;
            
            // Enable TTS button if we have text
            ttsPlay.disabled = !pdfTextContent;
            
            // Create text layer
            const textLayerDiv = document.createElement('div');
            textLayerDiv.className = 'text-layer';
            pdfTextLayer.appendChild(textLayerDiv);
            
            // Position text layer
            textLayerDiv.style.left = pdfCanvas.offsetLeft + 'px';
            textLayerDiv.style.top = pdfCanvas.offsetTop + 'px';
            textLayerDiv.style.height = pdfCanvas.height + 'px';
            textLayerDiv.style.width = pdfCanvas.width + 'px';
            
            // Render text layer
            const textLayer = new pdfjsLib.TextLayerBuilder({
                textLayerDiv: textLayerDiv,
                pageIndex: page.pageIndex,
                viewport: viewport
            });
            
            textLayer.setTextContent(textContent);
            textLayer.render();
        });
        
        // Wait for rendering to finish
        renderTask.promise.then(function() {
            pageRendering = false;
            
            // Check if there's a pending page
            if (pageNumPending !== null) {
                renderPage(pageNumPending);
                pageNumPending = null;
            }
            
            // Update UI state
            updateUIState();
        });
    });
}

// Go to previous page
function goPrevPage() {
    if (pageNum <= 1) return;
    pageNum--;
    queueRenderPage(pageNum);
    stopSpeech();
}

// Go to next page
function goNextPage() {
    if (pageNum >= pdfDoc.numPages) return;
    pageNum++;
    queueRenderPage(pageNum);
    stopSpeech();
}

// Queue rendering of a page
function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
}

// Zoom in
function zoomInPdf() {
    scale += 0.1;
    queueRenderPage(pageNum);
    updateZoomLevel();
}

// Zoom out
function zoomOutPdf() {
    if (scale <= 0.2) return;
    scale -= 0.1;
    queueRenderPage(pageNum);
    updateZoomLevel();
}

// Update zoom level display
function updateZoomLevel() {
    zoomLevel.textContent = `${Math.round(scale * 100)}%`;
}

// Update UI state
function updateUIState() {
    prevPage.disabled = pageNum <= 1;
    nextPage.disabled = !pdfDoc || pageNum >= pdfDoc.numPages;
    zoomOut.disabled = scale <= 0.2;
}

// Close PDF viewer
function closePdfViewer() {
    pdfViewer.style.display = 'none';
    document.body.style.overflow = 'auto';
    stopSpeech();
}

// Initialize speech synthesis
function initSpeechSynthesis() {
    // Get available voices
    function loadVoices() {
        voices = synth.getVoices();
        
        // Filter for Spanish voices first, then any available
        const spanishVoices = voices.filter(voice => voice.lang.includes('es'));
        const availableVoices = spanishVoices.length > 0 ? spanishVoices : voices;
        
        // Clear voice select
        ttsVoice.innerHTML = '';
        
        // Add voices to select
        availableVoices.forEach((voice, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${voice.name} (${voice.lang})`;
            ttsVoice.appendChild(option);
        });
    }
    
    // Chrome loads voices asynchronously
    if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = loadVoices;
    }
    
    // Initial load of voices
    loadVoices();
    
    // Update rate value display
    ttsRate.addEventListener('input', function() {
        ttsRateValue.textContent = `${this.value}x`;
    });
}

// Play speech
function playSpeech() {
    if (isSpeaking) return;
    
    if (!pdfTextContent) {
        alert('No hay texto disponible para leer.');
        return;
    }
    
    // Create utterance
    utterance = new SpeechSynthesisUtterance(pdfTextContent);
    
    // Set voice
    const voiceIndex = parseInt(ttsVoice.value);
    if (!isNaN(voiceIndex) && voices[voiceIndex]) {
        utterance.voice = voices[voiceIndex];
    }
    
    // Set rate
    utterance.rate = parseFloat(ttsRate.value);
    
    // Set events
    utterance.onstart = function() {
        isSpeaking = true;
        ttsPlay.disabled = true;
        ttsPause.disabled = false;
        ttsStop.disabled = false;
    };
    
    utterance.onend = function() {
        isSpeaking = false;
        ttsPlay.disabled = false;
        ttsPause.disabled = true;
        ttsStop.disabled = true;
    };
    
    utterance.onerror = function(event) {
        console.error('Speech synthesis error:', event);
        isSpeaking = false;
        ttsPlay.disabled = false;
        ttsPause.disabled = true;
        ttsStop.disabled = true;
    };
    
    // Speak
    synth.speak(utterance);
}

// Pause speech
function pauseSpeech() {
    if (synth.speaking) {
        if (synth.paused) {
            synth.resume();
            ttsPause.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            synth.pause();
            ttsPause.innerHTML = '<i class="fas fa-play"></i>';
        }
    }
}

// Stop speech
function stopSpeech() {
    if (synth.speaking) {
        synth.cancel();
        isSpeaking = false;
        ttsPlay.disabled = false;
        ttsPause.disabled = true;
        ttsStop.disabled = true;
    }
}

// Search books
function searchBooks() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const books = getBooks();
    
    if (!searchTerm) {
        displayBooks(books);
        return;
    }
    
    const filteredBooks = books.filter(book => 
        book.title.toLowerCase().includes(searchTerm) || 
        book.author.toLowerCase().includes(searchTerm) || 
        book.category.toLowerCase().includes(searchTerm)
    );
    
    displayBooks(filteredBooks);
}

// Toggle dark/light mode
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    
    // Update icon
    if (document.body.classList.contains('dark-mode')) {
        themeIcon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'dark');
    } else {
        themeIcon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'light');
    }
}

// Check saved theme preference
function checkTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeIcon.className = 'fas fa-sun';
    }
}

// Event Listeners
searchButton.addEventListener('click', searchBooks);
searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') searchBooks();
});
closeDetails.addEventListener('click', closeBookDetails);
themeToggle.addEventListener('click', toggleTheme);
closePdf.addEventListener('click', closePdfViewer);
prevPage.addEventListener('click', goPrevPage);
nextPage.addEventListener('click', goNextPage);
zoomIn.addEventListener('click', zoomInPdf);
zoomOut.addEventListener('click', zoomOutPdf);
ttsPlay.addEventListener('click', playSpeech);
ttsPause.addEventListener('click', pauseSpeech);
ttsStop.addEventListener('click', stopSpeech);

// Global functions
window.openPdf = openPdf;

// Initialize
checkTheme();
displayBooks();
initSpeechSynthesis();

// Simulate loading (for demonstration purposes)
setTimeout(() => {
    displayBooks();
}, 1000);