/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// API endpoint for the Cloudflare Worker (acts as a proxy to OpenAI)
const apiUrl = "https://chatbot-worker.amelie-garcia530.workers.dev/";

// System prompt: Only answer L'Oréal/beauty-related questions
const systemPrompt = `Act as a specialized beauty assistant for L'Oréal. Only provide answers related to L'Oréal products, beauty routines, and beauty recommendations. For questions outside these topics or about other brands, politely inform the user you can only discuss L'Oréal-related beauty information.

Provide:
- Concise, accurate, and friendly answers.
- Clear product names, routines, or suggestions featuring L'Oréal items.

If you mention several products, ask if the user would like more information on any specific product and what it is used for.

If applicable, clarify your expertise is limited to L'Oréal, and refrain from discussing competitor products.

**Output format:**
- Respond in 2-5 sentences.
- Use a friendly, expert tone.
- Mention specific L'Oréal product names when relevant.

**Examples:**

**Input:** What L'Oréal shampoo is best for dry hair?
**Output:** For dry hair, I recommend the L'Oréal Paris Elvive Extraordinary Oil Shampoo. It's infused with nourishing oils that moisturize and revive dry hair, leaving it smooth and shiny.

**Input:** Can you suggest a makeup routine for sensitive skin?
**Output:** Absolutely! Start by applying L'Oréal Paris True Match Super-Blendable Foundation, which is gentle and suitable for sensitive skin. Pair it with the L'Oréal Paris Infallible Fresh Wear Concealer and finish with the L'Oréal Paris True Match Powder for a flawless, irritation-free look.

**Input:** What do you think of Maybelline mascara?
**Output:** I'm here to help with L'Oréal products and can't provide suggestions about other brands. If you're interested, I recommend L'Oréal Paris Voluminous Lash Paradise Mascara for achieving full, dramatic lashes.

---

**Reminder:** Only answer questions related to L'Oréal products, routines, and beauty recommendations. Politely decline unrelated requests. Use a friendly, expert, and concise style.`;

// Store conversation history
const messages = [{ role: "system", content: systemPrompt }];

// Function to render all messages as bubbles
function renderMessages() {
  // Start with an empty string
  let html = "";
  // Loop through conversation history (skip system prompt)
  for (let i = 1; i < messages.length; i++) {
    const msg = messages[i];
    // Choose a class for user or assistant
    const msgClass = msg.role === "user" ? "msg user" : "msg ai";
    // Choose a label
    const label = msg.role === "user" ? "You" : "L'Oréal Bot";
    // Add a message bubble
    html += `<div class="${msgClass}"><span class="bubble"><strong>${label}:</strong> ${msg.content}</span></div>`;
  }
  chatWindow.innerHTML = html;
}

// Set initial message in conversation history and render
messages.push({
  role: "assistant",
  content: "👋 Hello! How can I help you today?",
});
renderMessages();

// Handle form submit
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get user input
  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  // Add user's message to conversation history
  messages.push({ role: "user", content: userMessage });
  renderMessages();
  // Show loading message as a bubble
  chatWindow.innerHTML += `<div class="msg ai"><span class="bubble">Thinking...</span></div>`;

  // Clear the input field
  userInput.value = "";

  // Prepare the request payload for OpenAI API, including conversation history
  const payload = {
    model: "gpt-4o", // Use gpt-4o model
    messages: messages,
  };

  try {
    // Send request to the Cloudflare Worker (which calls OpenAI)
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // Parse the response JSON
    const data = await response.json();

    // Get the chatbot's reply (assume data.choices[0].message.content)
    const botReply =
      data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content
        ? data.choices[0].message.content
        : "Sorry, I couldn't get a response. Please try again.";

    // Add bot's reply to conversation history
    messages.push({ role: "assistant", content: botReply });
    // Re-render all messages (removes loading message)
    renderMessages();
  } catch (error) {
    // Show error message as a bubble
    chatWindow.innerHTML += `<div class="msg ai"><span class="bubble" style="color:red"><strong>Error:</strong> Could not connect to the chatbot. Please try again later.</span></div>`;
  }

  // Clear the input field
  userInput.value = "";
});
