const apiKey = "acd969b8";
const URL = "https://www.omdbapi.com/";
const input = document.querySelector(".user-search");
let output = document.querySelector("#output");
let movieName = "";
const slider = document.querySelector('.mov-slider');

function convertMinutesToHMS(minutes) {
  let totalSeconds = Math.floor(minutes * 60);

  let hours = Math.floor(totalSeconds / 3600);
  let remainingSeconds = totalSeconds % 3600;

  let mins = Math.floor(remainingSeconds / 60);

  return `${hours}h ${mins}m`;
}


input.addEventListener("keydown", (event) => {
  if(event.key === "Enter"){
  movieName = input.value;
  fetch(`${URL}?apikey=${apiKey}&t=${movieName}`)
    .then(response => {
      console.log(response);
      console.log(`${URL}?apikey=${apiKey}&t=${movieName}`);
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
      let timelength=parseInt(movieData.Runtime); 
      let str=convertMinutesToHMS(timelength);
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