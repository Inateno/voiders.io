const collections = require( "../mongo/collections" );
const map = require ( "./data/map" );

console.log( "Dropping old collection" );
collections.Map.collection.drop();
console.log( "Start insert hell loop" );
var timeStart = Date.now();
var i = 0;
var sleep_every = 20000;
var map_offset = 2000;
function save( x, y, res, rej )
{
  if ( x >= map[ y ].length ) {
    x = 0;
    ++y;
    
    if ( i % sleep_every == 0 ) {
      console.log( "Let JS engine rest, time for memory allocation to drop ;)" );
      setTimeout( function()
      {
        save( x, y, res, rej );
      }, 20000 ); // 20 sec is perfect timing
      return;
    }
  }
  
  if ( y >= map.length ) {
    // process.send( "finish_finish" );
    console.log( "process is over ? ", x, y );
    return res();
  }
  
  console.log( "=>", i, x, y );
  
  var tile = new collections.Map( {
    x            : x + map_offset
    ,y           : y + map_offset
    ,value       : map[ y ][ x ]
    ,creator_nick: "BIG-BANG"
    ,loc         : [ x + map_offset, y + map_offset ]
  } );
  tile.save( ( err, doc ) => {
    if ( err ) { throw err; }
    ++i;
    save( ++x, y, res, rej );
  } );
}

module.exports = function()
{
  return new Promise( ( res, rej ) => {
    save( 0, 0, res, rej );
  } )
  .catch( err => {
    console.error( "Saving stuff crashed because:" );
    console.error( err );
    process.exit();
  } );
};