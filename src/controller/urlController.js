const urlModel = require('../models/ulrModel');
const shortId = require('shortid');
const axios = require('axios');
const redis = require('../redis_connection/redis');

exports.genrateShortUrl = async function (req, res) {
    try {

        let originalUrl = req.body.longUrl;
        if (originalUrl) originalUrl = originalUrl.toString().trim();
        if (!originalUrl || originalUrl == "") return res.status(400).send({ status: false, mesaage: "Please provide url." });
        
    //  redis get data 
        const catchedData = await redis.GET(`${originalUrl}`);
        if(catchedData) return res.status(200).send({ status: true, message: "Url already genrated.", data: JSON.parse(catchedData)});

//   axios check longurl
       let isValid
        await axios.get(originalUrl).then(() => { isValid = true }).catch(() => { isValid = false });
        if (isValid == false) return res.status(400).send({ status: false, message: "Please provide valid url" });
//   find data base long url

        const data = await urlModel.findOne({ longUrl: originalUrl }).select({ _id: 0, longUrl: 1, shortUrl: 1, urlCode: 1 });
        if (data){
            res.status(200).send({ status: true, message: "Url already genrated.", data: data });
            return await redis.SET(`${data.longUrl}`,24,JSON.stringify(data));
        }
//  generate shortid

        let urlCode = shortId.generate();

        let obj = {
            urlCode: urlCode.toLowerCase(),
            shortUrl: `http://localhost:3000/${urlCode}`,
            longUrl: originalUrl
        }
        await urlModel.create(obj);
        res.status(201).send({ status: true, message: "Url genrated.", data: obj });
        await redis.SET(`${obj.longUrl}`,24,JSON.stringify(obj));
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}


exports.getUrl = async function (req, res) {
    try {
        const urlCode = req.params.urlCode;

        if (!shortId.isValid(urlCode)) return res.status(400).send({ stats: false, message: "Please send valid urlCode" });
        //  chech get the data
        const catchedData = await redis.GET(`${urlCode}`);
        if(catchedData) return res.redirect(302, catchedData);
        // find the urlcode 
        const originalUrl = await urlModel.findOne({ urlCode: urlCode.toLowerCase() }).select({ _id: 0, longUrl: 1 });
        if (!originalUrl) return res.status(404).send({ status: false, message: "url not found." });
    
        res.redirect(302, originalUrl.longUrl);
        // redis set
        await redis.SET(`${urlCode}`,24,`${originalUrl.longUrl}`);
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}










// let promise = new Promise(function(resolve, reject) {
  
//     setTimeout(() => resolve("done"), 1000);
//   });

//   console.log(promise)




//   let user = {
//     name:'Gaurav',
//      age:25,
//     UserId:"id"
// }

// let d =(user)=>{
//     if(!user)console.log("err")
//     console.log(user)}
//     console.log(d)


//     function myCalculator(num1, num2, myCallback) {
//         let sum = num1 + num2;
//         myCallback(sum);
//       }
      
//       myCalculator(5, 5, myDisplayer);


//     //   What is a promise? What are the states of promises. What is promisify?
//     //   Difference between promise and async & await. Is async await notation preferred over promises? If so, why?