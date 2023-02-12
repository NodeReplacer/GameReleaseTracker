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

let API_URL_RAWG;
let API_KEY_RAWG;

let nextURL;
let prevURL;

let prevButtons = document.getElementsByClassName("prev-button");
let nextButtons = document.getElementsByClassName("next-button");

//Get the bottom button container and remove its border.
let bottomButtonContainer = document.getElementById("bottomButtonContainer");
bottomButtonContainer.style.borderBottom = "none";

//Interestingly. Putting these steps into a function causes a noticeable slowdown.

function updateGameList(gameList, data) {
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
        gameRelease.innerHTML = `Release Date: ${APIresult.released}`;
        gameItem.appendChild(gameRelease);
    }

    prevURL = data.previous;
    nextURL = data.next;
}

function changePage(targetURL) {
    //To update the list we fetch the new page at the url pointed to by either next or previous. (builtURL)
    //We can pass this data through arguments instead of finding it here.

    //But what do I want to do? I want to update the page with the new info. Maybe I can also take out work
    //sitting at .then(data => {etc})?

    //If I did that then I need to pass the dataResults in. Then I change the variables storing the next and prev pages
    //to the new position we are at.
    //To get that next and prev values I need to have fetched the next/prev from the destination page.
    //I will also need to fetch the results and update the data I have in front of me.
    //Should I attach the fetch to the event listeners or do I just fetch in this function. Both buttons
    //will be fetching after all.
    console.log(`Clicked ${targetURL}`)

    //The once we hit the end targetURL is null. So we return null.
    if (targetURL === null) {
        return null;
    }

    //If we have not hit the end then fetch the new data and replace the old data.
    fetch(targetURL)
        .then(response => response.json())
        .then (data => {
            //Get game list container.
            const gameList = document.getElementById(`game-list`);
            //Empty out the game list container. By checking if the first child exists.
            //while looping as long as that is true.
            while (gameList.firstChild) {
                //And removing whatever is currently occupying the spot of firstChild.
                //This will require the list to relink itself every time. It may be better to use a for loop
                gameList.removeChild(gameList.firstChild);
            }

            updateGameList(gameList, data);
        })
        .catch(error => {
            console.error(error);
        });
}

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
                //The URL we were given was not found.
                if (response.status === 404) {
                    throw new Error(`URL at ${builtURL} not found.`);
                }
                else if (response.status === 200) {
                    return response.json();
                }
            })
            .then(data => {
                //Organize the data
                console.log(data);
                const gameList = document.querySelector(`.game-list`);

                updateGameList(gameList, data);

                /*
                for (let APIresult of data.results) {
                    let gameItem = document.createElement('div');
                    gameItem.className = "game";
                    gameList.appendChild(gameItem);
                    //gameList.insertBefore(gameItem,newButtonContainer);
                    let gameName = document.createElement('div');
                    gameName.className = 'game-name';
                    gameName.innerHTML = APIresult.name;
                    gameItem.appendChild(gameName);
                    let gameRelease = document.createElement('div');
                    gameRelease.className = "release-date";
                    gameRelease.innerHTML = `Release Date: ${APIresult.released}`;
                    gameItem.appendChild(gameRelease);
                }

                prevURL = data.previous;
                nextURL = data.next;
                */
            })
            .then(function() {
                //Wait for the data to be taken and displayed. Then update the functionality
                //of the buttons.
                for (let i = 0; i < prevButtons.length; ++i) {
                    prevButtons[i].addEventListener("click",function() {
                        changePage(prevURL);
                    })
                }
                for (let i = 0; i < nextButtons.length; ++i) {
                    nextButtons[i].addEventListener("click",function() {
                        changePage(nextURL);
                    })
                }
            })
    })
    .catch(error => {
        console.error(error);
    });

