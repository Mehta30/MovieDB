const apiKey="acd969b8";
const URL="https://www.omdbapi.com/";
const input=document.querySelector("#user_input");
const button=document.querySelector("#btn");
const output=document.querySelector("#output");
let movieName="";

button.addEventListener("click",()=>{
   movieName +=input.value;
fetch(`${URL}?apikey=${apiKey}&t=${movieName}`)
.then(response => {
    console.log(response);  
    return response.json(); 
})
.then(movieData=>{
    if (movieData.length === 0) {
      output.innerHTML = `<p style="color:red;">No city found!!!<br> Enter a valid city!! :(</p>`;
      return;
    }
    console.log("Movie name --> ",movieData.Title);
    console.log("Released date --> ",movieData.Released);
    console.log("Runtime ---> ",movieData.Runtime);
})
.catch(error =>{
   console.log("some error occur :(",error);
})

});