document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Elements
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuClose = document.getElementById('mobile-menu-close');
    const mobileMenuBackdrop = document.getElementById('mobile-menu-backdrop');

    if (mobileMenuToggle && mobileMenu) {
        // Toggle Mobile Menu
        function toggleMobileMenu() {
            mobileMenu.classList.toggle('hidden');
            document.body.classList.toggle('overflow-hidden');
            
            // Toggle menu slide animation
            const menuContent = mobileMenu.querySelector('div:last-child');
            if (menuContent) {
                if (mobileMenu.classList.contains('hidden')) {
                    menuContent.style.transform = 'translateX(100%)';
                } else {
                    menuContent.style.transform = 'translateX(0)';
                }
            }
        }

        // Event Listeners
        mobileMenuToggle.addEventListener('click', toggleMobileMenu);
        mobileMenuClose?.addEventListener('click', toggleMobileMenu);
        mobileMenuBackdrop?.addEventListener('click', toggleMobileMenu);

        // Close menu when clicking on links
        const menuLinks = mobileMenu.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', toggleMobileMenu);
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
                toggleMobileMenu();
            }
        });
    }
});

const fileInput = document.getElementById('file-input');
const convertButton = document.getElementById('convert-button');
const progressBarContainer = document.getElementById('progress-bar-container');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const downloadButton = document.getElementById('download-button');
const formatSelector = document.getElementById('format-selector');
const uploadSection = document.getElementById('upload-section');
const conversionSection = document.getElementById('conversion-section');
const errorMessage = document.getElementById('error-message');

let convertedFileUrl = null;

// File selection handler
const chooseFilesButton = document.getElementById('choose-files');
const deviceUploadButton = document.getElementById('device-upload');

if (chooseFilesButton) {
    chooseFilesButton.addEventListener('click', () => fileInput.click());
}

if (deviceUploadButton) {
    deviceUploadButton.addEventListener('click', () => fileInput.click());
}

// File input change handler
fileInput.addEventListener('change', handleFileSelect);

// Handle file selection
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
        showConversionSection(file);
        errorMessage.classList.add('hidden');
    } else {
        errorMessage.classList.remove('hidden');
    }
}


// Show conversion section with file details
function showConversionSection(file) {
    uploadSection.classList.add('hidden');
    conversionSection.classList.remove('hidden');
    document.getElementById('file-name').textContent = file.name;
    document.getElementById('file-size').textContent = `${(file.size / 1024).toFixed(2)} KB`;
    convertButton.disabled = false;
}



// Conversion handler
convertButton.addEventListener('click', async () => {
    const file = fileInput.files[0];
    const selectedFormat = formatSelector.value.toLowerCase();

    // Show progress bar at the start
    progressBarContainer.style.display = 'block';
    progressBar.style.width = '0%';
    progressText.textContent = '0%';

    try {
        const formData = new FormData();
        formData.append('File', file);

        // Add loading state to button
        convertButton.disabled = true;
        convertButton.innerHTML = 'Converting...';

    
        // Update the fetch URL
        const response = await fetch(`https://v2.convertapi.com/convert/pdf/to/${selectedFormat}?auth=${config.API_KEY}&download=attachment`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Conversion failed');
        }

        // Read the response as a stream
        const reader = response.body.getReader();
        const contentLength = +response.headers.get('Content-Length');
        let receivedLength = 0;
        const chunks = [];

        // Process the stream
        while (true) {
            const { done, value } = await reader.read();

            if (done) {
                break;
            }

            chunks.push(value);
            receivedLength += value.length;

            // Calculate and update progress
            const progress = Math.round((receivedLength / contentLength) * 100);
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `${progress}%`;
        }

        // Create blob from chunks
        const blob = new Blob(chunks);
        convertedFileUrl = URL.createObjectURL(blob);

        // Hide progress bar and show download button
        progressBarContainer.style.display = 'none';
        downloadButton.classList.remove('hidden');
        
    } catch (error) {
        console.error('Conversion error:', error);
        alert('Error during conversion: ' + error.message);
    } finally {
        // Reset button state
        convertButton.disabled = false;
        convertButton.innerHTML = 'Convert';
    }
});

// Download handler
downloadButton.addEventListener('click', () => {
    if (convertedFileUrl) {
        const link = document.createElement('a');
        link.href = convertedFileUrl;
        link.download = `converted-file.${formatSelector.value.toLowerCase()}`;
        link.click();
    }
});

// Format change handler
formatSelector.addEventListener('change', () => {
    downloadButton.classList.add('hidden');
});



// Global drag and drop functionality
const dragIndicator = document.getElementById('drag-indicator');
const body = document.body;

// Prevent default behaviors
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Handle Drag Events
function handleDrag(e) {
    preventDefaults(e);
    
    // Check if dragged file is PDF
    const items = e.dataTransfer?.items;
    if (items && items[0].kind === 'file') {
        const file = items[0].getAsFile();
        if (file.type !== 'application/pdf') {
            dragIndicator.classList.add('invalid-file');
            return;
        }
    }
    
    dragIndicator.classList.remove('invalid-file');
}

// Handle Drop Event
function handleDrop(e) {
    preventDefaults(e);
    dragIndicator.classList.add('hidden');
    
    const file = e.dataTransfer.files[0];
    
    if (file && file.type === 'application/pdf') {
        // Update file input
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
        
        // Show conversion section
        showConversionSection(file);
        errorMessage.classList.add('hidden');
    } else {
        errorMessage.classList.remove('hidden');
    }
}

// Add event listeners
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    body.addEventListener(eventName, preventDefaults, false);
});

['dragenter', 'dragover'].forEach(eventName => {
    body.addEventListener(eventName, () => {
        dragIndicator.classList.remove('hidden');
    });
});

['dragleave', 'drop'].forEach(eventName => {
    body.addEventListener(eventName, () => {
        dragIndicator.classList.add('hidden');
    });
});

body.addEventListener('dragover', handleDrag);
body.addEventListener('drop', handleDrop);

// Page load වෙද්දී save කරලා තියෙන theme එක load කිරීම
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.body.classList.add('light');
    }
  });
  
  // Light/Dark Mode Toggle with localStorage Save
  const themeToggle = document.getElementById('theme-toggle');
  
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light');
    
    if (document.body.classList.contains('light')) {
      localStorage.setItem('theme', 'light');
    } else {
      localStorage.setItem('theme', 'dark');
    }
  });


function toggleAnswer(element) {
    const answer = element.querySelector('.faq-answer');
    const arrow = element.querySelector('.arrow');

    if (answer.classList.contains('hidden')) {
        answer.classList.remove('hidden');
        answer.style.maxHeight = answer.scrollHeight + "px";
        answer.style.opacity = "1";
        arrow.style.transform = "rotate(180deg)";
    } else {
        answer.style.maxHeight = "0px";
        answer.style.opacity = "0";
        setTimeout(() => answer.classList.add('hidden'), 300);
        arrow.style.transform = "rotate(0deg)";
    }
}

