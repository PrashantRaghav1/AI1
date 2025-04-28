let promptInput = document.querySelector("#prompt");
let chatContainer = document.querySelector(".chat-container");
let imageButton = document.querySelector("#image");
let fileInput = document.querySelector("#fileInput");
let submitButton = document.querySelector("#submit");

const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyApADQHFM-Ho1Pmu_-xch9-CjmN5T5nYLE"; 

let user = { 
    message: null, 
    file: {
        mime_type: null,
        data: null
    }
};

async function generateResponse(aiChatBox) {
    let requestBody = {
        contents: [
            { parts: [{ text: user.message }] }
        ]
    };

    if (user.file.data) {
        requestBody.contents[0].parts.push({
            inline_data: {
                mime_type: user.file.mime_type,
                data: user.file.data
            }
        });
    }

    try {
        let response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });
        let data = await response.json();
        console.log("API Response:", data);

        let aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "AI could not generate a response.";
        aiChatBox.querySelector(".ai-chat-area").innerHTML = aiText;
    } catch (error) {
        console.error("API Error:", error);
        aiChatBox.querySelector(".ai-chat-area").innerHTML = "Error fetching AI response.";
    } finally {
        chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
        user.file = {};
    }
}

function createChatBox(html, classes) {
    let div = document.createElement("div");
    div.innerHTML = html;
    div.classList.add(classes);
    return div;
}

function handleChatResponse(message) {
    if (!message.trim()) return;

    user.message = message;

    let userHtml = `<img src="user-image.webp" alt="User" id="user-image" width="50">
                    <div class="user-chat-area">${message}
                    ${user.file.data ? `<img src="data:${user.file.mime_type};base64,${user.file.data}" class="chooseimg" />` : ""}
                    </div>`;

    let userChatBox = createChatBox(userHtml, "user-chat-box");
    chatContainer.appendChild(userChatBox);
    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });

    setTimeout(() => {
        let aiHtml = `<img src="AI-5.png" alt="AI" id="ai-image" width="50">
                      <div class="ai-chat-area">AI is thinking...</div>`;
        let aiChatBox = createChatBox(aiHtml, "ai-chat-box");
        chatContainer.appendChild(aiChatBox);

        generateResponse(aiChatBox);
    }, 600);
}

promptInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && promptInput.value.trim() !== "") {
        handleChatResponse(promptInput.value);
        promptInput.value = ""; 
    }
});

submitButton.addEventListener("click", () => {
    if (promptInput.value.trim() !== "") {
        handleChatResponse(promptInput.value);
        promptInput.value = ""; 
    }
});

imageButton.addEventListener("click", () => {
    fileInput.click();
});

fileInput.addEventListener("change", (event) => {
    let file = event.target.files[0];
    if (file) {
        let reader = new FileReader();
        reader.onload = function () {
            user.file.data = reader.result.split(",")[1]; 
            user.file.mime_type = file.type;
            console.log("File ready to send:", user.file);
        };
        reader.readAsDataURL(file);
    } else {
        console.log("No file selected.");
    }
});
