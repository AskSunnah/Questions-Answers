// change this to our actual backend
const API_URL = "https://asksunnah-backend-hno9.onrender.com/admin/login";

document.getElementById('login-btn').onclick = async function () {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  // Basic validation
  if (!username || !password) {
    displayMessage("Please enter both fields", "red");
    return;
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      localStorage.setItem('adminToken', data.token);
      displayMessage("Login successful! Redirecting...", "green");
      
      setTimeout(() => {
        window.location.href = "/admin/admin-dashboard.html"; // or admin-dashboard.html
      }, 800);
    } else {
      displayMessage(data.message || "Login failed", "red");
    }
  } catch (err) {
    console.error("Login error:", err);
    displayMessage("Wrong password or username.", "red");
  }
};

function displayMessage(msg, color) {
  const message = document.getElementById('login-message');
  message.innerText = msg;
  message.style.color = color;
}
