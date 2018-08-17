const mongoose = require ( "mongoose" );
const config = require ( "../config" );

var Schema = mongoose.Schema;

var schema = new Schema( {
  x            : { type: Number }
  ,y           : { type: Number }
  ,value       : { type: Number }
  ,creator_nick: { type: String, default: "BIG-BANG" }
  ,creator_id  : { type: mongoose.Schema.Types.ObjectId }
  ,loc         : { type: [Number, Number], default: [0,0] }//, index: '2d', sparse: true, unique: true, min: 0, max: 5000}
} );

schema.index( { "loc": "2d" }, { min: 0, max: 5000 } );

schema.statics.loadChunk = function( x, y, chunkSize ) {
  return new Promise( ( res, rej ) => {
    this.where( 'loc' ).within( { center: [ x, y ], radius: chunkSize } )
    .lean().exec( ( err, flatchunk ) => {
      
      if ( err ) {
        console.error( "crap it", err );
        return rej( err );
      }
      var liteChunk = [];
      for ( var i = 0; i < flatchunk.length; ++i )
      {
        liteChunk.push( [ flatchunk[ i ].x, flatchunk[ i ].y, flatchunk[ i ].value ] );
      }
      
      console.log( "send a chunk with " + liteChunk.length + " values", x, y, chunkSize );
      return res( liteChunk );
    } );
  } );
};

schema.statics.findAndUpdateTile = function( x, y, value, userId, userNick )
{
  return new Promise( ( res, rej ) => {
    this.findOne( { x, y } ).exec( ( err, tile ) => {
      if ( err ) {
        return rej( err );
      }
      
      if ( !tile ) {
        return rej( "Out of bounds: " + x + "-" + y  );
      }
      
      tile.x   = x;
      tile.y   = y;
      tile.loc = [ x, y ];
      tile.creator_id   = userId;
      tile.creator_nick = userNick;
      
      tile.save( err => {
        if ( err ) {
          return rej( err );
        }
        return res();
      } );
    } );
  } );
};

schema.statics.updateTile = function( tile, newValue, userId, userNick )
{
  return new Promise( ( res, rej ) => {
    tile.creator_id   = userId;
    tile.creator_nick = userNick;
    tile.value        = newValue;
    
    tile.save( err => {
      if ( err ) {
        return rej( err );
      }
      return res();
    } );
  } );
}

var Map;
function make( connection ) {
  if ( Map )
    return Map;
  Map = connection.model( 'Map', schema );
  Map.collection.createIndex({ "loc": "2d" }, { min: 0, max: 5000 });
  return Map;
}
module.exports = make;