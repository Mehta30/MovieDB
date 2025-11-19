const Ombd_apiKey = "acd969b8";
const Tmbd_apiKey = "805a112b234ae9a90ef7427a5b1074a7";
const Ombd_URL = "https://www.omdbapi.com/";
const Tmbd_URL = "https://api.themoviedb.org/3/";
const input = document.querySelector(".user-search");
let output = document.querySelector("#output");
let movieName = "";
const slider = document.querySelector('.mov-slider');

function getGenreMovie(genreId) {
  return (async () => {
    const res = await fetch(`${Tmbd_URL}genre/movie/list?api_key=${Tmbd_apiKey}&language=en`);
    const allgenreId = await res.json();
    const size = allgenreId.genres.length
    for (let i = 0; i < size; i++) {
      if (allgenreId.genres[i].id === genreId) {
        return allgenreId.genres[i].name
      }
    }
  })();
}

function getGenreTv(genreId) {
    return (async () => {
    const res = await fetch(`${Tmbd_URL}genre/tv/list?api_key=${Tmbd_apiKey}&language=en`);
    const allgenreId = await res.json();
    const size = allgenreId.genres.length
    for (let i = 0; i < size; i++) {
      if (allgenreId.genres[i].id === genreId) {
        return allgenreId.genres[i].name
      }
    }
  })();

}


function getIMBD(movieName) {
  return (async () => {
    const res = await fetch(`${Ombd_URL}?apiKey=${Ombd_apiKey}&t=${movieName}`);
    const rating = await res.json();
    return rating.imdbRating;
  })();
}
function getRuntime(id) {
  return (async () => {
    const res = await fetch(`${Tmbd_URL}movie/${id}?api_key=${Tmbd_apiKey}`);
    const time = await res.json()
    return time.runtime;
  })();
}

function getYear(year) {
  const dateObj = new Date(year);
  return dateObj.getFullYear();

}

function convertMinutesToHMS(minutes) {
  let totalSeconds = Math.floor(minutes * 60);

  let hours = Math.floor(totalSeconds / 3600);
  let remainingSeconds = totalSeconds % 3600;

  let mins = Math.floor(remainingSeconds / 60);

  return `${hours}h ${mins}m`;
}


(async () => {
  const res = await fetch(`${Tmbd_URL}discover/movie?api_key=${Tmbd_apiKey}&query=&sort_by=vote_average.desc&vote_count.gte=500&with_original_language=en`);
  const Top_movieData = await res.json()
  let i = 0;
  const slides = document.querySelectorAll(".mov-slider .slide");
  for (let slide of slides) {
    let img = slide.querySelector(".img-cont");
    img.style.backgroundImage = `url(https://image.tmdb.org/t/p/w500${Top_movieData.results[i].poster_path})`;
    let top_movieName = slide.querySelector(".text-cont .mov-name");
    let top_movieInfo = slide.querySelector(".text-cont .info");
    top_movieName.innerHTML = `<strong>${Top_movieData.results[i].title}</strong>`;
    const year = getYear(Top_movieData.results[i].release_date);
    const Runtime = await getRuntime(Top_movieData.results[i].id);
    const rating = await getIMBD(Top_movieData.results[i].title);
    top_movieInfo.innerHTML = `<strong>${year} • ${convertMinutesToHMS(Runtime)} • ${rating}⭐</strong>`;

    const buttons = slide.querySelectorAll('button');
    for(let j=0;j<buttons.length;j++){
      let genre= await getGenreMovie(Top_movieData.results[i].genre_ids[j]);
      buttons[j].innerText = `${genre}`;
    };
    i++;
  };
})();



input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    movieName = input.value;
    fetch(`${Ombd_URL}?apiKey=${Ombd_apiKey}&t=${movieName}`)
      .then(response => {
        console.log(response);
        console.log(`${Ombd_URL}?apiKey=${Ombd_apiKey}&t=${movieName}`);
        return response.json();
      })
      .then(movieData => {
        if (movieData.response === "False") {
          output.innerHTML = `<p style="color:red;">No Movie found!!!<br> Enter a valid Movie Name!! :(</p>`;
          return;
        }
        console.log("Movie name --> ", movieData.Title);
        console.log("Released date --> ", movieData.Released);
        console.log("Runtime ---> ", movieData.Runtime);
        let timelength = parseInt(movieData.Runtime);
        let str = convertMinutesToHMS(timelength);
        output.innerHTML = `
        <br>
        <img src="${movieData.Poster}" alt="${movieData.Title} Poster">
        <p><strong>Movie Name:</strong> ${movieData.Title}</p>
        <p><strong>Released Date:</strong> ${movieData.Released}</p>
        <p><strong>Runtime:</strong> ${str}</p>
        <p><strong>Genre:</strong> ${movieData.Genre}</p>
        <p><strong>Director:</strong> ${movieData.Director}</p>
        <p><strong>Writer:</strong> ${movieData.Writer}</p>
        <p><strong>Actors:</strong> ${movieData.Actors}</p>
        <p><strong>Plot:</strong> ${movieData.Plot}</p>
        <p><strong>Language:</strong> ${movieData.Language}</p>
        <p><strong>Country:</strong> ${movieData.Country}</p>
        <p><strong>Awards:</strong> ${movieData.Awards}</p>
        <p><strong>IMDb Rating:</strong> ${movieData.imdbRating}</p>
        <p><strong>Box Office:</strong> ${movieData.BoxOffice}</p>`;
      })
      .catch(error => {
        console.log("some error occur :(", error);
      })
  }
});

slider.addEventListener('wheel', (event) => {
  event.preventDefault();
  slider.scrollLeft += event.deltaY;
});