class PokeAPI {
    constructor() {
        this.pokemonCount = 802;
    }

    request(uri, relativeURI){
        if (relativeURI) {
            uri = "https://pokeapi.co/api/v2/" + relativeURI;
        }

        return $.ajax({
            url: uri,
            dataType: 'json',
            method: 'GET',
            error: r => {
                console.log(`PokeApi.request(${uri}, ${relativeURI}) failed.`)
            },
            success: r => {
                console.log(`PokeApi.request(${uri}, ${relativeURI}) succeeded.`)
            }
        });
    }  

    getPokemon(arg) {
        if(typeof arg === String){
            arg = arg.toLowerCase();
        }
        return this.request(`https://pokeapi.co/api/v2/pokemon/${arg}`);
    }

    setErrorText(message){
        $("#request_error").text(message);
    }
}
