//Before we forget. This is RAWG database's API.

//Anyways. We want to use preloaded data if we do not have an API_KEY stored locally.
//I considered an environment variable before but if I can just access a random file that I add to git ignore then
// that'll do just fine.


//This fetch statement attempts to fetch my API_KEY from a custom piece of JSON that I have.
//If the file isn't found (I.E. The client is using this html and doesn't have an API key (or just a json file)
//Then we will continue the demonstration using a batch of pre-created data.

//I could've included Node.js/dotenv locally and used environment variables and such but I decided to do it this way.

/*
Anatomy of a response json from the RAWG database API
count = The number of results given.
next = The https location for the next batch that fit the request.
previous = the https location for the previous batch that fit the request
results = An array of 20 objects that are the list of games. Each game object also has their own values.
*/


let API_URL_RAWG = '';
let API_KEY_RAWG = '';

//Overview of this promise statement. This code waits for API_URL_RAWG to be returned before resolving so that
//the code can rely on API_URL_RAWG being built and pointing to an actual location.
//I could have just placed it into the then statement here but I wanted to clearly separate each code block.
//There may be a slight performance hit here, however.
const apiUrlBuilder = new Promise ((resolve, reject) => {
    //Attempt to fetch the API key at the local location.
    fetch("../PseudoResponseData/API_KEY.json")
        .then(response => {
            if (response.status === 200) {
                //console.log("Response status success.");
                return response.json();
            }
            else {
                throw new Error("Problem with API_KEY.json.");
            }
        })
        .then(results => {
            if (!results.hasOwnProperty(`API_KEY_RAWG`)) {
                throw new Error(`API_KEY_RAWG not found in JSON.`);
            }
            //We have the json. The name of the variable where the API key should be stored at is: API_KEY_RAWG.
            //console.log(results);
            API_KEY_RAWG = `${results.API_KEY_RAWG}`;
            API_URL_RAWG = `https://api.rawg.io/api/games?dates=2021-10-10,2022-10-10&ordering=-added&key=${API_KEY_RAWG}`;
            //console.log(`Before exiting the then() statement:\nAPI_KEY_RAWG = ${API_KEY_RAWG}\nAPI_URL_RAWG = ${API_URL_RAWG}`);
            resolve(API_URL_RAWG);
        })
        .catch(error => {
            console.error(error + "\nDefaulting to preloaded data");
            API_URL_RAWG = `../PseudoResponseData/pseudoResponseData1.json`;
            resolve(API_URL_RAWG);
        });
});

apiUrlBuilder
    .then(builtURL => {
        console.log(`builtURL: ${builtURL}`);
        fetch(builtURL)
            .then(response => {
                if (response.status === 404) {
                    throw new Error(`URL at ${builtURL} not found.`);
                }
                else if (response.status === 200) {
                    return response.json();
                }
            })
            .then(data => {
                //Otherwise we need to organize this data now. Just use the results array.
                console.log(data.results);
                const gameList = document.querySelector(`.game-list`);
                for (let APIresult of data.results) {
                    let gameItem = document.createElement('div');
                    gameItem.className = "game";
                    gameList.appendChild(gameItem);
                    let gameName = document.createElement('div');
                    gameName.className = 'game-name';
                    gameName.innerHTML = APIresult.name;
                    gameItem.appendChild(gameName);
                    let gameRelease = document.createElement('div');
                    gameRelease.className = "release-date";
                    gameRelease.innerHTML = APIresult.released;
                    gameItem.appendChild(gameRelease);
                }
            })
    })
    .catch(error => {
        console.error(error);
    });

