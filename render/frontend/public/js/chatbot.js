document.getElementById('chatbotIcon').addEventListener('click', function() {
    const chatbotContainer = document.getElementById('chatbotContainer');
    chatbotContainer.style.display = chatbotContainer.style.display === 'none' || chatbotContainer.style.display === '' ? 'flex' : 'none';
});

async function sendMessage() {
    const userMessage = document.getElementById("userInput").value;
    if (!userMessage) return;

    addMessage(userMessage, 'user');
    document.getElementById("userInput").value = '';

    const response = await fetch("https://spendsmart-sugk.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage }),
    });
    const data = await response.json();
    addMessage(data.botReply, 'bot');
}

function addMessage(message, sender) {
    const chatBox = document.getElementById("chatBox");
    const messageElement = document.createElement("div");
    messageElement.className = `message ${sender}`;
    messageElement.innerText = message;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}
