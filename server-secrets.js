var DB_URL = process.env.HEROKU_POSTGRESQL_JADE_URL;
var useSSL = process.env.USE_SSL;

module.exports = {
    DB_URL : DB_URL,
    useSSL : useSSL
};

function isLive(){
    return (DB_URL == DB_LIVE_URL)? true : false;
}
