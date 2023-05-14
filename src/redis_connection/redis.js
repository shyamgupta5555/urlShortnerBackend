const redis = require('redis');

const { promisify } = require('util');

let redisClient = redis.createClient(
    15571,
    'redis-15571.c264.ap-south-1-1.ec2.cloud.redislabs.com',
    {no_ready_check:true}
)


redisClient.auth(
    'CdyqRcqkkDqIMDLaZD5WYvhlSkv4bu3M',
    function(err){
        if(err) console.log(err.message);
    }
)

redisClient.on('connect', async function(){
    console.log("Connected to redis.");
});

const GET = promisify(redisClient.GET).bind(redisClient);
const SET = promisify(redisClient.SETEX).bind(redisClient);

module.exports = {GET, SET};