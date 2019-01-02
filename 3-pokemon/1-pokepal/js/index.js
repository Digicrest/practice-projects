const SUGGESTION_COUNT = 6;

let cached_pokemon = [];
let colors;

let pokeAPI = new PokeAPI();
let current_team = [];
let saved = [];
let active_user = null;

let image_exceptions = {
    "rotom": "rotom-normal",
    "nidoran♂": "nidoran-m",
    "nidoran♀": "nidoran-f",
    "farfetch’d": "farfetchd",
    "wormadam": "wormadam-plant",
    "giratina": "giratina-altered",
    "shaymin": "shaymin-land",
    "darmanitan": "darmanitan-standard",
    "meloetta": "meloetta-aria",
    "aegislash": "aegislash-blade",
    "hoopa": "hoopa-confined",
    "lycanroc": "lycanroc-midday",
    "wishiwashi": "wishiwashi-solo",
    "oricorio": "oricorio-pom-pom",
    "meowstic": "meowstic-female",
    "mime jr.": "mime-jr",
    "mr. mime": "mr-mime",
    "deoxys": "deoxys-normal",
    "type: null": "type-null"
};
const ToggleWarning = () => {
    if($("#warning-text")[0].attributes[1]){
        $('#warning-text').removeAttr('hidden');
    } else {
        $("#warning-text").attr("hidden", true);
    }
}
const capitalize = s => s[0].toUpperCase() + s.substring(1, s.length);

// inclusive boundary comparison on val between min and max
const between = (val, min, max) => val >= min && val <= max;

// onkeyup() from the search bar, the json object is searched to find any partial matches
const FindByName = n => 
    cached_pokemon.filter(pokemon => pokemon.name.toUpperCase().includes(n.toUpperCase()));

const findIndexOfPoke = poke => 
    cached_pokemon.map(p => p.name.toLowerCase()).indexOf(poke.name.toLowerCase());

function GetInfoFromAPI(pokemon) {
    return pokeAPI.getPokemon(pokemon.id).then(poke => 
        pokemon.types = poke.types.map(type => type.type.name)
    )
}

const AddColors = pokemon => {
    pokemon.colors = [];
    
    if(pokemon.hasOwnProperty("types")){
        pokemon.types.map(type => {
            pokemon.colors.push(colors[capitalize(type)]);
        });   
    } else {
        GetInfoFromAPI(pokemon).then(() => AddColors(pokemon));
    }
}   

$(document).ready(() => {
    // Create Colors
    $.getJSON("json/type-colors.json", json_colors => colors = json_colors);

    // Create Names List, Cache API Stuff
    $.getJSON("json/names.json", data => data.map(pokemon => {
        pokemon.id = cached_pokemon.length + 1;
        cached_pokemon.push(pokemon);
    })).then(() => {
        // get types
        $.getJSON("json/type_hard.json", data => {
            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    if(key.includes("Mega ")) continue;
                    
                    const pokemon = data[key];
                    pokemon.name = key;
                    
                    let x = findIndexOfPoke(pokemon);
                    cached_pokemon[x].types = pokemon.types
                    cached_pokemon[x].stats = pokemon.stats;
                    
                    AddColors(cached_pokemon[x]);
                }
            }  
        });
    });

    $("#team-name-entry").val("");
});

function SubmitSearch(pokemon_name) {
    let pokemon = FindByName(pokemon_name)[0];
    
    // Guard Clause
    if (!pokemon.name) return;

    $("#search").val(pokemon.name);
    SuggestSearch(pokemon.name);
    return pokemon;
}
 
function GetNameByID(id) {
    if(!parseInt(id)) return;
    if(!between(id, 1, pokeAPI.pokemonCount)) return;

    return cached_pokemon[id - 1].name;
}

//uses simple regex to create a js id from the given string
const CreateJSID = s => 
    s.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-').toLowerCase();
    
// everytime the user presses a key in the search field this function runs
// check through our json object for any strings that include the search_term as a substring
// filter array to a few elements and attach them to suggestion buttons for the user to click.
function SuggestSearch(search_term) {
    $("#autocompletions").empty();
    $("#pokemon-list").empty();
    $("#search-result-count").text("")
    if (!search_term) { return; }

    if (parseInt(search_term))
        search_term = GetNameByID(search_term) || "Missing";

    let possibilities = FindByName(search_term);
    if (!possibilities.length) {
        $("#autocompletions").append(BuildSuggestionButton(""));
        return;
    }

    // show only a few reccomendation buttons
    possibilities.slice(0, SUGGESTION_COUNT).map(possibility => {
        let btn = BuildSuggestionButton(possibility.name);
        $("#autocompletions").append(btn);
    });
    
    // show all matching tiles
    possibilities.map(possibility => {
        let tile = BuildPokemonTile(possibility);
        
        // if(possibility.hasOwnProperty("types")) {
        //     tile.children[0].style.background = GetBackgroundColor(possibility);
        //     tile.children[0].classList.remove("btn-link")
        //     if(!tile){
        //         console.log(tile)
        //     }
        // };
        
        $("#pokemon-list").append(tile);
    });
    
    $("#search-result-count").text(`${possibilities.length} results`)
}

// takes a pokemon and creates a new div (pokemon tile) and returns it
function BuildPokemonTile(pokemon) {
    if(current_team.includes(pokemon)) return;

    let art_url = Object.keys(image_exceptions).includes(pokemon.name.toLowerCase()) ? image_exceptions[pokemon.name.toLowerCase()] : pokemon.name.replace(/\s+/g, '-').toLowerCase();
    let alt_art = "https://img.pokemondb.net/artwork/" + art_url + ".jpg";    
    
    let elem = `<div class="pokemon-tile card centre mb-3">
        <img class="card-img-top" src="${alt_art}" alt="${pokemon.name}">
        <div class="card-body">
            <h5 class="card-title">${pokemon.name}</h5>
            <h6 class="card-subtitle mb-2 text-muted">${pokemon.id}</h6>
        </div>
    </div>`;

    let tile = document.createElement("div");
    tile.innerHTML = elem;

    tile.setAttribute("id", `pokemon-tile-${pokemon.id}`);

    tile.classList.add("pokemon-tile-parent");
    tile.addEventListener("click", () => {
        AddToTeam(pokemon);
    });
    return tile;
}

function BuildSuggestionButton(button_text) {
    if(current_team.map(tm => tm.name).includes(button_text)) return;
    let btn = document.createElement('button');
    btn.setAttribute("class", "btn btn-sm btn-round-sm autocomplete-button");

    // instead of using if else with positive case which can increase cyclomatic complexity of a function
    // instead by inverting the statement and creating a (guard clause) you can fail fast, reduce nesting and reduce complexity
    // the down side is having multiple exit points, but i think its worth it
    if (!button_text) {
        btn.textContent = "Missingno";
        btn.classList.add("btn-danger");
        $("#search-result-count").text(`0 results`)
        return btn;
    }

    btn.textContent = button_text;
    btn.classList.add("form-control");

    btn.addEventListener("click", () => {
        $("#search").val(button_text);
        SubmitSearch(button_text);
    });
    
    return btn;
}

function GetBackgroundColor(pokemon) {
    if(!pokemon.types){
        AddColors(pokemon);
    }
    return pokemon.types.length > 1 ? 
        `linear-gradient(${pokemon.colors[0].background}, ${pokemon.colors[1].background})`
    :   `linear-gradient(${pokemon.colors[0].background}, ${pokemon.colors[0].border})`;   
}

function BuildTeamMemberTile(pokemon) {
    let elem = `<div class="team-member">
        <img class="card team-member-img" style="background: ${GetBackgroundColor(pokemon)}" src="${pokemon.image}" alt="">
        <p class="btn btn-block btn-sm btn-light" >${pokemon.name}</p> 
    </div>`;

    let tile = document.createElement("div");
    tile.innerHTML = elem;
    tile.setAttribute("class", `team-member`);
    tile.addEventListener("click", () => {
        tile.remove();
        RemoveFromTeam(pokemon);
    });
    return tile;
}

function RemoveFromTeam(pokemon) {
    current_team = current_team.filter(p => p !== pokemon);
    UpdateTeam();
}

const isOnTeam = pokemon => current_team.includes(pokemon);

function AddToTeam(pokemon) {
    if(isOnTeam(pokemon)) return;
    if(current_team.length >= 6) return;
    
    if(!pokemon.colors) {
        AddColors(pokemon);
        return;
    };
    
    current_team.push(pokemon);
    $("#selected-team").prepend(BuildTeamMemberTile(pokemon));
    $(`#pokemon-tile-${pokemon.id}`).hide();
    UpdateTeam();
}

function UpdateTeam() {
    $("#chosen-num").text(current_team.length);
    SuggestSearch($("#search").val());
    
    if (current_team.length === 0) {
        $("#btn-save-team").addClass("disabled");
        return;
    }
    
    if (active_user) {
        $("#btn-save-team").removeClass("disabled");            
    }
}

const ClearSelectedTeam = () => $("#selected-team > div").trigger("click");
const ShowLiveSite = () => alert("This site doesn't support saving teams, please visit the more up-to-date live version at: http://pokepal.digicrest.co.uk/")
const GoToSite = () => window.open("http://pokepal.digicrest.co.uk/");