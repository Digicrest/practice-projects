function ApplyMultiplier(type, arrayName, multiplier_value, current_matchup) {
    // apply multiplier for every type in the array
    if (type.hasOwnProperty(arrayName)){
       type[arrayName].map(opposing_type => {
            current_matchup[opposing_type] *= multiplier_value;
        });
    }
    return current_matchup;
}

let Type_Matchup = {
    "Normal": 1, "Grass": 1, "Fire": 1,
    "Water": 1, "Fighting": 1, "Flying": 1, 
    "Poison": 1, "Ground": 1, "Rock": 1, 
    "Bug": 1, "Ghost": 1, "Electric": 1,
    "Psychic": 1, "Ice": 1, "Dragon": 1, 
    "Dark": 1, "Steel": 1, "Fairy": 1
};

let type_matchups = {};
$(document).ready(() => {
    // parse xml with type matchup data
    $.get("../json/types.json", json => {
        json.Type.map(type => {
            // create new type matchup object
            let current_matchup = Object.create(Type_Matchup);
            
            // apply immunity multiplier for every type in the UnaffectedBy array
            ApplyMultiplier(type, "UnaffectedBy", 0.0, current_matchup);

            // apply resistance multiplier for every type in the Resists array
            ApplyMultiplier(type, "Resists", 0.5, current_matchup);

            // apply weakness multiplier for every type in the WeakTo array
            ApplyMultiplier(type, "WeakTo", 2.0, current_matchup);

            // save type matchup to dictionary
            type_matchups[type.Name] = current_matchup;
        });
    })
});     