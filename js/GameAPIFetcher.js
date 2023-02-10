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
const apiUrlBuilder = new Promise ((resolve, reject) => {
    //Attempt to fetch the API key at the local location.
    fetch("../PseudoResponseData/API_KEY.json")
        .then(response => {
            if (response.status === 404) {
                throw new Error("API_KEY.json not found.");
            } else if (response.status === 200) {
                //console.log("Response status success.");
                return response.json();
            }
        })
        .then(results => {
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
        console.log(builtURL);
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
                //Issue is only in the fact that the "next" field contains a literal string. I can probably send
                //a normal fetch request.

                //Otherwise we need to organize this data now. Just use the results array.
                console.log(data.results);
            })
    })
    .catch(error => {
        console.error(error);
    });

/*
fetch('https://cdn.jsdelivr.net/npm/dotenv@16.0.3/lib/main.min.js')
    .then(response => {
        if (response.status === 404) {
            //dotenv was not found. Use the preloaded data
            API_URL_RAWG = "./pseudoResponseData1.json"
        }
        else {
            //dotenv was found so look for the env variable
            response.text().then(script => {
                const scriptEl = document.createElement('script');
                scriptEl.innerHTML = script;
                document.head.appendChild(scriptEl);
                if (process.env.API_KEY_RAWG) {
                    API_KEY_RAWG = process.env.API_KEY_RAWG;
                    API_URL_RAWG = `https://api.rawg.io/api/games?dates=2021-10-10,2022-10-10&ordering=-added&key=${API_KEY_RAWG}`;
                }
                else {
                    API_URL_RAWG = `./pseudoResponseData1.json`;
                }
            })
        }
    });


console.log(API_URL_RAWG);
*/

/*

*/

/*
fetch(API_URL_RAWG)
    .then(response => response.json())
    .then(results => {
        console.log(results);

        let output = '';
        results.forEach(name => {
            output += `
            <div>
                <h2>${results.name}</h2>
            </div>
            `;
        });

        const blob = new Blob([JSON.stringify(results)], { type: 'application/json' });
        saveAs(blob, 'data.json');


        // Do something with the data
    })
    .catch(error => {
        console.error("There was a problem with the fetch operation: ",error);
        // Handle the error
    });
*/
