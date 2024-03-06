/**
 * Task: OCR
 * Description: OCR task for extracting text from images
 */


// OCR elements
const video = document.getElementById('ocr-video-capture');
const canvas = document.getElementById('ocr-canvas');
const captureBtn = document.getElementById('ocr-capture-btn');
const progress = document.getElementById('ocr-progress');
const textp = document.getElementById('ocr-text');
// Define ocr worker
var tworker;

// Access the device camera and stream video
navigator.mediaDevices.getUserMedia({ video: true })
.then(stream => {
    video.srcObject = stream;
})
.catch(error => {
    console.error('Error accessing the camera:', error);
});

// Capture image from video stream
captureBtn.addEventListener('click', () => {
    captureBtn.disabled = true;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert image to base64 data URL
    const image = canvas.toDataURL('image/png');
    
    // Do something with the captured image
    console.debug('Captured image:', image);
    // A worker is created once and used every time a user uploads a new file.  

    tworker.recognize(image).then(({ data: { text } }) => {
        console.log(text);
        let decodedText = text;
        //postData('http://192.168.178.149:11434/api/generate', {text: decodedText}); 
        //alert(decodedText);
        textp.innerHTML = decodedText;
    });
});

async function initWorker(){
    tworker = await Tesseract.createWorker("deu", 1, {
        logger: function(m){console.debug(m); progress.value = m.progress * 100;}
    });
    console.debug(tworker)
    captureBtn.disabled = false;
}
initWorker();