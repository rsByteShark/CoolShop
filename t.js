const { vercelProdFetch } = require("./utils/generalBackendUtils")
const dotenv = require("dotenv");


// vercelProdFetch('https://fakestoreapi.com/products/1').then(res => {

//     res.json().then(data => {

//         console.log(data);


//     });


// })


const obj = { something: 20, cos: 30 };

let x = {};


dotenv.populate(x, obj);

console.log(x);
