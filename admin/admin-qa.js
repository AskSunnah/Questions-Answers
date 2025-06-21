if (!localStorage.getItem('adminToken')) {
  window.location.href = "./admin.html";
}
let sections = []; // Interleaved blocks (quran, sunnah, normal, etc.)

function renderSections() {
  const container = document.getElementById("dynamic-sections");
  container.innerHTML = "";
  sections.forEach((item, idx) => {
    let html = `<div class="section-block"><label>${item.type.toUpperCase()}</label>`;

    if (item.type === "normal") {
      html += `<textarea data-idx="${idx}" data-field="text" placeholder="Text" required>${item.text || ""}</textarea>`;
    } else {
      const isRefRequired = item.type === "quran" || item.type === "sunnah";
      const isTextRequired = true;

      html += `<input type="text" data-idx="${idx}" data-field="reference" placeholder="Reference" value="${item.reference || ""}" ${isRefRequired ? 'required' : ''}/>`;
      
      if (item.type === "sunnah") {
        html += `<input type="text" data-idx="${idx}" data-field="narrator" placeholder="Narrator" value="${item.narrator || ""}"/>`;
      }

      html += `<textarea data-idx="${idx}" data-field="text" placeholder="Text" ${isTextRequired ? 'required' : ''}>${item.text || ""}</textarea>`;
      html += `<textarea data-idx="${idx}" data-field="commentary" placeholder="Commentary">${item.commentary || ""}</textarea>`;
    }

    html += `
      <div class="section-btns">
        <button type="button" onclick="moveSection(${idx}, -1)">↑</button>
        <button type="button" onclick="moveSection(${idx}, 1)">↓</button>
        <button type="button" onclick="deleteSection(${idx})">Delete</button>
      </div></div>`;
    container.innerHTML += html;
  });

  document.querySelectorAll(".section-block textarea, .section-block input").forEach(input => {
    input.oninput = function () {
      const idx = this.dataset.idx;
      const field = this.dataset.field;
      sections[idx][field] = this.value;
    };
  });
}

window.addSection = function () {
  const type = document.getElementById("section-type").value;
  const newBlock = { type, text: "" };
  if (type !== "normal") newBlock.reference = "";
  if (type === "sunnah") newBlock.narrator = "";
  if (type !== "normal") newBlock.commentary = "";
  sections.push(newBlock);
  renderSections();
};

window.deleteSection = function (idx) {
  sections.splice(idx, 1);
  renderSections();
};

window.moveSection = function (idx, direction) {
  if ((idx === 0 && direction === -1) || (idx === sections.length - 1 && direction === 1)) return;
  [sections[idx], sections[idx + direction]] = [sections[idx + direction], sections[idx]];
  renderSections();
};

document.getElementById("add-section-btn").onclick = addSection;

document.getElementById("qa-form").onsubmit = function (e) {
  e.preventDefault();

    const qa = {
    title: document.getElementById('qa-title').value,
    slug: document.getElementById('qa-slug').value,
    question: document.getElementById('qa-question').value,
    answer: document.getElementById('qa-answer').value,
    conclusion: document.getElementById('qa-conclusion').value,
    content: sections // <- send full interleaved array
  };


  console.log("Submitting this Q&A:", qa);
//edit backend link here
  const lang = document.getElementById('qa-language').value;
const endpoint = lang === 'ar' ? '/api/admin/submit_ar' : '/api/admin/submit';
console.log(endpoint);
fetch(`https://asksunnah-backend-16oi.onrender.com${endpoint}`, {
  method: "POST",
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(qa)
})  
  .then(async res => {
    if (!res.ok) {
      const text = await res.text(); // 🔄 Read raw response
      throw new Error("Server error: " + text); // 🧠 Show the actual error response (even if HTML)
    }
    return res.json(); // ✅ Only parse if response is OK and JSON
  })
  .then(data => {
    document.getElementById('save-message').innerText = "Saved successfully!";
    document.getElementById('qa-form').reset();
    sections = [];
    renderSections();
    console.log("Data uploaded on database")
  })
  .catch(err => {
    console.error("Submission error:", err);
    document.getElementById('save-message').innerText = "Failed to save.";
  });

};

renderSections();
