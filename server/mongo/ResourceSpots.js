const mongoose = require ( "mongoose" );
const config = require ( "../config" );

var Schema = mongoose.Schema;

var schema = new Schema( {
  x        : { type: Number }
  ,y       : { type: Number }
  ,spot_id : { type: String }
  ,energy  : { type: Number } // actually this is used only inside the memory lol, restarting the server will refuel all spots
  ,loc     : { type: [Number, Number], default: [0,0]}//, index: '2d', sparse: true, unique: true}
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
        liteChunk.push( [ flatchunk[ i ].id, flatchunk[ i ].x, flatchunk[ i ].y, flatchunk[ i ].spot_id ] );
      }
      
      return res( liteChunk );
    } );
  } );
};

schema.statics.createOnTileCreated = function( spotId, x, y )
{
  return new Promise( ( res, rej ) => {
    var object = new ResourceSpots( {
      x
      ,y
      ,spot_id: spotId
      ,loc    : [ x, y ]
    } );
    
    object.save( err => {
      if ( err ) {
        return rej( err );
      }
      return res( object );
    } );
  } );
}

var ResourceSpots;
function make( connection ) {
  if ( ResourceSpots )
    return ResourceSpots;
  ResourceSpots = connection.model( 'ResourceSpot', schema );
  ResourceSpots.collection.createIndex({ "loc": "2d" }, { min: 0, max: 5000 });
  return ResourceSpots;
}
module.exports = make;