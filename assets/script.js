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
  const Top_movieData = await res.json()
  let i = 0;
  const slides = document.querySelectorAll(".mov-slider .slide");
  for (let slide of slides) {
    let img = slide.querySelector(".img-cont");
    img.style.backgroundImage = `url(https://image.tmdb.org/t/p/w500${Top_movieData.results[i].poster_path})`;
    let top_movieName = slide.querySelector(".text-cont .mov-name");
    let top_movieInfo = slide.querySelector(".text-cont .info");
    top_movieName.innerText = `${Top_movieData.results[i].title}`;
    const year = getYear(Top_movieData.results[i].release_date);
    const Runtime= await getRuntime(Top_movieData.results[i].id);
    const rating= await getIMBD(Top_movieData.results[i].title);
    top_movieInfo.innerText = `${year} • ${convertMinutesToHMS(Runtime)} • ${rating}⭐`;
    console.log(Top_movieData.results[i].title);
    i++;
  };

})();

fetch(`${Tmdb_URL}discover/movie?api_key=${Tmdb_apiKey}&sort_by=popularity.desc&vote_count.gte=200`)
.then(res => res.json())
.then(json => {
  let count=0;
  for (i in json.results){
    if (count>=3){
      break;
    }
    output.insertAdjacentHTML("beforeend",
      `<div class="spotlight-slide">
        <div class="text-cont">
          <p>${json.results[i].title}</p>
        </div>
        <div class="img-cont">
          <img src="${Tmdb_Image_URL}w1280${json.results[i].backdrop_path}">
        </div>
      </div`
    );
    count++;
  }
  let slideWidth = document.querySelector(".spotlight-slide").getBoundingClientRect().width;
  setInterval(() => {moveSpotlight(3, slideWidth);}, 8000);
  // console.log(json);
  // output.innerHTML =
  //   `<div class="text-cont">
  //     <p>${json.results[0].title}</p>
  //   </div>
  //   <div class="img-cont">
  //     <img src="${Tmdb_Image_URL}w1280${json.results[0].backdrop_path}">
  //   </div>`
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
searchbar.addEventListener("input", (event) => {
  if(event.target.value.length >= 3){
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      fetch(`${Tmdb_URL}search/movie?api_key=${Tmdb_apiKey}&query=${encodeURIComponent(searchbar.value)}`)
      .then(res => res.json())
      .then(json => {
        resDiv.innerHTML = "";
        let count=0;
        for (i in json.results){
          if (count>=5){
            break;
          }
          let poster_url = "";
          console.log(json.results[i])
          if (json.results[i].poster_path){
            poster_url = `${Tmdb_Image_URL}w92${json.results[i].poster_path}`;
          }
          else{
            poster_url = "https://dummyimage.com/185x278/c0ffee/c001ad";
          }
          const formatted_date = new Date(json.results[i].release_date + "T00:00:00").toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
          });
          resDiv.insertAdjacentHTML("beforeend", 
            `<div class="entry-card">
              <div><img src="${poster_url}"></div>
              <div class="text-cont">
                <p><strong>${json.results[i].title}</strong></p>
                <p>${formatted_date}</p>
              </div>
            </div`
          );
          count+=1;
        }
        resDiv.insertAdjacentHTML("beforeend", 
          "<p style='font-size: 24px;'>View all</p>"
        );
      })
      .catch(err => console.error(err));    
    }, 500);
        
  }
  else{
    resDiv.innerHTML="";
  }
});

slider.addEventListener('wheel', (event) => {
  event.preventDefault();
  slider.scrollLeft += event.deltaY;
});

document.querySelectorAll(".genre-filter").forEach(btn => 
  btn.addEventListener("click", changeActive)
);

function changeActive() {
  document.querySelector(".active").classList.remove("active");
  this.classList.add("active");
}

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

const moveSpotlight =  function() {
  let index = 0;
  return function(total, slideWidth){
    index++;
    if (index >= total){
      index = 0;
    }
    output.scrollTo({
      left: slideWidth*index,
      behavior: "smooth"
    });
  }
}();
