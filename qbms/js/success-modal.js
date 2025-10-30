export function showSuccessModal(message) {
  const successModal = document.getElementById('successModal');
  const successMessage = document.getElementById('successMessage');

  successMessage.textContent = message;
  successModal.style.display = 'flex';

  setTimeout(() => {
    successModal.style.display = 'none';
  }, 2000); // Hide after 2 seconds
}