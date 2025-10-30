export function showNotification(message, type = "success") {
  const toasts = document.getElementById("toasts");
  const toast = document.createElement("div");
  toast.className = "toast";
  if (type === "error") {
    toast.classList.add("error");
  }
  toast.textContent = message;

  const closeButton = document.createElement("span");
  closeButton.className = "toast-close";
  closeButton.innerHTML = "&times;";
  closeButton.onclick = () => {
    toast.remove();
  };

  toast.appendChild(closeButton);
  toasts.appendChild(toast);

  setTimeout(() => {
    if (toast) {
      toast.remove();
    }
  }, 3000);
}
