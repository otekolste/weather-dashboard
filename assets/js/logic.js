const APIKey = "50ed25e94a50cae769760c988183a9a5";

// http://api.openweathermap.org/geo/1.0/direct?q={city name}&limit=5&appid={API key};

function handleSearch(event) {

    event.preventDefault();

    let cityName = $("#cityName").val();
    //console.log(cityName);
    getWeatherInfo(cityName);

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
        const newApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${APIKey}`;
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
    .then(function (result){
        console.log(result);
    })

    /*

    fetch(apiUrl)
    .then (function(response) {
        let coords = [];
        if(response.ok) {
            response.json().then(function (data) {
                coords = [data[0].lat,data[0].lon];
                return coords;
            })
            .then(function(result) {
                lat = result[0];
                lon = result[1];
                const newApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${APIKey}`
                fetch(newApiUrl)
                .then(function(response) {
                    if(response.ok) {
                        response.json().then(function (data) {
                            console.log(data);
                        })
            
                    }
                    else{
                        console.log("NO!!!");
                        return;
                    }
                })
            })
        }
        else {
            // TODO: handle bad fetch
            console.log("AAAA");
            return;
        }

    })

    */

}

$(document).ready(function(){
    $("#searchButton").click(handleSearch);
});