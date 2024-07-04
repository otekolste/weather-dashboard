const APIKey = "50ed25e94a50cae769760c988183a9a5";

// http://api.openweathermap.org/geo/1.0/direct?q={city name}&limit=5&appid={API key};
let weatherData = JSON.parse(localStorage.getItem("weatherData"));

let cumulativeData = [];
let weatherArray = [];

function handleSearch(event) {

    event.preventDefault();

    let cityName = $("#cityName").val();
    getWeatherInfo(cityName);
    $('#cityList').append(`<button type="button" class="btn cityButton" style="background-color:#DFDFDF;">${cityName}</button>`);
    $(".cityButton").click(handleCityButton);

}

function getWeatherInfo(cityName) {
    const apiUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${APIKey}`;

    fetch(apiUrl)
    .then(function(response){
        if(response.ok) {
            return response.json();
        }
        else {
            console.log(":'(((");
        }
    }) 
    .then(function(result) {
        let coords = [result[0].lat, result[0].lon]
        return coords;

    })
    .then(function(result) {
        console.log(result);
        let lat = result[0];
        let lon = result[1];
        const newApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${APIKey}`;
        return fetch(newApiUrl);
    })
    .then(function(response) {
        if(response.ok) {
            console.log(":D")
            return response.json();
        }
        else{
            console.log("NO");
        }
    })
    .then(function(result) {
        console.log(result);
        weatherArray = result;

        cumulativeData.push(weatherArray);
        localStorage.setItem("weatherData", JSON.stringify(cumulativeData));

        renderWeatherInfo();

    })
    /*
    .then(function (result){
        console.log(result);
      //  weatherArray = result;
       // renderWeatherInfo();
       let groupedArray = [];

       let breakpoint = result["list"].findIndex((element) => element.dt_txt.substring(11) == "00:00:00");
     //  console.log(breakpoint);
        let weatherObj = {
            temp:0,
            wind:0,
            humidity:0,

        }

        for(let i = 0; i<breakpoint;i++) {

        }







    })
        */

}

function handleCityButton(event){
    weatherArray = cumulativeData.find((element) => element["city"].name == event.target.innerHTML);
    renderWeatherInfo();
    
}

function renderButtons() {
    for(const obj of cumulativeData) {
        $('#cityList').append(`<button type="button" class="btn cityButton">${obj["city"].name}</button>`);
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



function renderWeatherInfo() {
    $('#currentDisplay').html(`
        <h3>${weatherArray["city"].name} (${dayjs.unix(weatherArray["list"][0].dt).format("MM/D/YYYY")}) ${pickIcon(weatherArray["list"][0]["weather"][0].id)}
</h3>
        <ul class="list-unstyled fs-5">
            <li>Temp: ${weatherArray["list"][0]["main"].temp}</li>
            <li>Wind: ${weatherArray["list"][0]["wind"].speed} MPH</li>
            <li>Humidity: ${weatherArray["list"][0]["main"].humidity}%</li>

        </ul>
        `
    );
   // let breakpoint = weatherArray["list"].findIndex((element) => element.dt_txt.substring(11) == "00:00:00");
   // console.log(breakpoint);
   $('#futureDisplay').html('');

    for(let i = 7; i<weatherArray["list"].length;i+=8) {
        console.log(weatherArray["list"][i]["weather"][0].id);
      //  console.log(weatherArray["list"][i]);
        $('#futureDisplay').append(`
            <div class="card col text-light text-center" style="background-color: #16223F">
                <div class="card-body">
                    <h4>${dayjs.unix(weatherArray["list"][i].dt).format("MM/D/YYYY")}</h4>
                    ${pickIcon(weatherArray["list"][i]["weather"][0].id)}
                    <ul class="list-unstyled fs-5">
                        <li>Temp: ${weatherArray["list"][i]["main"].temp}</li>
                        <li>Wind: ${weatherArray["list"][i]["wind"].speed} MPH</li>
                        <li>Humidity: ${weatherArray["list"][i]["main"].humidity}%</li>
                    </ul>
                </div> 
            </div>
        `);

    }

}


$(document).ready(function(){
    $("#searchButton").click(handleSearch);

    if(weatherData !== null) {
        cumulativeData = weatherData;
    }

    renderButtons();
});