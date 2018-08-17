const config      = require( "../../config" );
const Inventory   = require( "../../utils/Inventory" );
const collections = require( "../../mongo/collections" );

module.exports = function( newValue, worldX, worldY )
{
  var socket = this;
  var timeStarted = Date.now();
  
  if ( !Inventory.hasTile( this.user, newValue ) ) {
    this.emit( "pt-err", "You try to use a tile you don't own my dear, I just updated your Inventory" );
    return this.emit( "u-tiles", this.user.tiles );
  }
  if ( isNaN( worldX ) || isNaN( worldY ) || isNaN( newValue ) ) {
    return this.emit( "pt-err", "Not valid arguments" );
  }
  
  console.log( "user " + this.user.nick + " want to place a tile " + newValue + " at: " + worldY + "/" + worldX );
  // first, retrieve the tile and surrounding
  collections.Map.findOne( { x: worldX, y: worldY } ).exec( ( err, tile ) => {
    
    if ( !tile ) {
      // console.warn( "Try to place something out of bounds" );
      // return socket.emit( "pt-err", "Out of bounds :(" );
      tile = new collections.Map( {
        x         : worldX
        ,y        : worldY
        ,value    : 0
        ,loc      : [ worldX, worldY ]
      } );
    }
    if ( tile.value != 0 ) {
      return socket.emit( "pt-err", "There is already something here" );
    }
    
    // test if we can place socket block here
    // get neighbors
    collections.Map.loadChunk( worldX, worldY, 2 )
    .then( chunk => {
      var tileData = config.TILES[ newValue ];
      
      for ( var i = 0; i < chunk.length; ++i )
      {
        if ( chunk[ i ][ 2 ] != 0 && tileData.compatibleTilesTypes.indexOf( config.TILES[ chunk[ i ][ 2 ] ].type ) == -1 ) {
          return socket.emit( "pt-err", "Incompatible types detected" );
        }
      }
      
      // it's ok, remove resources from to the user
      Inventory.useTile( socket.user, newValue );
      
      // and apply the change
      collections.Map.updateTile( tile, newValue, socket.user.id, socket.user.nick )
      .then( () => {
        var operationDuration = Date.now() - timeStarted;
        console.log( "Tile is place, operation time was " + operationDuration + "ms" );
        socket.broadcast.emit( "pt", newValue, worldX, worldY );
        socket.emit( "pt", newValue, worldX, worldY );
        
        socket.emit( "u-tiles", socket.user.tiles );
        
        // now check for object spawn
        var rnd = Math.random();
        for ( var i = 0, sp, t_id; i < tileData.spawns.length; ++i )
        {
          sp = tileData.spawns[ i ];
          if ( rnd < sp.rate  ) {
            if ( sp.type == "r" ) {
              t_id = sp.id;
            }
            else {
              t_id = sp.ids[ Math.random() * sp.ids.length >> 0 ];
            }
            console.log( "Create a " + ( "r" ? "ResourceSpots" : "WorldObjects" ), sp, "=> " + t_id );
            collections[ sp.type === "r" ? "ResourceSpots" : "WorldObjects" ].createOnTileCreated( t_id, tile.x, tile.y )
            .then( object => {
              if ( sp.type == "r" ) {
                config.WORLD_RESOURCES_SPOTS[ object._id ] = {
                  "id": object._id, "resId": object.spot_id, "x": object.x, "y": object.y
                  , energy: config.RESOURCES_SPOTS[ object.spot_id ].maxEnergy
                };
              }
              else {
                config.WORLD_OBJECTS.push( { "id": object._id, "oId": object.object_id, "x": object.x, "y": object.y } );
              }
              socket.broadcast.emit( "new-r", [ sp.type, object._id, t_id, object.x, object.y ] );
              socket.emit( "new-r", [ sp.type, object._id, t_id, object.x, object.y ] );
            } );
            break;
          }
        }
      } )
    } )
    .catch( err => {
      console.error( "Crap, error while checking tile placement" );
      console.error( err );
      socket.emit( "pt-err", "Internal server error :/" );
    } );
  } );
};