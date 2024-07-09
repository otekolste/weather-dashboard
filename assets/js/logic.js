const APIKey = "50ed25e94a50cae769760c988183a9a5";



// http://api.openweathermap.org/geo/1.0/direct?q={city name}&limit=5&appid={API key};
let citiesList = JSON.parse(localStorage.getItem("citiesList")); // Retrieve stored list of cities

let searchedCities = [];
let weatherArray = [];


function handleSearch(event) {

    event.preventDefault();

    let cityName = $("#cityName").val(); // Get the city name inputted by the user
    getWeatherInfo(cityName); // Retrieve and display info
    if(!searchedCities.includes(cityName)){ // Check if the city name is already in our array
        $('#cityList').append(`<button type="button" class="btn cityButton" style="background-color:#DFDFDF;">${cityName}</button>`); // Appends button if not
        $(".cityButton").click(handleCityButton); // Assigns button function
    }


    $("#cityName").val(''); // Clears form input field


}

function getWeatherInfo(cityName) {
    const apiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${APIKey}`;

    fetch(apiUrl)
    .then(function(response){
        return response.json(); // Fetches response, and converts to JSON format
    })
    .then(function(result) {
        let coords = [result[0].lat, result[0].lon] // Retrieves latitude and longitude coordinates 
        return coords;

    })
    .then(function(result) {  //  Takes coordinates, and makes 2 fetch requests: 1 for the present data, and 1 for the 5-day forecast data
        let lat = result[0];
        let lon = result[1];
        const newApiUrlCurrent = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${APIKey}`;
        const newApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${APIKey}`;
        const promises = [newApiUrlCurrent, newApiUrl].map(url => fetch(url));
        return Promise.all(promises);
    })
    .then(function(response) { // Takes responses and converts them into JSON format
        return Promise.all(response.map(response => response.json()));
    })
    .then(function(response) {
        weatherArray = response; // Stores the info in a local array
        renderWeatherInfo(); // Renders weather info


        if(!searchedCities.includes(weatherArray[0].name)) { // Checks for duplicate city names in stored array
            searchedCities.push(weatherArray[0].name); // If there are no duplicates, adds to array of searched city names
            localStorage.setItem("citiesList", JSON.stringify(searchedCities)); // Updates array of city names in local storage
        }

    })
    .catch((error) =>{
        console.log("Error: ", error); // Displays error in console
        renderErrorMessage();
    })

}


function renderErrorMessage(){
    $("#currentDisplay").html('<h3>Whoops...something went wrong!<h3>'); // Displays error message in HTML
    $("#futureDisplay").html('');
}

function handleCityButton(event){
    getWeatherInfo(event.target.innerHTML); // Makes fetch request using the HTML content of the button, which is the city name
    
}

function renderButtons() {
    for(const city of searchedCities) { // Iterates through stored city names and renders button list
        $('#cityList').append(`<button type="button" class="btn cityButton" style="background-color:#DFDFDF;">${city}</button>`);
        $(".cityButton").click(handleCityButton);
    }

}

function pickIcon(condition) { // Checks the 'condition' variable from the array of weather data, and picks the corresponding icon
    if(condition == 800) {
        return '<i class="fa-regular fa-sun"></i>';
    }
    else if(condition > 800) {
        return '<i class="fa-solid fa-cloud"></i>';
    }
    else if(condition > 700) {
        return '<i class="fa-solid fa-smog"></i>';
    }
    else if(condition >= 600) {
        return '<i class="fa-solid fa-snowflake"></i>';
    }
    else if(condition >= 300) {
        return '<i class="fa-solid fa-cloud-rain"></i>';
    }
    else if(condition>= 200) {
        return '<i class="fa-solid fa-cloud-bolt"></i>';
    }
    else{
        return 'Error rendering icon';
    }


}



function getAverageTemp(start, stop){ // Retrieves average temperature across set number of days
    if(stop>40) { // Caps the last value at 40, as the 5-day-forecast returns 40 values
        stop = 40;
    }
    let temp = 0;
    for(let i = start; i<stop; i++) { // Iterates through array of weather data, from the given points, and adds temperatures up
        temp+=weatherArray[1]["list"][start]["main"].temp;
    }
    temp/=(stop-start); // Divides aggregate value by number of values

    return Math.round(temp * 100) / 100; // Rounds to 2 decimal places

}
function getAverageWind(start, stop){ 
    if(stop>40) { // Caps the last value at 40, as the 5-day-forecast returns 40 values
        stop = 40;
    }
    let wind = 0;
    for(let i = start; i<stop; i++) { // Iterates through array of weather data, from the given points, and adds wind speeds up
        wind+=weatherArray[1]["list"][start]["wind"].speed;
    }
    wind/=(stop-start); // Divides aggregate value by number of values

    return Math.round(wind * 100) / 100; // Rounds to 2 decimal places

}
function getAverageHum(start, stop){ // Retrieves average humidity across set number of days
    if(stop>40) { // Caps the last value at 40, as the 5-day-forecast returns 40 values
        stop = 40;
    }
    let hum = 0;
    for(let i = start; i<stop; i++) { // Iterates through array of weather data, from the given points, and adds humidities up
        hum+=weatherArray[1]["list"][start]["main"].humidity;
    }
    hum/=(stop-start); // Divides aggregate value by number of values

    return Math.round(hum * 100) / 100; // Rounds to 2 decimal places

}



function renderWeatherInfo() {
    // Displays current weather data in HTML
    $('#currentDisplay').html(` 
        <h3 class="mt-2">${weatherArray[0].name} (${dayjs.unix(weatherArray[0].dt).format("MM/D/YYYY")}) ${pickIcon(weatherArray[0]["weather"][0].id)}
</h3>
        <ul class="list-unstyled fs-5">
            <li class="my-2">Temp: ${weatherArray[0]["main"].temp}</li>
            <li class="my-2">Wind: ${weatherArray[0]["wind"].speed} MPH</li>
            <li class="my-2">Humidity: ${weatherArray[0]["main"].humidity}%</li>

        </ul>
        `
    );
    // Displays future weather data in HTML, using the average value for temperature, humidity, and wind speed for each of the 5 days
    let breakpoint = weatherArray[1]["list"].findIndex((element) => element.dt_txt.substring(11) == "00:00:00"); // Finds the index of the first set of data occurring on the NEXT day
    $('#futureDisplay').html('');
    for(let i = 0; i<5;i++) {
        console.log(getAverageTemp(breakpoint,breakpoint+8));
        $('#futureDisplay').append(`
            <div class="card mx-1 col-lg-2 col-md-5 col-sm-10 text-light text-center" style="background-color: #16223F">
                <div class="card-body">
                    <h4>${weatherArray[1]["list"][breakpoint].dt_txt.substring(0,11)}</h4>
                    ${pickIcon(weatherArray[1]["list"][i]["weather"][0].id)}
                    <ul class="list-unstyled fs-5">
                        <li class="my-2">Temp: ${getAverageTemp(breakpoint, breakpoint+8)}</li>
                        <li class="my-2">Wind: ${getAverageWind(breakpoint, breakpoint+8)} MPH</li>
                        <li class="my-2">Humidity: ${getAverageHum(breakpoint, breakpoint+8)}%</li>                        
                    </ul>
                </div> 
            </div>`);
        breakpoint+=8;


    }

}


$(document).ready(function(){
    $("#searchButton").click(handleSearch); //  Attach function to search button

    if( citiesList !== null) { // If a list of cities was retrieved (not null) from local storage, stores that data in local array
        searchedCities = citiesList;
    }

    renderButtons(); // Render the saved search history data
});