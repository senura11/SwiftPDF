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

    const formatSelector = document.getElementById('format-selector');
    const dropdownArrow = document.getElementById('dropdown-arrow');

    // Add animation when opening dropdown
    formatSelector.addEventListener('mousedown', function() {
        dropdownArrow.style.transform = 'rotate(180deg)';
    });

    // Reset arrow when closing dropdown
    formatSelector.addEventListener('blur', function() {
        dropdownArrow.style.transform = 'rotate(0)';
    });

    // Add animation to options when opening dropdown
    formatSelector.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        selectedOption.classList.add('animate-fade-in');
        setTimeout(() => {
            selectedOption.classList.remove('animate-fade-in');
        }, 300);
    });

    // Add animation delay to options
    formatSelector.querySelectorAll('.format-option').forEach((option, index) => {
        option.style.animationDelay = `${index * 0.05}s`;
    });

    // Add hover sound effect (optional)
    formatSelector.addEventListener('change', () => {
        const audio = new Audio('hover.mp3'); // Add your sound file
        audio.volume = 0.2;
        audio.play();
    });

    // Add staggered animation delay to options
    formatSelector.querySelectorAll('option').forEach((option, index) => {
        option.style.animationDelay = `${index * 50}ms`;
    });

    // Add hover effect
    formatSelector.addEventListener('mouseover', (e) => {
        if (e.target.tagName === 'OPTION') {
            e.target.style.transform = 'translateX(10px)';
        }
    });

    formatSelector.addEventListener('mouseout', (e) => {
        if (e.target.tagName === 'OPTION') {
            e.target.style.transform = 'translateX(0)';
        }
    });

    // Add selection animation
    formatSelector.addEventListener('change', function() {
        this.classList.add('pulse');
        setTimeout(() => this.classList.remove('pulse'), 300);
    });
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

// Add these variables at the top with other constants
const errorContainer = document.getElementById('error-container');
const errorMessageText = document.getElementById('error-message-text');
const errorCloseButton = document.getElementById('error-close');

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


// Update the showConversionSection function in script.js
function showConversionSection(file) {
    uploadSection.classList.add('hidden');
    conversionSection.classList.remove('hidden');
    
    // Format file name
    const fileName = file.name;
    document.getElementById('file-name').textContent = fileName;
    
    // Format file size
    const fileSize = file.size;
    let formattedSize;
    if (fileSize < 1024) {
        formattedSize = `${fileSize} B`;
    } else if (fileSize < 1024 * 1024) {
        formattedSize = `${(fileSize / 1024).toFixed(1)} KB`;
    } else {
        formattedSize = `${(fileSize / (1024 * 1024)).toFixed(1)} MB`;
    }
    document.getElementById('file-size').textContent = formattedSize;
    
    convertButton.disabled = false;
}



// Conversion handler
convertButton.addEventListener('click', async () => {
    const file = fileInput.files[0];
    const selectedFormat = formatSelector.value.toLowerCase();

    // Hide any existing error message
    errorContainer.classList.add('hidden');

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

        const response = await fetch(`https://v2.convertapi.com/convert/pdf/to/${selectedFormat}?auth=${config.API_KEY}&download=attachment`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Conversion failed: ${response.statusText}`);
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
        
        // Show error message in the conversion section
        errorMessageText.textContent = error.message || 'An error occurred during conversion. Please try again.';
        errorContainer.classList.remove('hidden');
        
        // Hide progress bar
        progressBarContainer.style.display = 'none';
    } finally {
        // Reset button state
        convertButton.disabled = false;
        convertButton.innerHTML = 'Convert';
    }
});

// Add error close button handler
errorCloseButton.addEventListener('click', () => {
    errorContainer.classList.add('hidden');
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


// Add to script.js
function toggleFaq(element) {
    const parent = element.closest('.faq-item');
    const content = parent.querySelector('.faq-content');
    const allFaqs = document.querySelectorAll('.faq-item');

    // Close other FAQs
    allFaqs.forEach(faq => {
        if (faq !== parent && faq.classList.contains('active')) {
            faq.classList.remove('active');
            faq.querySelector('.faq-content').style.maxHeight = '0';
        }
    });

    // Toggle current FAQ
    parent.classList.toggle('active');
    
    if (parent.classList.contains('active')) {
        content.style.maxHeight = content.scrollHeight + 'px';
        
        // Add ripple effect
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        const rect = parent.getBoundingClientRect();
        ripple.style.left = event.clientX - rect.left + 'px';
        ripple.style.top = event.clientY - rect.top + 'px';
        parent.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 1000);
    } else {
        content.style.maxHeight = '0';
    }
}

// Add scroll reveal animation
document.addEventListener('DOMContentLoaded', () => {
    const faqItems = document.querySelectorAll('.faq-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('animate-fade-in');
                }, index * 100);
            }
        });
    }, {
        threshold: 0.1
    });

    faqItems.forEach(item => observer.observe(item));
});



// Get remove button element
const removeFileButton = document.getElementById('remove-file');

// Remove file handler
removeFileButton.addEventListener('click', () => {
    // Clear file input
    fileInput.value = '';
    
    // Reset converted file URL
    convertedFileUrl = null;
    
    // Hide conversion section
    conversionSection.classList.add('hidden');
    
    // Show upload section
    uploadSection.classList.remove('hidden');
    
    // Reset other elements
    downloadButton.classList.add('hidden');
    progressBarContainer.style.display = 'none';
    progressBar.style.width = '0%';
    progressText.textContent = '0%';
    convertButton.disabled = true;
    convertButton.innerHTML = 'Convert';
    
    // Reset format selector
    formatSelector.selectedIndex = 0;
});
