let quotes = [
    { text: "The future belongs to those who prepare for it today.", category: "Motivation" },
    { text: "Injustice anywhere is a threat to justice everywhere.", category: "Justice" },
    { text: "Simplicity is the soul of efficiency.", category: "Technology" },
  ];
  
  const quoteDisplay = document.getElementById("quoteDisplay");
  const newQuoteBtn = document.getElementById("newQuote");
  const categoryFilter = document.getElementById("categoryFilter");
  const addQuoteFormContainer = document.getElementById("addQuoteForm");
  
  function populateCategories() {
    const categories = [...new Set(quotes.map(q => q.category))];
    categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
    categories.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      categoryFilter.appendChild(option);
    });
  }
  
  function showRandomQuote() {
    let filteredQuotes = quotes;
    const selectedCategory = categoryFilter.value;
  
    if (selectedCategory !== "all") {
      filteredQuotes = quotes.filter(q => q.category === selectedCategory);
    }
  
    if (filteredQuotes.length === 0) {
      quoteDisplay.textContent = "No quotes available for this category.";
      return;
    }
  
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const randomQuote = filteredQuotes[randomIndex];
    quoteDisplay.innerHTML = `
      <p>"${randomQuote.text}"</p>
      <small><em>— ${randomQuote.category}</em></small>
    `;
  }
  
  // Create and attach the quote addition form dynamically
  function createAddQuoteForm() {
    const form = document.createElement("div");
  
    const textInput = document.createElement("input");
    textInput.id = "newQuoteText";
    textInput.placeholder = "Enter a new quote";
  
    const categoryInput = document.createElement("input");
    categoryInput.id = "newQuoteCategory";
    categoryInput.placeholder = "Enter quote category";
  
    const addBtn = document.createElement("button");
    addBtn.textContent = "Add Quote";
    addBtn.addEventListener("click", addQuote);
  
    form.appendChild(textInput);
    form.appendChild(categoryInput);
    form.appendChild(addBtn);
    addQuoteFormContainer.appendChild(form);
  }
  
  function addQuote() {
    const text = document.getElementById("newQuoteText").value.trim();
    const category = document.getElementById("newQuoteCategory").value.trim();
  
    if (!text || !category) {
      alert("Please fill in both fields!");
      return;
    }
  
    quotes.push({ text, category });
    populateCategories();
  
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
  
    alert("New quote added successfully!");
  }
  
  newQuoteBtn.addEventListener("click", showRandomQuote);
  categoryFilter.addEventListener("change", showRandomQuote);
  
  populateCategories();
  createAddQuoteForm();
  