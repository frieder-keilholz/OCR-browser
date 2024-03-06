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
var languageOCR = "deu";

async function startOCR(language){
    if(language) languageOCR = language;
    initWorker();
    // Access the device camera and stream video
    navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(error => {
        console.error('Error accessing the camera:', error);
    });
}

function stopOCR(){
    //video.srcObject.getVideoTracks().forEach(track => track.stop());
    //tworker.terminate();
}

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
        nameByLLM('http://bignasx.ddns.net:43434/api/generate', {text: decodedText}); 
        //alert(decodedText);
        textp.innerHTML = decodedText;
        captureBtn.disabled = false;
        stopOCR();
    });
});

async function initWorker(){
    tworker = await Tesseract.createWorker("deu", 1, {
        logger: function(m){console.debug(m); progress.value = m.progress * 100;}
    });
    console.debug(tworker)
    captureBtn.disabled = false;
}

function nameByLLM(url, data) {
    console.log({"data": data, "url": url})
    let prompt_text = "in the follwing text decoded by OCR there is a name in the address. you need to find the full name ONLY: "+ data.text
    console.log(prompt_text)
    fetch(url, {
        mode: 'cors',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"model": "codellama:instruct", "prompt": prompt_text})
    })
    .then(response => response.text())
    .then(result => {
        // Split the response by newline characters
        const lines = result.split('\n');

        // Parse each line as JSON
        const jsonObjects = lines.filter(line => line.trim() !== '').map(line => JSON.parse(line));

        // Log the parsed JSON objects
        console.log('POST request successful:', jsonObjects);

        // build the result string
        let resultString = "";
        for (let i = 0; i < jsonObjects.length; i++) {
            resultString += jsonObjects[i].response ;
        }
        console.log(resultString);
        let full_name = resultString.split("\n\n")[1]
        console.info(full_name);
        alert(full_name);
        document.getElementById('full-name').value = full_name;
        captureBtn.disabled = false;
    })
    .catch(error => {
        // Handle any errors that occur during the request
        console.error('Error making POST request:', error);
        captureBtn.disabled = false;
    });
}