const cryptoTable = document.getElementById('crypto-table');
const pagination = document.getElementById('pagination');
const priceHeader = document.getElementById('price-header');
const volumeHeader = document.getElementById('volume-header');
const rowsPerPage = 15;
let currentPage = 1;
let cryptoData = [];
let sortState = {
    key: null,
    ascending: true
};

document.addEventListener('DOMContentLoaded', () => {
    // Load the default page (Home)
    navigateTo('crypto-tracker/index.html');
    window.navigateTo = navigateTo; // Expose navigateTo function to global scope
});

async function fetchData() {
    const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd');
    const data = await response.json();
    cryptoData = data;
    displayTable();
    setupPagination();
}

function displayTable() {
    cryptoTable.innerHTML = '';
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedData = cryptoData.slice(start, end);
    const favourites = getFavourites();

    paginatedData.forEach((crypto, index) => {
        const row = document.createElement('tr');
        const isFavourite = favourites.includes(crypto.id);
        row.innerHTML = `
            <td>${crypto.market_cap_rank}</td>
            <td><img src="${crypto.image}" alt="${crypto.name} icon" width="20" height="20"></td>
            <td><a href="#" onclick="navigateTo('coin/index.html', '${crypto.id}')">${crypto.name}</a></td>
            <td>$${crypto.current_price.toLocaleString()}</td>
            <td>$${crypto.total_volume.toLocaleString()}</td>
            <td>$${crypto.market_cap.toLocaleString()}</td>
            <td><button class="fav-button" data-id="${crypto.id}">${isFavourite ? '★' : '☆'}</button></td>
        `;
        cryptoTable.appendChild(row);
    });

    document.querySelectorAll('.fav-button').forEach(button => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-id');
            toggleFavourite(id);
            displayTable();
        });
    });

    updateSortingArrows();
}

function setupPagination() {
    pagination.innerHTML = '';
    const pageCount = Math.ceil(cryptoData.length / rowsPerPage);

    for (let i = 1; i <= pageCount; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        if (i === currentPage) {
            button.classList.add('active');
        }
        button.addEventListener('click', () => {
            currentPage = i;
            displayTable();
            setupPagination();
        });
        pagination.appendChild(button);
    }
}

function getFavourites() {
    return JSON.parse(localStorage.getItem('favourites')) || [];
}

function toggleFavourite(id) {
    const favourites = getFavourites();
    if (favourites.includes(id)) {
        const index = favourites.indexOf(id);
        favourites.splice(index, 1);
    } else {
        favourites.push(id);
    }
    localStorage.setItem('favourites', JSON.stringify(favourites));
}

priceHeader.addEventListener('click', () => {
    sortCryptoData('current_price');
    displayTable();
});

volumeHeader.addEventListener('click', () => {
    sortCryptoData('total_volume');
    displayTable();
});

function sortCryptoData(key) {
    if (sortState.key === key) {
        sortState.ascending = !sortState.ascending;
    } else {
        sortState.key = key;
        sortState.ascending = true;
    }

    cryptoData.sort((a, b) => {
        if (sortState.ascending) {
            return a[key] - b[key];
        } else {
            return b[key] - a[key];
        }
    });
}

function updateSortingArrows() {
    const headers = [priceHeader, volumeHeader];
    headers.forEach(header => {
        header.classList.remove('sorted-asc', 'sorted-desc');
        if (header.id === `${sortState.key}-header`) {
            header.classList.add(sortState.ascending ? 'sorted-asc' : 'sorted-desc');
        }
    });
}

async function loadCoinDetails(coinId) {
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`);
    const data = await response.json();
    displayCoinDetails(data);
}

function displayCoinDetails(coin) {
    document.getElementById('app').innerHTML = `
        <h1>${coin.name}</h1>
        <p>Symbol: ${coin.symbol.toUpperCase()}</p>
        <p>Current Price: $${coin.market_data.current_price.usd.toLocaleString()}</p>
        <p>Market Cap: $${coin.market_data.market_cap.usd.toLocaleString()}</p>
        <p>24h Volume: $${coin.market_data.total_volume.usd.toLocaleString()}</p>
        <p>Description: ${coin.description.en}</p>
        <button onclick="navigateTo('crypto-tracker/index.html')">Back to Home</button>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const debounceTimeout = 300;
    let debounceTimer;

    // Search functionality
    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const query = searchInput.value.trim();
            if (query) {
                searchCoins(query);
            } else {
                searchResults.innerHTML = '';
            }
        }, debounceTimeout);
    });

    async function searchCoins(query) {
        const response = await fetch(`https://api.coingecko.com/api/v3/search?query=${query}`);
        const data = await response.json();
        displaySearchResults(data.coins);
    }

    function displaySearchResults(coins) {
        const searchResults = document.getElementById('search-results');
        searchResults.innerHTML = '';
        coins.forEach(coin => {
            const li = document.createElement('li');
            li.textContent = coin.name;
            li.addEventListener('click', () => {
                searchInput.value = coin.name;
                searchResults.innerHTML = '';
                loadCoinDetails(coin.id);
            });
            searchResults.appendChild(li);
        });
    }
});

function performSearch() {
    const searchInput = document.getElementById('search-input').value.trim();
    if (searchInput) {
        searchCoins(searchInput);
    }
}

function navigateTo(page, coinId = null) {
    fetch(`/${page}`)
        .then(response => response.text())
        .then(html => {
            document.getElementById('app').innerHTML = html;
            if (page === 'crypto-tracker/index.html') {
                fetchData(); // Reload data and re-setup the table
            } else if (page === 'coin/index.html' && coinId) {
                loadCoinDetails(coinId);
            }
        })
        .catch(error => console.error('Error loading page:', error));
}

fetchData();
