let servicesDataById = {};

document.addEventListener("DOMContentLoaded", () => {
  initializeServiceDetails();
});

async function initializeServiceDetails() {
  const cards = document.querySelectorAll(".service-card[data-service]");
  const modal = document.getElementById("serviceModal");
  const modalBody = document.getElementById("modal-body");
  const closeBtn = modal ? modal.querySelector(".close-btn") : null;

  if (!cards.length || !modal || !modalBody || !closeBtn) return;

  try {
    const response = await fetch("data/beauty_services_dataset.json");
    if (!response.ok) {
      throw new Error(`Unable to load services dataset: ${response.status}`);
    }

    const data = await response.json();
    const servicesArray = Array.isArray(data) ? data : data.services;

    if (!Array.isArray(servicesArray)) {
      throw new Error("Invalid services dataset format.");
    }

    servicesDataById = Object.fromEntries(
      servicesArray.map((service) => [service.id, service])
    );
  } catch (error) {
    console.error(error);
    modalBody.innerHTML = `
      <h2 id="modal-title">Service Details</h2>
      <p>Unable to load service details right now. Please try again shortly.</p>
      <a class="book-btn" href="contact.html">Book Now</a>
    `;
  }

  const openModal = (serviceId) => {
    const service = servicesDataById[serviceId];
    if (!service) return;

    const benefits = Array.isArray(service.benefits)
      ? service.benefits.map((item) => `<li>${escapeHtml(item)}</li>`).join("")
      : "";
    const process = Array.isArray(service.process)
      ? service.process.map((item) => `<li>${escapeHtml(item)}</li>`).join("")
      : "";

    modalBody.innerHTML = `
      <h2 id="modal-title">${escapeHtml(service.name)}</h2>
      <p><strong>Category:</strong> ${escapeHtml(service.category)}</p>
      <p><strong>Price:</strong> ${escapeHtml(service.price_range)}</p>
      <p><strong>Duration:</strong> ${escapeHtml(service.duration)}</p>
      <p>${escapeHtml(service.description)}</p>
      <h4>Benefits</h4>
      <ul>${benefits}</ul>
      <h4>Process</h4>
      <ol>${process}</ol>
      <a class="book-btn" href="contact.html">Book Now</a>
    `;

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  };

  const closeModal = () => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      openModal(card.dataset.service);
    });
  });

  closeBtn.addEventListener("click", closeModal);
  closeBtn.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    closeModal();
  });

  modal.addEventListener("click", (event) => {
    if (event.target !== modal) return;
    closeModal();
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
