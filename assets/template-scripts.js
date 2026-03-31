const Tmdb_apiKey = "805a112b234ae9a90ef7427a5b1074a7";
const Tmdb_URL = "https://api.themoviedb.org/3/";
const Tmdb_Image_URL = "https://image.tmdb.org/t/p/";

const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get("id");

const hero = document.getElementById("hero");
const posterEl = document.getElementById("poster");
const statusEl = document.getElementById("status");
const titleEl = document.getElementById("mov-title");
const releaseDateEl = document.getElementById("release-date");
const runtimeEl = document.getElementById("runtime");
const ratingEl = document.getElementById("rating");
const genreChipsEl = document.getElementById("genre-chips");
const overviewEl = document.getElementById("overview");
const originalTitleEl = document.getElementById("original-title");
const languageEl = document.getElementById("language");
const movieStatusEl = document.getElementById("movie-status");
const budgetEl = document.getElementById("budget");
const revenueEl = document.getElementById("revenue");
const popularityEl = document.getElementById("popularity");

if (!movieId){
    statusEl.textContent = "No movie id provided in URL.";
} else {
    setupMovieInfo();
}

async function setupMovieInfo(){
    try{
        statusEl.textContent = "Loading movie details...";

        const res = await fetch(`${Tmdb_URL}movie/${movieId}?api_key=${Tmdb_apiKey}`);
        if(!res.ok) throw new Error("Failed to fetch movie");
        const movie = await res.json();

        const posterPath = movie.poster_path ? `${Tmdb_Image_URL}w500${movie.poster_path}` : "";
        const backdropPath = movie.backdrop_path ? `${Tmdb_Image_URL}w1280${movie.backdrop_path}` : "";

        if(posterPath){
            posterEl.src = posterPath;
        } else {
            posterEl.src = "https://dummyimage.com/500x750/1f1f2b/f0b100&text=No+Poster";
        }

        if(backdropPath){
            hero.style.backgroundImage = `url("${backdropPath}")`;
        }

        titleEl.textContent = movie.title || "Untitled";
        document.title = `MovieDB | ${movie.title || "Movie Details"}`;

        releaseDateEl.textContent = formatDate(movie.release_date);
        runtimeEl.textContent = movie.runtime ? `${movie.runtime} min` : "--";
        ratingEl.textContent = movie.vote_average ? `${movie.vote_average.toFixed(1)} / 10` : "--";

        genreChipsEl.innerHTML = "";
        if(movie.genres && movie.genres.length){
            movie.genres.forEach((genre) => {
                const chip = document.createElement("span");
                chip.className = "chip";
                chip.textContent = genre.name;
                genreChipsEl.appendChild(chip);
            });
        }

        overviewEl.textContent = movie.overview || "No overview available.";
        originalTitleEl.textContent = movie.original_title || "--";
        languageEl.textContent = movie.original_language ? movie.original_language.toUpperCase() : "--";
        movieStatusEl.textContent = movie.status || "--";
        budgetEl.textContent = formatMoney(movie.budget);
        revenueEl.textContent = formatMoney(movie.revenue);
        popularityEl.textContent = movie.popularity ? movie.popularity.toFixed(1) : "--";

        statusEl.textContent = "Now showing";
    
    } catch(error){
        console.error(error);
        statusEl.textContent = "Could not load movie details."
        titleEl.textContent = "Something went wrong";
    } 
}

function formatDate(dateString){
    if(!dateString) return "--";
    return new Date(dateString + "T00:00:00").toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

function formatMoney(value){
    if(!value || value<=0) return "--";
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0
    }).format(value);
}