document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:3000/api';

    // Movie Grid Functionality
    async function fetchMovies(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}/${endpoint}`);
            const movies = await response.json();
            return movies;
        } catch (error) {
            console.error('Error fetching movies:', error);
            return [];
        }
    }

    function createMovieCard(movie) {
        const card = document.createElement('div');
        card.classList.add('movie-card');
        card.innerHTML = `
            <img src="${movie.posterUrl}" alt="${movie.title}">
            <div class="movie-info">
                <h3>${movie.title}</h3>
                <div class="movie-actions">
                    <button class="watch-btn" data-id="${movie._id}">Watch Now</button>
                    <button class="download-btn" data-id="${movie._id}">Download</button>
                </div>
            </div>
        `;
        return card;
    }

    async function populateMovieGrid(gridId, endpoint) {
        const grid = document.getElementById(gridId);
        if (!grid) return;

        const movies = await fetchMovies(endpoint);
        grid.innerHTML = ''; // Clear previous content
        movies.forEach(movie => {
            const movieCard = createMovieCard(movie);
            grid.appendChild(movieCard);
        });

        // Add event listeners to watch and download buttons
        grid.querySelectorAll('.watch-btn, .download-btn').forEach(button => {
            button.addEventListener('click', handleMovieAction);
        });
    }

    function handleMovieAction(event) {
        const movieId = event.target.dataset.id;
        const action = event.target.classList.contains('watch-btn') ? 'watch' : 'download';
        
        // In a real app, this would interact with backend
        console.log(`${action.charAt(0).toUpperCase() + action.slice(1)} movie: ${movieId}`);
    }

    // Search Functionality
    const searchInput = document.querySelector('.search-input');
    const searchButton = document.querySelector('.search-button');

    async function searchMovies(query) {
        try {
            const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
            const movies = await response.json();
            const trendingGrid = document.getElementById('trending-movies');
            trendingGrid.innerHTML = ''; // Clear previous results
            movies.forEach(movie => {
                const movieCard = createMovieCard(movie);
                trendingGrid.appendChild(movieCard);
            });
        } catch (error) {
            console.error('Search error:', error);
        }
    }

    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            searchMovies(query);
        }
    });

    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                searchMovies(query);
            }
        }
    });

    // Genre Filtering
    const genreCards = document.querySelectorAll('.genre-card');
    genreCards.forEach(card => {
        card.addEventListener('click', async () => {
            const genre = card.dataset.genre;
            try {
                const response = await fetch(`${API_BASE_URL}/genre/${genre}`);
                const movies = await response.json();
                const topRatedGrid = document.getElementById('top-rated-movies');
                topRatedGrid.innerHTML = ''; // Clear previous results
                movies.forEach(movie => {
                    const movieCard = createMovieCard(movie);
                    topRatedGrid.appendChild(movieCard);
                });
            } catch (error) {
                console.error(`Error fetching ${genre} movies:`, error);
            }
        });
    });

    // Initial page load data population
    populateMovieGrid('trending-movies', 'movies/trending');
    populateMovieGrid('top-rated-movies', 'movies/top-rated');

    // Mobile Responsiveness
    function setupMobileMenu() {
        const hamburger = document.createElement('div');
        hamburger.classList.add('hamburger');
        hamburger.innerHTML = '☰';
        hamburger.style.color = 'white';
        hamburger.style.fontSize = '24px';
        hamburger.style.cursor = 'pointer';

        const mobileMenu = document.createElement('div');
        mobileMenu.classList.add('mobile-menu');
        mobileMenu.style.display = 'none';
        mobileMenu.style.position = 'fixed';
        mobileMenu.style.top = '0';
        mobileMenu.style.left = '0';
        mobileMenu.style.width = '100%';
        mobileMenu.style.backgroundColor = '#1E1E1E';
        mobileMenu.style.zIndex = '1000';

        const navLinks = document.querySelector('.nav-links');
        mobileMenu.innerHTML = navLinks.innerHTML;

        hamburger.addEventListener('click', () => {
            mobileMenu.style.display = mobileMenu.style.display === 'none' ? 'block' : 'none';
        });

        document.querySelector('nav').prepend(hamburger);
        document.body.appendChild(mobileMenu);

        // Close mobile menu when a link is clicked
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.style.display = 'none';
            });
        });
    }

    // User Authentication Placeholder
    function setupAuthFunctionality() {
        const loginBtn = document.querySelector('.login-btn');
        const signupBtn = document.querySelector('.signup-btn');

        loginBtn.addEventListener('click', () => {
            // In a real app, this would open a login modal or redirect
            console.log('Login clicked');
        });

        signupBtn.addEventListener('click', () => {
            // In a real app, this would open a signup modal or redirect
            console.log('Signup clicked');
        });
    }

    // Run setup functions
    if (window.innerWidth <= 768) {
        setupMobileMenu();
    }
    setupAuthFunctionality();
});