export function openModal() {
    document.getElementById("modal").style.display = "flex";
}

export function closeModal() {
    document.getElementById("modal").style.display = "none";
}

export function clearModalFields() {
    document.getElementById("questionForm").reset();
}
