import { loadQuestions, getActiveFilters } from "./questions.js";

let currentPage = 1;
const ITEMS_PER_PAGE = 20;
let totalItems = 0;

const prevBtn = document.createElement("button");
const nextBtn = document.createElement("button");

// Initialize Pagination DOM
export function initPagination() {
    const footer = document.createElement("div");
    footer.className = "table-footer";

    footer.innerHTML = `
        <div class="total">Total Count: <span id="totalCount">0</span></div>
        <div class="pagination">
            <button id="prevPage" class="icon-btn" aria-label="Previous page">❮</button>
            <span class="page-info">
                <span id="currentPage">1</span> of <span id="totalPages">1</span>
            </span>
            <button id="nextPage" class="icon-btn" aria-label="Next page">❯</button>
        </div>
    `;

    document.querySelector(".card").appendChild(footer);

    document.getElementById("prevPage").addEventListener("click", ()=>changePage(-1));
    document.getElementById("nextPage").addEventListener("click", ()=>changePage(1));
}

// Set total items for pagination
export function setTotalItems(count) {
    totalItems = count;
    const totalPages = Math.max(Math.ceil(count / ITEMS_PER_PAGE), 1);
    document.getElementById("totalCount").textContent = count;
    document.getElementById("totalPages").textContent = totalPages;
    document.getElementById("currentPage").textContent = currentPage;
}

// Change page
export function changePage(delta) {
    const totalPages = Math.max(Math.ceil(totalItems / ITEMS_PER_PAGE), 1);
    currentPage += delta;
    if(currentPage < 1) currentPage = 1;
    if(currentPage > totalPages) currentPage = totalPages;
    const searchQuery = document.getElementById('searchInput').value;
    const filters = getActiveFilters();
    loadQuestions(currentPage, searchQuery, filters);
}

// Get current page
export function getCurrentPage() {
    return currentPage;
}

// Get items per page
export function getItemsPerPage() {
    return ITEMS_PER_PAGE;
}
