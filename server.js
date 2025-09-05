import express from "express";
import responses from './response.js';
import { sanitizeInput } from './helperFunctions.js';
const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const messages = [];


app.get("/", (req, res) => {
  res.render("index", { messages, botReply: "", error: "" });
});

app.post("/chat", (req, res) => {
  let userMessage = req.body.message;

  // Sanitér input FØRST
  userMessage = sanitizeInput(userMessage);

  let botReply = "";
  let error = "";

  // Validér input
  if (!userMessage || userMessage.trim() === "") {
    error = "Du skal skrive en besked!";
    botReply = "Skriv en besked for at chatte!";
  } else if (userMessage.length < 2) {
    error = "Beskeden skal være mindst 2 tegn lang!";
    botReply = "Din besked er for kort. Prøv igen!";
  } else if (userMessage.length > 500) {
    error = "Beskeden er for lang (max 500 tegn)!";
    botReply = "Din besked er for lang. Prøv at gøre den kortere!";
  } else {
    // Chatbot-logik
    const lowerMessage = userMessage.toLowerCase();
    let foundResponse = false;

    for (let response of responses) {
      for (let keyword of response.keywords) {
        if (lowerMessage.includes(keyword)) {
          const randomIndex = Math.floor(Math.random() * response.answers.length);
          botReply = response.answers[randomIndex];
          foundResponse = true;
          break;
        }
      }
      if (foundResponse) break;
    }

    if (!foundResponse) {
      botReply = `Du skrev: "${userMessage}". Prøv at skrive "hej" eller "hjælp"!`;
    }

    // Gem beskeder med timestamp
    const now = new Date();

    messages.push({
      sender: "Bruger",
      text: userMessage,
      time: now.toLocaleString("da-DK"),
      timestamp: now
    });

    messages.push({
      sender: "Bot",
      text: botReply,
      time: now.toLocaleString("da-DK"),
      timestamp: now
    });
  }

  res.render("index", { messages, botReply, error });
});

app.post("/add-response", (req, res) => {
  const { keyword, answer } = req.body;

  if (!keyword || !answer) {
    console.log("Fejl: Keyword eller answer mangler");
    return res.redirect("/?error=missing_fields");
  }

  if (keyword.trim().length === 0 || answer.trim().length === 0) {
    console.log("Fejl: Tomme felter");
    return res.redirect("/?error=empty_fields");
  }

  const cleanKeyword = keyword.trim().toLowerCase();
  const cleanAnswer = answer.trim();

  const existingResponse = responses.find(resp =>
    resp.keywords.some(kw => kw === cleanKeyword)
  );

  if (existingResponse) {
    existingResponse.answers.push(cleanAnswer);
    console.log(`Tilføjet nyt svar til eksisterende keyword: ${cleanKeyword}`);
  } else {
    responses.push({
      keywords: [cleanKeyword],
      answers: [cleanAnswer]
    });
    console.log(`Oprettet nyt keyword: ${cleanKeyword}`);
  }

  if (!global.userLearnedResponses) {
    global.userLearnedResponses = [];
  }
  global.userLearnedResponses.push({
    keyword: cleanKeyword,
    answer: cleanAnswer,
    timestamp: new Date()
  });

  res.redirect("/?success=response_added");
});

// Start serveren
app.listen(3333, () => console.log("Server running at http://localhost:3333"));
