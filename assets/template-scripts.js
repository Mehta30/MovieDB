const Tmdb_apiKey = "805a112b234ae9a90ef7427a5b1074a7";
const Tmdb_URL = "https://api.themoviedb.org/3/";
const Tmdb_Image_URL = "https://image.tmdb.org/t/p/";

const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get("id");

fetch(`${Tmdb_URL}movie/${movieId}?api_key=${Tmdb_apiKey}`)
.then(res => res.json());

setupMovieInfo();
// backdrop.style.backgroundImage = `url("https://api.themoviedb.org/3/movie/${movieId}?api_key=${Tmdb_apiKey}")`;

async function setupMovieInfo(){
    const movie = await fetch(`${Tmdb_URL}movie/${movieId}?api_key=${Tmdb_apiKey}`);
    const json = await movie.json();
    const backdrop = document.querySelector(".backdrop");
    // backdrop.style.backgroundImage = await `url("${Tmdb_Image_URL}w1280${json.backdrop_path}")`;
    const im = document.querySelector(".myimg");
    im.src = await `${Tmdb_Image_URL}w1280${json.backdrop_path}`;
    const movTitle = document.querySelector(".mov-title");
    movTitle.textContent = await json.title;
}