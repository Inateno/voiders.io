const config   = require( "../config" );
const mongoose = require( "mongoose" );
// var autoIncrement = require( "mongoose-auto-increment" );
// FIX Mongoose warning ERROR CHECK https://github.com/Automattic/mongoose/issues/4291
// (not using promise just callbacks)
mongoose.Promise = global.Promise

// Connect to DB
var connection;
function tryConnect() {
  
  connection = mongoose.createConnection( config.db_url, ( err ) => {
    if ( err ) {
      console.error( "MongoDB connection error: ", err );
      // should try to reconnect, but just failing for now
      // setTimeout( function(){ tryConnect(); }, 1000 );
    }
    else {
      console.log( "MongoDB connexion Success" );
      // should be better to create and reconnect collections after this
      // afterConnection();
    }
  } );
}
tryConnect();

var collections = {
  "Users": null,
  "Map": null
};

const Users         = require( "./Users" )( connection );
const Map           = require( "./Map" )( connection );
const WorldObjects  = require( "./WorldObjects" )( connection );
const ResourceSpots = require( "./ResourceSpots" )( connection );

collections = {
  "Users"        : Users,
  "Map"          : Map,
  "WorldObjects" : WorldObjects,
  "ResourceSpots": ResourceSpots
};

module.exports = collections;