const collections = require( "../mongo/collections" );
const objects = require ( "./data/objects" );

console.log( "Dropping old collection" );
collections.WorldObjects.collection.drop();
console.log( "Start insert" );
var timeStart = Date.now();
var i = 0;
var sleep_every = 20000;
var map_offset = 2000;

function save( index, res, rej )
{
  if ( index != 0 && index % sleep_every == 0 ) {
    console.log( "Let JS engine rest, time for memory allocation to drop ;)" );
    setTimeout( function()
    {
      save( index, res, rej );
    }, 20000 ); // 20 sec is perfect timing for garbage collector clean
    return;
  }
  
  if ( index >= objects.length ) {
    // process.send( "finish_finish" );
    console.log( "process is over ? ", index );
    return res();
  }
  
  var o = objects[ index ];
  
  console.log( o );
  
  collections.WorldObjects.createOnTileCreated( o.oId, o.x + map_offset, o.y + map_offset )
  .then( () => {
    return save( ++index, res, rej );
  } )
}

module.exports = function()
{
  return new Promise( ( res, rej ) => {
    save( 0, res, rej );
  } )
  .catch( err => {
    console.error( "Saving stuff crashed because:" );
    console.error( err );
    process.exit();
  } );
};