Creating a JSON object for Wibble Wobble EU.

Can be queried like this: 
```javascript
let yokai = require('./wibble-wobble/eu/yokai.json');

// find(property, value) on yokai list and return an array of matches
let find = (prop, arg) => yokai.filter(element => element[prop] === arg);

// example use
let siro = find("name", "Siro");
let s_rank_yokai = find("rank", "S");
let brave_yokai = find("tribe", "Brave");
```