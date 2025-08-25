// Trilliox Landing Page Enhanced Script

// === EMAIL FORM HANDLING ===
document.getElementById('emailForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const emailInput = document.getElementById('email');
  const message = document.getElementById('message');
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Prevent multiple submissions
  if (localStorage.getItem("submittedEmail")) {
    message.textContent = "⚠️ You have already submitted an email!";
    message.style.color = "orange";
    return;
  }

  if (emailPattern.test(emailInput.value)) {
    message.textContent = "✅ Thank you! Your email has been submitted.";
    message.style.color = "#0f0";
    emailInput.disabled = true;
    this.querySelector('button').disabled = true;
    localStorage.setItem("submittedEmail", emailInput.value);
    animateSuccess(message);
  } else {
    message.textContent = "❌ Please enter a valid email address.";
    message.style.color = "red";
    shakeInput(emailInput);
  }
});

// === SUCCESS ANIMATION ===
function animateSuccess(element) {
  element.style.transition = "all 0.5s ease";
  element.style.opacity = "0";
  setTimeout(() => {
    element.style.opacity = "1";
    element.style.color = "#00ffea";
  }, 500);
}

// === INPUT SHAKE EFFECT ON ERROR ===
function shakeInput(input) {
  input.style.transition = "transform 0.1s";
  let i = 0;
  const interval = setInterval(() => {
    input.style.transform = (i % 2 === 0) ? "translateX(-5px)" : "translateX(5px)";
    i++;
    if (i > 4) {
      clearInterval(interval);
      input.style.transform = "translateX(0)";
    }
  }, 100);
}

// === STAR TWINKLE EFFECT ===
function createTwinklingStars() {
  const starsContainer = document.querySelector(".stars");
  for (let i = 0; i < 100; i++) {
    const star = document.createElement("div");
    star.classList.add("star");
    star.style.position = "absolute";
    star.style.width = "2px";
    star.style.height = "2px";
    star.style.background = "white";
    star.style.top = Math.random() * window.innerHeight + "px";
    star.style.left = Math.random() * window.innerWidth + "px";
    starsContainer.appendChild(star);

    setInterval(() => {
      star.style.opacity = Math.random();
    }, 1000 + Math.random() * 2000);
  }
}
createTwinklingStars();

// === MOUSE PARTICLE EFFECT ===
document.addEventListener("mousemove", (e) => {
  const particle = document.createElement("div");
  particle.classList.add("particle");
  document.body.appendChild(particle);

  particle.style.position = "absolute";
  particle.style.width = "6px";
  particle.style.height = "6px";
  particle.style.borderRadius = "50%";
  particle.style.background = "rgba(255,0,128,0.7)";
  particle.style.left = e.pageX + "px";
  particle.style.top = e.pageY + "px";
  particle.style.pointerEvents = "none";
  particle.style.transition = "all 1s linear";

  setTimeout(() => {
    particle.style.opacity = "0";
    particle.style.transform = "scale(2)";
  }, 50);

  setTimeout(() => {
    particle.remove();
  }, 1000);
});

// === DEBUG LOGGING ===
console.log("✨ Trilliox Expanded Script Loaded Successfully");
      
