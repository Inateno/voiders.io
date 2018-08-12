define( [ 'DREAM_ENGINE', 'config', 'Tile' ],
function( DE, config, Tile )
{
  /******************
   * loadMap
   * load the map, initiate the lazy loading and the update of the WORLD_DATA (map data)
   */
  
  var _called = false;
  function loadMap( Game, myPlayer )
  {
    if ( _called ) {
      return console.warn( "LoadMap already called, preventing double call. Check the code" );
    }
    _called = true;
    
    var myPos = myPlayer.worldPosition;
    config.mapTiles = [];
    var mapTiles = config.mapTiles;
    
    // Game.map = new DE.GameObject();
    // Game.map.updatable = false;
    // Game.scene.add( Game.map );
    Game.map = Game.scene; // if I don't want to use map finally
    
    for ( var y = myPos.y - config.LAZY_LOAD_RANGE; y < myPos.y + config.LAZY_LOAD_RANGE; ++y )
    {
      mapTiles.push( [] );
      for ( var x = myPos.x - config.LAZY_LOAD_RANGE, tileId, obj; x < myPos.x + config.LAZY_LOAD_RANGE; ++x )
      {
        // todo replace by a Tile class ?
        obj = new Tile( config.WORLD_DATA[ y ][ x ], x, y );
        Game.map.add( obj );
        mapTiles[ y - ( myPos.y - config.LAZY_LOAD_RANGE ) ].push( obj );
      }
    }
    
    myPlayer.on( "worldPositionChanged", function( wx, wy, axes )
    {
      var cut = [];
      var deltaY = 0;
      var deltaX = 0;
      
      var firstTilePos = mapTiles[ 0 ][ 0 ].worldPos;
      var lastTilePos = mapTiles[ mapTiles.length - 1 ][ mapTiles[ mapTiles.length - 1 ].length - 1 ].worldPos;
      
      if ( wy - firstTilePos.y > config.LAZY_LOAD_RANGE ) {
        cut = mapTiles.splice( 0, 1 )[ 0 ];
        mapTiles.push( cut );
        deltaY = config.LAZY_LOAD_RANGE * 2;
      }
      else if ( lastTilePos.y - wy > config.LAZY_LOAD_RANGE ) {
        cut = mapTiles.splice( mapTiles.length - 1, 1 )[ 0 ];
        mapTiles.unshift( cut );
        deltaY = -config.LAZY_LOAD_RANGE * 2;
      }
      
      for ( var i = 0; i < cut.length; ++i )
      {
        cut[ i ].worldPos.y += deltaY;
        cut[ i ].updateTile( config.WORLD_DATA[ cut[ i ].worldPos.y ][ cut[ i ].worldPos.x ] );
      }
      
      cut = [];
      firstTilePos = mapTiles[ 0 ][ 0 ].worldPos;
      lastTilePos = mapTiles[ mapTiles.length - 1 ][ mapTiles[ mapTiles.length - 1 ].length - 1 ].worldPos;
      if ( wx - firstTilePos.x > config.LAZY_LOAD_RANGE ) {
        for ( var y = 0; y < mapTiles.length; ++y )
        {
          cut.push( mapTiles[ y ].splice( 0, 1 )[ 0 ] );
          mapTiles[ y ].push( cut[ cut.length - 1 ] );
        }
        deltaX = config.LAZY_LOAD_RANGE * 2;
      }
      else if ( lastTilePos.x - wx > config.LAZY_LOAD_RANGE ) {
        for ( var y = 0; y < mapTiles.length; ++y )
        {
          cut.push( mapTiles[ y ].splice( mapTiles[ y ].length - 1, 1 )[ 0 ] );
          mapTiles[ y ].unshift( cut[ cut.length - 1 ] );
        }
        deltaX = -config.LAZY_LOAD_RANGE * 2;
      }
      
      for ( var i = 0; i < cut.length; ++i )
      {
        cut[ i ].worldPos.x += deltaX;
        cut[ i ].updateTile( config.WORLD_DATA[ cut[ i ].worldPos.y ][ cut[ i ].worldPos.x ] );
      }
      
      // if ( deltaX > 0 || deltaY > 0 ) {
      //   Game.map.sortGameObjects();
      // }
      // Game.scene.sortGameObjects();
    } );
    
    DE.on( "new-tiles", function( tiles )
    {
      var updated = {};
      
      for ( var i = 0, obj, tile; i < tiles.length; ++i )
      {
        tile = tiles[ i ];
        obj = new Tile( tile.id, tile.x, tile.y );
        updated[ tile.y + "-" + tile.x ] = obj;
      }
      
      for ( var y = 0; y < mapTiles.length; ++y )
      {
        for ( var x = 0, tile; x < mapTiles[ y ].length; ++x )
        {
          wpos = mapTiles[ y ][ x ].worldPos;
          if ( updated[ wpos.y + "-" + wpos.x ] !== undefined ) {
            if ( mapTiles[ y ][ x ].updatable ) {
              mapTiles[ y ][ x ].fadeOut( 500, true, mapTiles[ y ][ x ].askToKill );
            }
            else {
              mapTiles[ y ][ x ].askToKill();
            }
            mapTiles[ y ][ x ] = updated[ wpos.y + "-" + wpos.x ];
            Game.map.add( updated[ wpos.y + "-" + wpos.x ] );
            delete updated[ wpos.y + "-" + wpos.x ];
          }
          if ( Object.keys( updated ).length === 0 ) {
            y = mapTiles.length;
            break;
          }
        }
      }
      
      /***
       * once it's done, check if some tiles have been added in the surrounding void, if so, extend the void matrix
       * ==> when we add tiles at the limit of the map, the map need to extend the arrays
       * actually this is commented because the most "simple" for the LD is to generate a biiiig array, and the limit wont be passed in few weeks lol
       **/
        // var beginRowsAdded = false,
        //     beginColsAdded = false,
        //     endingRowsAdded = false,
        //     endingColsAdded = false;
        // var tilesCreated = [];
        // for ( var i = 0, obj, tile; i < tiles.length; ++i )
        // {
        //   if ( tiles[ i ].id == 0 ) {
        //     continue;
        //   }
          
        //   tile = tiles[ i ];
        //   if ( !beginRowsAdded && tile.x < 2 ) {
        //     // add a x before every y
        //     for ( var y = 0; y < config.WORLD_DATA.length; ++y )
        //     {
        //       config.WORLD_DATA[ y ].unshift( 0 );
        //     }
        //     beginRowsAdded = true;
        //   }
        //   if ( !beginColsAdded && tile.y < 2 ) {
        //     var row = [];
        //     for ( var x = 0; x < config.WORLD_DATA[ 0 ].length; ++x )
        //     {
        //       row.push( 0 );
        //     }
        //     config.WORLD_DATA.unshift( row );
        //     beginColsAdded = true;
        //   }
        //   if ( !endingColsAdded && tile.y >= config.WORLD_DATA.length - 3 ) {
        //     var row = [];
        //     for ( var x = 0; x < config.WORLD_DATA[ 0 ].length; ++x )
        //     {
        //       row.push( 0 );
        //     }
        //     config.WORLD_DATA.push( row );
        //     endingColsAdded = true;
        //   }
        //   if ( !endingRowsAdded && tile.x >= config.WORLD_DATA[ tile.y ].length - 3 ) {
        //     for ( var y = 0; y < config.WORLD_DATA.length; ++y )
        //     {
        //       config.WORLD_DATA[ y ].push( 0 );
        //     }
        //     endingRowsAdded = true;
        //   }
        // }
        
        // if ( beginRowsAdded
        //   || beginColsAdded
        //   || endingRowsAdded
        //   || endingColsAdded ) {
        //   // TODO créer les cases void et tout décaler !
        // }
      
      Game.scene.sortGameObjects();
      // Game.map.sortGameObjects();
    } );
  }
  
  return loadMap;
} );