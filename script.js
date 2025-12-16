const cityInput=document.getElementById('cityInput');
const suggestions=document.getElementById('suggestions');
const search=document.getElementById('search');
const alertBox=document.getElementById('alert-box');
const place=document.getElementById('weather-place');
const now=new Date();
const currentHour = now.getHours();




let latitude;
let longitude;
let debounceTimeout;

function timeDelay(ms){
    return new Promise(resolve => setTimeout(resolve,ms));
}

function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}


/* Click event for disable out of suggetions disappear */
document.addEventListener("click", (event) =>{
    const isClickInside = cityInput.contains(event.target) || suggestions.contains(event.target);

    if(!isClickInside){
        suggestions.innerHTML="";
        suggestions.classList.add("hidden");
    }
    
});

/* function for show suggetions from the input or current location*/
function fetchdata(cities) {
            suggestions.innerHTML="";
            suggestions.classList.remove("hidden");

            const maxSuggestions= cities.slice(0,4);
            
            
            
            maxSuggestions.forEach(c => {

                const cityName=c.name || "Unknown";
                const countryCode=c.country || "N/A";

                const li =document.createElement("li");
                li.textContent=`${cityName}, ${countryCode}`;
                li.className="p-2 border-b-2 border-black truncate overflow-hidden whitespace-nowrap max-w-full";
                li.classList.add("hover:bg-gray-200", "cursor-pointer");

                li.addEventListener("click", ()=>{
                    cityInput.value=`${cityName}, ${countryCode}`;
                    suggestions.innerHTML="";
                    suggestions.classList.add("hidden");
                });
                suggestions.appendChild(li);
                suggestions.classList.remove("hidden");
                suggestions.style.width = cityInput.offsetWidth + "px";
                
                });
                return maxSuggestions[0]?maxSuggestions[0].name:null;

};

/* Click event for fetching current location  */
cityInput.addEventListener("click", ()=>{
        suggestions.innerHTML = "";
        suggestions.classList.remove("hidden");

        const li =document.createElement("li");
        li.className="p-2 ";
        li.style.color = "#2563EB";
        li.textContent=`Current location`;
        suggestions.appendChild(li);
        
        li.addEventListener("click", async() =>{
            suggestions.innerHTML = "";
            suggestions.classList.add("hidden");

            if(navigator.geolocation){
                navigator.geolocation.getCurrentPosition(async (position) =>{
                latitude=position.coords.latitude;
                longitude=position.coords.longitude;
                
                debounceTimeout =setTimeout(async () =>{
                try{
                    const res= await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&limit=1&appid=82d6b9b46b1abe92bc521e96ec173d4d`
                    );

                    if(!res.ok) throw new Error(`Error error! status ${res.status}`);

                    const data = await res.json();
                    const cities=[{
                        name:data.name,
                        country:data.sys.country
                    }];
                    
                    fetchdata(cities);
                }
                catch(error){
                    console.error("Error fetching cities :",error);
                }
                    },300);
                });
            }else{
                alert("Geolocation not supported!");
            }
        });
        
    });

/* Input event for fetching data from input */
cityInput.addEventListener("input", async() =>{

    clearTimeout(debounceTimeout);

    const query = cityInput.value.toLowerCase().trim();
    
    if(!query) {
        suggestions.innerHTML = "";
        suggestions.classList.add("hidden");
        return;
    }

 debounceTimeout =setTimeout(async () =>{

    try{
        
        const res = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=82d6b9b46b1abe92bc521e96ec173d4d`);

        if(!res.ok) throw new Error(`Error error! status ${res.status}`);
       
            const cities = await res.json();

            if(!cities || cities.length ===0){
                const li =document.createElement("li");
                li.className=" p-2";
                li.textContent=`No results found`;
                suggestions.appendChild(li);
                suggestions.classList.remove("hidden");
                return;
            }

            fetchdata(cities);
        
        }catch(error){
            console.error("Error fetching cities :",error);
        }
        },300);
});

/* Click event for redirecting value from search to detail */
search.addEventListener("click",async ()=>{

    
    const query=cityInput.value.split(",")[0].trim();
    console.log("button was clicked",query);

    if(!query){ 
        return alert("Enter the city!");
    }else{
        try{
            showLoading();

            timeDelay(2000);
            const weatherInfo=await fetchWeather(query);
             

            const videoUrl = await fetchBgVideo(weatherInfo.description, weatherInfo.timezone);
            updatebgVideo(videoUrl);
       
        }catch(error){
            Error(`Fetch error for data`,error);
        }finally{
            hideLoading();
        }
    }
                         
});

/*function to fetch weather */
async function fetchWeather(city){
    try{
        
        const res= await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=82d6b9b46b1abe92bc521e96ec173d4d&units=metric`);

        if(!res.ok) throw new Error(`Failed to fetch weather: ${res.statusText}`);

        const data= await res.json();
        const {lat, lon}=data.coord;
        console.log(data.name);
        await displayWeather(data);
        await fetchForecast(lat,lon);


        return data.weather[0].description;

    }catch(error){
        console.error(" Error fetching weather",error);
        throw error;
    }
}

/* function to fetch Bg video */
async function fetchBgVideo(weatherDescription,localHr) {

   

    const isMorning = localHr >=6 && localHr <12;
    const isAftNoon=localHr >=12 && localHr <16;
    const isEvning=localHr >=16 && localHr <19;
    

    let timeOfDay = "Day";

    if(isMorning){
        timeOfDay="Morning ";
    }else if(isAftNoon){
        timeOfDay="Afternoon  ";
    }else if(isEvning){
        timeOfDay="Evening  ";
    }else {
        timeOfDay="Night ";
    }

    weatherDescription = weatherDescription.toLowerCase();

    console.log(weatherDescription,localHr);    

    let query = `${timeOfDay}sunny`; 

    if (weatherDescription.includes("rain")) {
        query = `${timeOfDay}rain`;
    } else if (weatherDescription.includes("clouds")) {
        query = `india ${timeOfDay} clouds`;
    } else if (weatherDescription.includes("snow")) {
        query = `${timeOfDay}snow`;
    } else if (weatherDescription.includes("fog")) {
        query = `${timeOfDay}foggy`;
    } else if (weatherDescription.includes("clear")) {
        query = `${timeOfDay}clear sky `;
    }else if (weatherDescription.includes("mist")) {
        query = ` ${timeOfDay}mist`;
    }else if (weatherDescription.includes("smoke")) {
        query = ` ${timeOfDay}smoky sky`;
    }



    console.log(query);
    try{

            const res=await fetch(`https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=5`,{
                headers : {
                    Authorization: "IA3PONoL4wuqcVqZOMOm5aIocuCRzToeAGhLi9eGMtrbbRNtn3Cdx1Jk",
                }
            });

            const videoData=await res.json();

            console.log(videoData);

            if(videoData.videos && videoData.videos.length > 0){
               const videoUrl =videoData.videos[0].video_files[0].link;
               console.log(videoUrl);

                const videoEle = document.querySelector('video');

                videoEle.innerHTML="";

                const source=document.createElement('source');
                source.src = videoUrl;
                source.type = 'video/mp4';
                videoEle.appendChild(source);

                videoEle.load();
                videoEle.play();

            }

            return "resources/sunnyday.mp4";;

        }catch(error){
            console.log("Error fetching video",error);
            return "resources/sunnyday.mp4";
        }
}

/* function to fetch time */
async function getTime(WeatherData) {
    try{

        const offset =WeatherData.timezone;

        const utcTime=new Date().getTime()+ new Date().getTimezoneOffset() *60000;

        const localTime=new Date(utcTime + offset*1000);
        const localHr=localTime.getHours();

        return localHr;

    }catch(error){
        console.error("Error fetching time",error);
        return new Date().getUTCHours();
    }
}

/* function to display weather */
async function displayWeather(data){
 try{
    const localHr=await getTime(data);

    const weatherIcon=document.getElementById('weather-icon');
    const weatherPlace=document.getElementById('weather-place');
    const weatherNumber=document.getElementById('weather-number');
    const humidityNo=document.getElementById('humidity-nums');
    const windNo=document.getElementById('wind-nums');

    const temp=data.main.temp || 'NA';
    const cityName=data.name || 'NA';
    

    const wind=data.wind.speed || 'NA';
    const humid=data.main.humidity || 'NA';
    const description = data.weather[0].description || 'clear';
    await fetchBgVideo(description, localHr);
    const icon = data.weather[0].icon || 'NA';
     

    weatherIcon.src=`https://openweathermap.org/img/wn/${icon}@2x.png`;

    weatherPlace.textContent=`${cityName}`;
    weatherNumber.textContent=`${Math.round(temp)} °C`;
    humidityNo.textContent=`   ${humid} %`;
    windNo.textContent=`   ${(wind*3.6).toFixed(1)}km/h`;
     
 }catch(error){
    console.log("Error updating weather or bg video :",error);
 }
       
}; 

/* function to fetch forcast weather */
async function fetchForecast(lat,lon){
    try{
        const res= await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=82d6b9b46b1abe92bc521e96ec173d4d&units=metric`);

        if(!res.ok) return new Error(`Failed to fetch forcast : ${res.statusText}`);

        const data=await res.json();

        const days={};
        data.list.forEach(entry => {
            const date = entry.dt_txt.split(" ")[0];
            if(!days[date]) days[date]=entry;
        });

        const forecast =Object.values(days).slice(0,5);
        displayForecast(forecast);

    }catch(error){
        console.eroor("Error frtching forecast ",error);
    }
}

/* function to display forcast weather */
async function displayForecast(forecast){
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    forecast.forEach((day, index) =>{
        const date= new Date(day.dt_txt);
        const weekday =daysOfWeek[date.getDay()];
        const icon=day.weather[0].icon;
        const temp=Math.round(day.main.temp);

        document.getElementById(`day${index +1}-name`).textContent=weekday;
        console.log(document.getElementById(`day${index +1}-icon`).src=`https://openweathermap.org/img/wn/${icon}@2x.png`);
        document.getElementById(`day${index +1}-temp`).textContent=`${temp} °C`;
    })
}