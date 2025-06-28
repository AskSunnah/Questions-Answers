/* if (!localStorage.getItem('adminToken')) {
  window.location.href = "/admin/admin.html";
} */
let sections = []; // Interleaved blocks (quran, sunnah, normal, etc.)

function renderSections() {
  const container = document.getElementById("dynamic-sections");
  container.innerHTML = "";
  sections.forEach((section, idx) => {
    let html = `<div class="section-block"><label>${section.type.toUpperCase()}</label>`;

    if (section.type === "normal") {
      html += `<textarea data-idx="${idx}" data-field="text" placeholder="Text" required>${section.text || ""}</textarea>`;
    } else {
      // Handle grouped items
      section.items = section.items || [{}];
      section.items.forEach((item, itemIdx) => {
        html += `<div class="grouped-item">
          <input type="text" placeholder="Reference" value="${item.reference || ''}" 
                 data-idx="${idx}" data-subidx="${itemIdx}" data-field="reference" required />
          ${section.type === "sunnah" ? `<input type="text" placeholder="Narrator" value="${item.narrator || ''}" 
                 data-idx="${idx}" data-subidx="${itemIdx}" data-field="narrator" />` : ""}
          <textarea placeholder="Text" data-idx="${idx}" data-subidx="${itemIdx}" data-field="text">${item.text || ""}</textarea>
          <textarea placeholder="Commentary" data-idx="${idx}" data-subidx="${itemIdx}" data-field="commentary">${item.commentary || ""}</textarea>
          <button type="button" onclick="deleteItem(${idx}, ${itemIdx})">Remove</button>
        </div>`;
      });
      html += `<button type="button" onclick="addItem(${idx})">Add ${section.type} Entry</button>`;
    }

    html += `<div class="section-btns">
      <button type="button" onclick="moveSection(${idx}, -1)">↑</button>
      <button type="button" onclick="moveSection(${idx}, 1)">↓</button>
      <button type="button" onclick="deleteSection(${idx})">Delete Section</button>
    </div></div>`;
    container.innerHTML += html;
  });

  // Attach oninput for all fields
  document.querySelectorAll(".section-block textarea, .section-block input").forEach(input => {
    input.oninput = function () {
      const { idx, subidx, field } = this.dataset;
      if (subidx !== undefined) {
        sections[idx].items[subidx][field] = this.value;
      } else {
        sections[idx][field] = this.value;
      }
    };
  });
}

window.addItem = function (idx) {
  sections[idx].items.push({});
  renderSections();
};

window.deleteItem = function (idx, itemIdx) {
  sections[idx].items.splice(itemIdx, 1);
  renderSections();
};

window.addSection = function () {
  const type = document.getElementById("section-type").value;
  const newBlock = type === "normal"
    ? { type, text: "" }
    : { type, items: [{}] };
  sections.push(newBlock);
  renderSections();
};
window.deleteSection = function (idx) {
  sections.splice(idx, 1);
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
fetch(`https://asksunnah-backend-hno9.onrender.com${endpoint}`, {
  method: "POST",
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(qa)
})  
  .then(async res => {
    if (!res.ok) {
      const text = await res.text(); 
      throw new Error("Server error: " + text); 
    }
    return res.json(); //Only parse if response is OK and JSON
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
