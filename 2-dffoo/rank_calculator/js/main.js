let heroes = []
let crystals = []

const root = "https://raw.githubusercontent.com/Digicrest/JavaScript/master/simple-sites/2-dffoo/json/"

$(document).ready(() => {
    // fetch remote json and cache
    get_heroes();
    get_crystal_levels();
    
    setTimeout(() => {
        $('#loading').hide();
    }, Math.random() *  (1000 - 200) + 200);
});

function update_crystals(){
    let current_lvl = parseInt($('#txt_current_level').val());
    let desired_lvl = parseInt($('#txt_desired_level').val());

    if (current_lvl <= desired_lvl) {    
        let used = sum_crystals(0, current_lvl);
        display_crystals("crystals_used", used);

        if (desired_lvl <= 50) {
            let needed = sum_crystals(current_lvl, desired_lvl);
            display_crystals("crystals_needed", needed);
        } else
            wipe("need")
    } else 
        wipe("all");
}

function wipe(part){
    switch (part) {
        case "need":
            $(`#crystals_needed > div > p`).text("?");
        break;
        case "all":
            $(`#crystals_needed > div > p`).text("?");
            $(`#crystals_used > div > p`).text("?");
        break;
    }

}

function display_crystals(element, crystals){
    $(`#${element} > div > p[name=small]`).text(crystals.small);
    $(`#${element} > div > p[name=medium]`).text(crystals.medium);
    $(`#${element} > div > p[name=large]`).text(crystals.large);
}

function sum_crystals(min, max) {
    let obj = {
        small: 0,
        medium: 0,
        large: 0
    };

    for(let i = min; i < max; i++){
        let lvl = crystals[i];
        obj.small  += lvl.small;
        obj.medium += lvl.medium;
        obj.large  += lvl.large;
    }
    return obj;
}

function toggleSelected(hero){
    $("#selected_hero p").text(hero.hero_name);

    let previous = $("#main").find(".selected");
    let current = $(`#div_${squash_name(hero.hero_name)}`)[0];

    if (previous.length > 0) {
        $(previous).removeClass("selected");
    }
    $(current).addClass("selected");

    let color = set_color(hero.crystal_color);
    $("#lvl_calculator").css("background-color", color.background);
    $("#selected_hero > img").css("border-color", color.border);
    $("#selected_hero > img")[0].setAttribute("src", current.children[0].src);
    $(".crystal_info").css("border-color", color.border);
    $(".crystal_info").css("box-shadow", `2px 2px 5px ${color.border}`);
    $("label").css("color", color.font);
    $("label").css("background-color", color.border);
}

// ********************** DISPLAY STUFF **********************
//parse the json hero into a html hero div and return it
function build_hero_div(hero){
    let prop = `text-shadow: .3px .8px ${hero.crystal_color}`;
    let hero_element = `    
        <img class="hero_icon" src="${hero.hero_icon}"></img>
        <p class="name" style="${prop}">${hero.hero_name}</p>
        <p class="role">${hero.role}</p>
        <img class="weapon_icon" src="${hero.weapon_icon}"></img>    
        <img class="crystal_icon" src="${hero.crystal_icon}"></img>
    `;

    let div = document.createElement('div');
    div.innerHTML = hero_element;

    div.setAttribute("class", "hero");
    div.setAttribute("id", `div_${squash_name(hero.hero_name)}`)
    div.addEventListener("click", () => toggleSelected(hero));

    return div;
}

// filteres heroes to match color arg with crystal color and adds them to a new div
function build_crystal_div(color) {
    let div = document.createElement("div");
    div.setAttribute("class", `crystal_section crystal_${color}`);

    let bg_color = set_color(color).background;

    div.setAttribute("style", `background-color:${bg_color}`);
    let html = heroes.
        filter(hero => hero.crystal_color === color)
        .map(hero => build_hero_div(hero))
        .forEach(element => {
            div.appendChild(element);
        });

    return div;
}

function fill_page(){
    let colors = ["black", "white", "green", "orange", "red", "blue"];
    let content = colors.map(color => build_crystal_div(color));

    content.forEach(c => {
        document.getElementById("main").appendChild(c) 
    });
}

// takes a crystal color [red, blue, black etc] and returns the palleted hex version
function set_color(color){
    let bd_color = "";
    let bg_color = "";

    switch(color){
        case "red":
            bd_color = "#AA3F39";
            bg_color = "#ddb2af";
            font = "hotpink";
            break;
        case "blue":
            bd_color = "#2E4172";
            bg_color = "#abb3c6";
            font = "cyan";
            break;
        case "white":
            bd_color = "#959595";
            bg_color = "#d4d4d4";
            font = "white";
            break;
        case "black":
            bd_color = "#482E74";
            bg_color = "#b5abc7";
            font = "magenta";
            break;
        case "green":
            bd_color = "#2C8437";
            bg_color = "#aacdaf";
            font = "lime";
            break;
        case "orange":
            bd_color = "#AA9D39";
            bg_color = "#ddd7af"
            font = "yellow";
            break;
    }

    return {
        "background": bg_color,
        "border" : bd_color,
        "font" : font
    };
}

//takes a string and returns it with no whitespace
const squash_name = name => 
    $.trim(name).split(' ').join('');

// ********************** FETCH THE JSON **********************
// onpageready fetch heroes json and populate local array
function get_heroes() {
    $.ajax({
        url: `${root}dffoo.json`,
        context: document.body,
        contentType: "text/plain"
    }).then(response => {
        let json = JSON.parse(response);
        
        json.heroes.map(hero => {
            let built_hero = {
                "hero_name": hero.name,
                "hero_icon": hero.icon,
                "crystal_color": hero.crystal,
                "crystal_icon": json.crystals
                    .filter(c => c.color === hero.crystal)[0].icon,
                "role": hero.role,
                "weapon_type": hero.weapon,
                "weapon_icon": json.weapon_types
                    .filter(w => w.type === hero.weapon)[0].icon
            };
            heroes.push(built_hero);
        });
    }).then(fill_page);
}

// onpageready fetch crystal json and populate local array
function get_crystal_levels() {
    $.ajax({
        url: `${root}crystal_strength.json`,
        context: document.body,
        contentType: "text/plain"
    }).then(r => {
        let json = JSON.parse(r);
        json.levels.map(level => crystals.push(level));
    });
}

// kupo onclick event
function kupo(){
    let kupo = $("#kupo");
    if(kupo[0].attributes.src.value){
        kupo.attr("src", "");
    } else {
        kupo.attr("src", "https://i.imgur.com/sSAmwFw.png");
        setTimeout(() => {
            $(kupo).attr('src', "");
        }, 5000);
    }
}