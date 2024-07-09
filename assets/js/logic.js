const APIKey = "50ed25e94a50cae769760c988183a9a5";



// http://api.openweathermap.org/geo/1.0/direct?q={city name}&limit=5&appid={API key};
let citiesList = JSON.parse(localStorage.getItem("citiesList"));

let searchedCities = [];
let weatherArray = [];


function handleSearch(event) {

    event.preventDefault();

    let cityName = $("#cityName").val();
    getWeatherInfo(cityName);
    if(!searchedCities.includes(cityName)){
        $('#cityList').append(`<button type="button" class="btn cityButton" style="background-color:#DFDFDF;">${cityName}</button>`);
        $(".cityButton").click(handleCityButton);
    }


    $("#cityName").val('');


}

function getWeatherInfo(cityName) {
    const apiUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${APIKey}`;

    fetch(apiUrl)
    .then(function(response){
        return response.json();
    })
    .then(function(result) {
        let coords = [result[0].lat, result[0].lon]
        return coords;

    })
    .then(function(result) {
        let lat = result[0];
        let lon = result[1];
        const newApiUrlCurrent = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${APIKey}`;
        const newApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${APIKey}`;
        const promises = [newApiUrlCurrent, newApiUrl].map(url => fetch(url));
        return Promise.all(promises);
    })
    .then(function(response) {
        return Promise.all(response.map(response => response.json()));
    })
    .then(function(response) {
        weatherArray = response;
     //   console.log(weatherArray);
        renderWeatherInfo();


        if(!searchedCities.includes(weatherArray[0].name)) {
            searchedCities.push(weatherArray[0].name);
            localStorage.setItem("citiesList", JSON.stringify(searchedCities));
        }

    })
    .catch((error) =>{
        console.log("Error: ", error);
        renderErrorMessage();
    })

}


function renderErrorMessage(){
    $("#currentDisplay").html('<h3>Whoops...something went wrong!<h3>');
    $("#futureDisplay").html('');
}

function handleCityButton(event){
    getWeatherInfo(event.target.innerHTML);
    
}

function renderButtons() {
    for(const city of searchedCities) {
        $('#cityList').append(`<button type="button" class="btn cityButton" style="background-color:#DFDFDF;">${city}</button>`);
        $(".cityButton").click(handleCityButton);
    }

}

function pickIcon(condition) {
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



function getAverageTemp(start, stop){
    if(stop>40) {
        stop = 40;
    }
    let temp = 0;
    for(let i = start; i<stop; i++) {
        temp+=weatherArray[1]["list"][start]["main"].temp;
    }
    temp/=(stop-start);

    return Math.round(temp * 100) / 100;

}
function getAverageWind(start, stop){
    if(stop>40) {
        stop = 40;
    }
    let wind = 0;
    for(let i = start; i<stop; i++) {
        wind+=weatherArray[1]["list"][start]["wind"].speed;
    }
    wind/=(stop-start);

    return Math.round(wind * 100) / 100;

}
function getAverageHum(start, stop){
    if(stop>40) {
        stop = 40;
    }
    let hum = 0;
    for(let i = start; i<stop; i++) {
        hum+=weatherArray[1]["list"][start]["main"].humidity;
    }
    hum/=(stop-start);

    return Math.round(hum * 100) / 100;

}



function renderWeatherInfo() {
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

    let breakpoint = weatherArray[1]["list"].findIndex((element) => element.dt_txt.substring(11) == "00:00:00");
    $('#futureDisplay').html('');
    for(let i = 0; i<5;i++) {
        console.log(getAverageTemp(breakpoint,breakpoint+8));
        $('#futureDisplay').append(`
            <div class="card mx-1 col-md-2 col-sm-6 text-light text-center" style="background-color: #16223F">
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
    $("#searchButton").click(handleSearch);

    if( citiesList !== null) {
        searchedCities = citiesList;
    }

    renderButtons();
});