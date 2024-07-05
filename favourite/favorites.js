document.addEventListener('DOMContentLoaded', () => {
    const favoritesTable = document.getElementById('favorite-coins-table');
    const favorites = getFavourites();
    
    async function fetchFavoriteData() {
        const allCoins = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd').then(res => res.json());
        const favoriteCoins = allCoins.filter(coin => favorites.includes(coin.id));
        displayFavorites(favoriteCoins);
    }

    function displayFavorites(favoriteCoins) {
        favoritesTable.innerHTML = '';
        favoriteCoins.forEach((coin, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td><img src="${coin.image}" alt="${coin.name} icon" width="20" height="20"></td>
                <td>${coin.name}</td>
                <td>$${coin.current_price.toLocaleString()}</td>
                <td>$${coin.total_volume.toLocaleString()}</td>
                <td>$${coin.market_cap.toLocaleString()}</td>
            `;
            favoritesTable.appendChild(row);
        });
    }

    function getFavourites() {
        return JSON.parse(localStorage.getItem('favourites')) || [];
    }

    fetchFavoriteData();
});
