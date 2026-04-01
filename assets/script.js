const Omdb_apiKey = "acd969b8";
const Tmdb_apiKey = "805a112b234ae9a90ef7427a5b1074a7";
const Omdb_URL = "https://www.omdbapi.com/";
const Tmdb_URL = "https://api.themoviedb.org/3/";
const Tmdb_Image_URL = "https://image.tmdb.org/t/p/"
const searchbar = document.querySelector(".searchbar");
let resDiv = document.querySelector(".srch-suggestions");
let output = document.querySelector(".spotlight-box");
let movieName = "";
const slider = document.querySelector('.mov-slider');
const genreMap = {};
let genreBox = document.querySelector('.genre-box');

function openMoviePage(movieId) {
  if (!movieId) return;
  window.open(`movie.html?id=${movieId}`, "_blank");
}

function getIMBD(movieName){
  return (async () => {
      const res = await fetch(`${Omdb_URL}?apiKey=${Omdb_apiKey}&t=${movieName}`);
      const rating = await res.json();
      return rating.imdbRating;
  })();
}
function getRuntime(id){
  return (async () => {
    const res = await fetch(`${Tmdb_URL}movie/${id}?api_key=${Tmdb_apiKey}`);
    const time=await res.json()
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
  const res = await fetch(`${Tmdb_URL}discover/movie?api_key=${Tmdb_apiKey}&query=&sort_by=vote_average.desc&vote_count.gte=600&with_original_language=en`);
  const Top_movieData = await res.json();
  const genreData = await fetch(`${Tmdb_URL}genre/movie/list?api_key=${Tmdb_apiKey}&language=en'`)
  .then(res => res.json());
  for (genre of genreData.genres){
    genreMap[genre.id] = genre.name;
  }
  let i = 0;
  const slides = document.querySelectorAll(".mov-slider .slide");
  for (let slide of slides) {
    slide.dataset.movieId = Top_movieData.results[i].id;
    slide.classList.add("clickable-movie");
    let img = slide.querySelector(".img-cont");
    img.style.backgroundImage = `url(https://image.tmdb.org/t/p/w500${Top_movieData.results[i].poster_path})`;
    let top_movieName = slide.querySelector(".text-cont .mov-name");
    let top_movieInfo = slide.querySelector(".text-cont .info");
    top_movieName.innerText = `${Top_movieData.results[i].title}`;
    const year = getYear(Top_movieData.results[i].release_date);
    const Runtime= await getRuntime(Top_movieData.results[i].id);
    const rating= await getIMBD(Top_movieData.results[i].title);
    top_movieInfo.innerHTML = `<span>${year} • ${convertMinutesToHMS(Runtime)} • ${rating}<i class="bx bxs-star"></i></span>`;
    let currB = document.querySelector(`.slide${i+1} .text-cont`)
    let j = 0;
    for (let id of Top_movieData.results[i].genre_ids){
      if (j>=2){
        break;
      }
      currB.insertAdjacentHTML("beforeend",
        `<button>${genreMap[id]}</button>`
      )
      j++;
    }
    i++;
  };

})();

slider.addEventListener("click", (event) => {
  // if user dragged, don't open movie page
  if (sliderDragDistance > DRAG_THRESHOLD) {
    event.preventDefault();
    sliderDragDistance = 0;
    return;
  }

  const movieCard = event.target.closest(".slide");
  if (!movieCard || !slider.contains(movieCard)) return;
  openMoviePage(movieCard.dataset.movieId);
});

// ---------- Spotlight Carousel + Clickable Dots ----------
const dotsWrap = document.querySelector(".spotlight-dots");
let dots = [];
let currentIndex = 0;
let slideWidth = 0;
let autoPlayId = null;

function setActiveDot(nextIndex) {
  dots.forEach((dot, i) => dot.classList.toggle("active", i === nextIndex));
}

function goToSpotlight(index) {
  setActiveDot(index);
  output.scrollTo({
    left: slideWidth * index,
    behavior: "smooth"
  });
}

function initSpotlightDots(totalSlides) {
  dotsWrap.innerHTML = "";

  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "dot";
    dot.setAttribute("aria-label", `Go to slide ${i + 1}`);

    dot.addEventListener("click", () => {
      currentIndex = i;
      goToSpotlight(currentIndex);
    });

    dotsWrap.appendChild(dot);
  }

  dots = Array.from(dotsWrap.querySelectorAll(".dot"));
  currentIndex = 0;
  goToSpotlight(0);

  if (autoPlayId) clearInterval(autoPlayId);
  autoPlayId = setInterval(() => {
    currentIndex = (currentIndex + 1) % totalSlides;
    goToSpotlight(currentIndex);
  }, 8000);
}

// fetch spotlight slides
fetch(`${Tmdb_URL}discover/movie?api_key=${Tmdb_apiKey}&sort_by=popularity.desc&vote_count.gte=200`)
  .then(res => res.json())
  .then(async (json) => {
    output.innerHTML = ""; // clear old slides if any

    const spotlightMovies = json.results.slice(0, 3);

    for (const movie of spotlightMovies) {
      const runtime = await getRuntime(movie.id);
      const formatted_date = new Date(movie.release_date + "T00:00:00").toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });

      output.insertAdjacentHTML(
        "beforeend",
        `<div class="spotlight-slide" data-movie-id="${movie.id}">
          <div class="text-cont">
            <p><strong>${movie.title}</strong></p>
            <p><i class="bx bx-time-five"></i> ${convertMinutesToHMS(runtime)}</p>
            <p><i class="bx bx-calendar"></i> ${formatted_date}</p>
          </div>
          <div class="img-cont">
            <img src="${Tmdb_Image_URL}w1280${movie.backdrop_path}" alt="${movie.title}">
          </div>
        </div>`
      );
    }

    output.addEventListener("click", (event) => {
      const slide = event.target.closest(".spotlight-slide");
      if (!slide || !output.contains(slide)) return;
      openMoviePage(slide.dataset.movieId);
    });

    const slides = output.querySelectorAll(".spotlight-slide");
    if (!slides.length) return;

    slideWidth = slides[0].getBoundingClientRect().width;
    initSpotlightDots(slides.length);

    // keep width correct on resize
    window.addEventListener("resize", () => {
      slideWidth = slides[0].getBoundingClientRect().width;
      goToSpotlight(currentIndex);
    });
  })
  .catch(err => console.error(err));


// input.addEventListener("keydown", (event) => {
//   if (event.key === "Enter") {
//     movieName = input.value;
//     fetch(`${Ombd_URL}?apiKey=${Ombd_apiKey}&t=${movieName}`)
//       .then(response => {
//         console.log(response);
//         console.log(`${Ombd_URL}?apiKey=${Ombd_apiKey}&t=${movieName}`);
//         return response.json();
//       })
//       .then(movieData => {
//         if (movieData.response === "False") {
//           output.innerHTML = `<p style="color:red;">No Movie found!!!<br> Enter a valid Movie Name!! :(</p>`;
//           return;
//         }
//         console.log("Movie name --> ", movieData.Title);
//         console.log("Released date --> ", movieData.Released);
//         console.log("Runtime ---> ", movieData.Runtime);
//         let timelength = parseInt(movieData.Runtime);
//         let str = convertMinutesToHMS(timelength);
//         output.innerHTML = `
//         <br>
//         <img src="${movieData.Poster}" alt="${movieData.Title} Poster">
//         <p><strong>Movie Name:</strong> ${movieData.Title}</p>
//         <p><strong>Released Date:</strong> ${movieData.Released}</p>
//         <p><strong>Runtime:</strong> ${str}</p>
//         <p><strong>Genre:</strong> ${movieData.Genre}</p>
//         <p><strong>Director:</strong> ${movieData.Director}</p>
//         <p><strong>Writer:</strong> ${movieData.Writer}</p>
//         <p><strong>Actors:</strong> ${movieData.Actors}</p>
//         <p><strong>Plot:</strong> ${movieData.Plot}</p>
//         <p><strong>Language:</strong> ${movieData.Language}</p>
//         <p><strong>Country:</strong> ${movieData.Country}</p>
//         <p><strong>Awards:</strong> ${movieData.Awards}</p>
//         <p><strong>IMDb Rating:</strong> ${movieData.imdbRating}</p>
//         <p><strong>Box Office:</strong> ${movieData.BoxOffice}</p>`;
//       })
//       .catch(error => {
//         console.log("some error occur :(", error);
//       })
//   }
// });

let debounceTimer;

function formatReleaseDate(releaseDate){
  if(!releaseDate) return "Release date N/A";
  return new Date(releaseDate + "T00:00:00").toLocaleDateString("en-US", {
    year:"numeric",
    month: "short",
    day: "numeric"
  });
}

function renderSearchState(message, type=""){
  resDiv.innerHTML = `<div class="srch-state ${type}">${message}</div>`;
}

searchbar.addEventListener("input", (event) => {
  const query = event.target.value.trim();
  clearTimeout(debounceTimer);
  if(query.length <= 3){
    resDiv.innerHTML = "";
    return;
  }
  debounceTimer = setTimeout(async () => {
    try{
      renderSearchState("Searching...");
      const res = await fetch(`${Tmdb_URL}search/movie?api_key=${Tmdb_apiKey}&query=${encodeURIComponent(query)}`);
      const json = await res.json();
      const results = (json.results || []).filter((m) => m.title).slice(0, 5);
      if(!results.length){
        renderSearchState("No movies found for this search.");
        return;
      }
      resDiv.innerHTML = "";
      for(const movie of results){
        const posterUrl = movie.poster_path ? `${Tmdb_Image_URL}w92${movie.poster_path}` : "https://dummyimage.com/92x138/1f1f2b/f0b100&text=No+Image";
        const formattedDate = formatReleaseDate(movie.release_date);
        resDiv.insertAdjacentHTML("beforeend",
          `<a href="movie.html?id=${movie.id}" target="_blank">
            <div class="entry-card">
              <div><img src="${posterUrl}" alt="${movie.title} poster"></div>
              <div class="text-cont">
                <p class="title">${movie.title}</p>
                <p class="date">${formattedDate}</p>
              </div>
            </div>
          </a>`
        );
      }
    } catch(err){
      console.error(err);
      renderSearchState("Something went wrong. try again.", "error");
    }
  }, 350);
});

// slider.addEventListener('wheel', (event) => {
//   event.preventDefault();
//   slider.scrollLeft += event.deltaY;
// });

let isDown = false;
let startX;
let scrollLeftStart;
let sliderDragDistance = 0;
const DRAG_THRESHOLD = 8;

slider.addEventListener("mousedown", (e) => {
  isDown = true;
  startX = e.pageX - slider.offsetLeft;
  scrollLeftStart = slider.scrollLeft;
  sliderDragDistance = 0;
});

slider.addEventListener("mousemove", (e) => {
  if (!isDown) return;
  e.preventDefault();

  const x = e.pageX - slider.offsetLeft;
  const walk = x - startX;
  sliderDragDistance = Math.max(sliderDragDistance, Math.abs(walk)); // track drag amount
  slider.scrollLeft = scrollLeftStart - walk;
});

slider.addEventListener("mouseup", () => {
  isDown = false;
});

slider.addEventListener("mouseleave", () => {
  isDown = false;
});

const genreButtons = document.querySelectorAll(".genre-filter");
genreButtons.forEach((btn) => {
  btn.addEventListener("click", changeActive);
});

function changeActive(){
  const currentGenreActive = document.querySelector(".genre-bar .genre-filter.active");
  if(currentGenreActive){
    currentGenreActive.classList.remove("active");
  }
  this.classList.add("active");
  genreBox.innerHTML = ""
  if(this.innerText == "All"){
    fetch(`${Tmdb_URL}discover/movie?api_key=${Tmdb_apiKey}&query=&sort_by=vote_average.desc&vote_count.gte=600&with_original_language=en`)
    .then(res => res.json())
    .then(json => {
      console.log(json.results)
      for(let data of json.results){
        genreBox.insertAdjacentHTML("beforeend", 
          `<div class="slide clickable-movie" data-movie-id="${data.id}">
            <div class="img-cont" style="background-image: url('https://image.tmdb.org/t/p/w500${data.poster_path}')">
            </div>
            <div class="text-cont">
              <p class="mov-name">${data.title}</p>
            </div>
          </div>` 
        );
      }
    });
  }
  else if(this.innerText == "Sci-Fi"){
    fetch(`${Tmdb_URL}discover/movie?api_key=${Tmdb_apiKey}&sort_by=popularity.desc&with_genres=${Object.keys(genreMap).find(key => genreMap[key] === "Science Fiction")}&vote_count.gte=200`)
    .then(res => res.json())
    .then(json => {console.log(json.results)
      for(let data of json.results){
        genreBox.insertAdjacentHTML("beforeend", 
          `<div class="slide clickable-movie" data-movie-id="${data.id}">
            <div class="img-cont" style="background-image: url('https://image.tmdb.org/t/p/w500${data.poster_path}')">
            </div>
            <div class="text-cont">
              <p class="mov-name">${data.title}</p>
            </div>
          </div>` 
        );
      }
    });
  }
  else{
    fetch(`${Tmdb_URL}discover/movie?api_key=${Tmdb_apiKey}&sort_by=popularity.desc&with_genres=${Object.keys(genreMap).find(key => genreMap[key] === this.innerText)}&vote_count.gte=200`)
    .then(res => res.json())
    .then(json => {console.log(json.results)
      for(let data of json.results){
        genreBox.insertAdjacentHTML("beforeend", 
          `<div class="slide clickable-movie" data-movie-id="${data.id}">
            <div class="img-cont" style="background-image: url('https://image.tmdb.org/t/p/w500${data.poster_path}')">
            </div>
            <div class="text-cont">
              <p class="mov-name">${data.title}</p>
            </div>
          </div>` 
        );
      }
    });
  }
}

genreBox.addEventListener("click", (event) => {
  const movieCard = event.target.closest(".slide");
  if (!movieCard || !genreBox.contains(movieCard)) return;
  openMoviePage(movieCard.dataset.movieId);
});

// document.querySelectorAll(".genre-filter").forEach(btn => 
//   btn.addEventListener("click", changeActive)
// );

// function changeActive() {
//   document.querySelector(".active").classList.remove("active");
//   this.classList.add("active");
//   genreBox.innerHTML = "";
//   if(this.innerText == "All"){
//     fetch(`${Tmdb_URL}discover/movie?api_key=${Tmdb_apiKey}&query=&sort_by=vote_average.desc&vote_count.gte=600&with_original_language=en`)
//     .then(res => res.json())
//     .then(json => {
//       console.log(json.results)
//       for(let data of json.results){
//         genreBox.insertAdjacentHTML("beforeend", 
//           `<div class="slide">
//             <div class="img-cont" style="background-image: url('https://image.tmdb.org/t/p/w500${data.poster_path}')">
//             </div>
//             <div class="text-cont">
//               <p class="mov-name">${data.title}</p>
//             </div>
//           </div>` 
//         );
//       }
//     });
//   }
//   else if(this.innerText == "Sci-Fi"){
//     fetch(`${Tmdb_URL}discover/movie?api_key=${Tmdb_apiKey}&sort_by=popularity.desc&with_genres=${Object.keys(genreMap).find(key => genreMap[key] === "Science Fiction")}&vote_count.gte=200`)
//     .then(res => res.json())
//     .then(json => {console.log(json.results)
//       for(let data of json.results){
//         genreBox.insertAdjacentHTML("beforeend", 
//           `<div class="slide">
//             <div class="img-cont" style="background-image: url('https://image.tmdb.org/t/p/w500${data.poster_path}')">
//             </div>
//             <div class="text-cont">
//               <p class="mov-name">${data.title}</p>
//             </div>
//           </div>` 
//         );
//       }
//     });
//   }
//   else{
//     fetch(`${Tmdb_URL}discover/movie?api_key=${Tmdb_apiKey}&sort_by=popularity.desc&with_genres=${Object.keys(genreMap).find(key => genreMap[key] === this.innerText)}&vote_count.gte=200`)
//     .then(res => res.json())
//     .then(json => {console.log(json.results)
//       for(let data of json.results){
//         genreBox.insertAdjacentHTML("beforeend", 
//           `<div class="slide">
//             <div class="img-cont" style="background-image: url('https://image.tmdb.org/t/p/w500${data.poster_path}')">
//             </div>
//             <div class="text-cont">
//               <p class="mov-name">${data.title}</p>
//             </div>
//           </div>` 
//         );
//       }
//     });
//   }
// }



// const moveSpotlight = (index) => {
//   let slideWidth = slides[0].getBoundingClientRect().width;
//   TrackEvent.scrollTo({
//     left: slideWidth * index,
//     behaviour: "smooth"
//   });
//   currentIndex = index;
// }

// function moveSpotlight(slides, slideWidth, index){
//   if (index === slides){
//     output.scrollTo({
//       left: slideWidth*(slides-1),
//       behaviour: "smooth"
//     });
//   }
//   else{
//     output.scrollTo({
//       right: slideWidth*index,
//       behaviour: "smooth"
//     });
//   }
// }
  
// slide0 = document.querySelector(".spotlight-slide");
//   slideWidth = slide0.getBoundingClientRect().width;
//   output.scrollTo({
//     left: slideWidth * index,
//     behavior: 'smooth'
//   });

// function moveSpotlight(total, index, slideWidth){
//   if (total === index){
//     index=0;
//   }
//   output.scrollTo({
//     left: slideWidth*index,
//     behavior: "smooth"
//   });
// }

// const dots = document.querySelectorAll(".dot");
// const moveSpotlight =  function() {
//   let index = 0;
//   return function(total, slideWidth){
//     dots[index].style.backgroundColor = "white";
//     index++;
//     if (index >= total){
//       index = 0;
//     }
//     dots[index].style.backgroundColor = "red";
//     output.scrollTo({
//       left: slideWidth*index,
//       behavior: "smooth"
//     });
//   }
// }();

// document.querySelector(".active").click();

// fetch(`${Tmdb_URL}genre/movie/list?api_key=${Tmdb_apiKey}&language=en'`)
// .then(res => res.json())
// .then(json => {
//   console.log(json.genres);
// });

// fetch(`${Tmdb_URL}discover/movie?api_key=${Tmdb_apiKey}&sort_by=popularity.desc&with_genres=28&vote_count.gte=200`)
// .then(res => res.json())
// .then(json => {console.log(json)});

document.querySelector(".genre-bar .genre-filter.active")?.click();