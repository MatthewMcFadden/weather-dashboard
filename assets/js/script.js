function pageGenerate() {
  // local variables
  const inputEl = document.getElementById("city-input");
  const searchEl = document.getElementById("search-button");
  const historyEl = document.getElementById("history");
  const clearEl = document.getElementById("clear-history");
  const cityEl = document.getElementById("city-name");
  const temperatureEl = document.getElementById("temperature");
  const humidityEl = document.getElementById("humidity");
  const windSpeedEl = document.getElementById("wind-speed");
  const UVElement = document.getElementById("UV-index");
  const pictureEl = document.getElementById("weather-pic");

  // API key retrieved from Open Weather Map
  const APIKey = "e97f160d6822446df8eb4a687d7fb6ca"

  // Stores searched city name
  let searchHistory = JSON.parse(localStorage.getItem("search")) || [];
    
  function getWeather(cityName) {
    // Gets request from Open Weather Map API to display city searched
    let queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${APIKey}`;
    axios.get(queryURL)

    // Once we get the city information then display current conditions
    .then(function(response){          
      // Method for using "date" objects obtained from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
      const currentDate = new Date(response.data.dt*1000);
      const day = currentDate.getDate();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      // Display today's date
      cityEl.innerHTML = response.data.name + " (" + month + "/" + day + "/" + year + ") ";
      let weatherPic = response.data.weather[0].icon;
      // Sets weather pic. next to date
      pictureEl.setAttribute("src",`https://openweathermap.org/img/wn/${weatherPic}@2x.png`);
      // Sets img 'alt' attribute to fetched description
      pictureEl.setAttribute("alt",response.data.weather[0].description);
      // Display Temperature
      temperatureEl.innerHTML = "Temperature: " + degree(response.data.main.temp) + " &#176F";
      // Display Humidity
      humidityEl.innerHTML = "Humidity: " + response.data.main.humidity + "%";
      // Display Wind Speed
      windSpeedEl.innerHTML = "Wind Speed: " + response.data.wind.speed + " MPH";

    // Open Weather Map API request to get UV Index
    let lat = response.data.coord.lat;
    let lon = response.data.coord.lon;
    let UVQueryURL = `https://api.openweathermap.org/data/2.5/uvi/forecast?lat=${lat}&lon=${lon}&appid=${APIKey}&cnt=1`;
    axios.get(UVQueryURL)
    .then(function(response){
      let UVIndex = document.createElement("span");
      UVIndex.setAttribute("class","badge badge-danger");
      UVIndex.innerHTML = response.data[0].value;
      UVElement.innerHTML = "UV Index: ";
      UVElement.append(UVIndex);
    });

    // Using saved city name, execute a 5-day forecast get request from open weather map api
    let cityID = response.data.id;
    let forecastQueryURL = `https://api.openweathermap.org/data/2.5/forecast?id=${cityID}&appid=${APIKey}`;
    axios.get(forecastQueryURL)
    .then(function(response){
      // Parse response to display forecast for next 5 days underneath current conditions
      const forecastEls = document.querySelectorAll(".forecast");
      for (i=0; i<forecastEls.length; i++) {
          forecastEls[i].innerHTML = "";
          const forecastIndex = i * 8 + 4;
          const forecastDate = new Date(response.data.list[forecastIndex].dt * 1000);
          const forecastDay = forecastDate.getDate();
          const forecastMonth = forecastDate.getMonth() + 1;
          const forecastYear = forecastDate.getFullYear();
          const forecastDateEl = document.createElement("p");
        
          // makes 5 day forecast HTML with styles and attributes
          forecastDateEl.setAttribute("class","mt-3 mb-0 forecast-date");
          // adds forecast for future dates
          forecastDateEl.innerHTML = forecastMonth + "/" + forecastDay + "/" + forecastYear;
          forecastEls[i].append(forecastDateEl);
          const forecastWeatherEl = document.createElement("img");

          // create weather img
          forecastWeatherEl.setAttribute("src","https://openweathermap.org/img/wn/" + response.data.list[forecastIndex].weather[0].icon + "@2x.png");
          forecastWeatherEl.setAttribute("alt",response.data.list[forecastIndex].weather[0].description);
          forecastEls[i].append(forecastWeatherEl);
          const forecastTempEl = document.createElement("p");

          // temperature information
          forecastTempEl.innerHTML = "Temp: " + degree(response.data.list[forecastIndex].main.temp) + " &#176F";
          forecastEls[i].append(forecastTempEl);
          const forecastHumidityEl = document.createElement("p");

          // humidity information
          forecastHumidityEl.innerHTML = "Humidity: " + response.data.list[forecastIndex].main.humidity + "%";
          forecastEls[i].append(forecastHumidityEl);
          }
      })
    });  
  }

  // search click event
  searchEl.addEventListener("click",function() {
    const searchTerm = inputEl.value;

    getWeather(searchTerm);
    searchHistory.push(searchTerm);
    localStorage.setItem("search",JSON.stringify(searchHistory));
    renderSearchHistory();
  }) 

  // history click event
  clearEl.addEventListener("click",function() {
    searchHistory = [];
    renderSearchHistory();
  })


  // Fahrenheit conversion K = Kelvin
  function degree(K) {
    // Celsius * 1.8 + 32
    return Math.floor((K - 273.15) * 1.8 + 32);
  }

  function renderSearchHistory() {
    historyEl.innerHTML = "";
    for (let i = 0; i < searchHistory.length; i++) {
      const historyItem = document.createElement("input");
      // <input type="text" readonly class="form-control-plaintext" id="staticEmail" value="email@example.com"></input>
      historyItem.setAttribute("type","text");
      historyItem.setAttribute("readonly",true);
      historyItem.setAttribute("class", "form-control d-block bg-white");
      historyItem.setAttribute("value", searchHistory[i]);
      historyItem.addEventListener("click",function() {
        getWeather(historyItem.value);
      })
      historyEl.append(historyItem);
    }
  }

  // Save user's search history and displays them underneath search form
  renderSearchHistory();
  if (searchHistory.length > 0) {
    // Automatically generate last searched city's current conditions and 5-day forecast
    getWeather(searchHistory[searchHistory.length - 1]);
  }
}

pageGenerate();