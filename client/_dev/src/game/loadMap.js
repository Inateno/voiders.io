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
    
    // some glitch right now but way faster
    if ( DE.PIXI.utils.isMobile.any ) {
      Game.map = new DE.GameObject();
      Game.map.updatable = false;
      Game.scene.add( Game.map );
    }
    else {
      Game.map = Game.scene; // if I don't want to use map finally
    }
    
    for ( var y = myPos.y - config.LAZY_RENDER_RANGE; y < myPos.y + config.LAZY_RENDER_RANGE; ++y )
    {
      mapTiles.push( [] );
      for ( var x = myPos.x - config.LAZY_RENDER_RANGE, tileId, obj; x < myPos.x + config.LAZY_RENDER_RANGE; ++x )
      {
        // todo replace by a Tile class ?
        obj = new Tile( config.WORLD_DATA[ y ][ x ], x, y );
        Game.map.add( obj );
        mapTiles[ y - ( myPos.y - config.LAZY_RENDER_RANGE ) ].push( obj );
      }
    }
    
    /* NOUVEAU FONCTIONNEMENT SERVER 
      idée: on récupère un flat chunk allégé du serveur en rond (et pas en carré)
      pour remettre ce chunk en matrice c'est chiant, surtout qu'on a pas de minX etc
      
      DONC
      
      on génère de toute façon une grille de void (on fait la grille de 4M ??)
      ensuite le lazy fais son taff normal
      mais quand on reçoi de la data serveur, on vient ré-écrire les valeurs de chaque case dans le chunk où on est
      en lisant de manière plate le flatchunk (y'a juste a récupérer x, y se placer sur la grille foutre la valeur, fini merci de rien)
    */
    
    var lastPosChunkAsked = {
      x: myPos.x,
      y: myPos.y
    }
    myPlayer.on( "worldPositionChanged", function( wx, wy, axes )
    {
      if ( Math.abs( lastPosChunkAsked.x - wx ) + Math.abs( lastPosChunkAsked.y - wy ) > config.LAZY_LOAD_SECURITY ) {
        
        if ( config.WORLD_DATA[ wy + axes.y * 23 >> 0 ][ wx + axes.x * 23 >> 0 ] == -1 ) {
          console.log( "ask chunk" );
          lastPosChunkAsked.x = wx;
          lastPosChunkAsked.y = wy;
          DE.emit( "ask-chunk", wx, wy );
        }
      }
      
      var cut = [];
      var deltaY = 0;
      var deltaX = 0;
      
      var firstTilePos = mapTiles[ 0 ][ 0 ].worldPos;
      var lastTilePos = mapTiles[ mapTiles.length - 1 ][ mapTiles[ mapTiles.length - 1 ].length - 1 ].worldPos;
      
      if ( wy - firstTilePos.y > config.LAZY_RENDER_RANGE ) {
        cut = mapTiles.splice( 0, 1 )[ 0 ];
        mapTiles.push( cut );
        deltaY = config.LAZY_RENDER_RANGE * 2;
      }
      else if ( lastTilePos.y - wy > config.LAZY_RENDER_RANGE ) {
        cut = mapTiles.splice( mapTiles.length - 1, 1 )[ 0 ];
        mapTiles.unshift( cut );
        deltaY = -config.LAZY_RENDER_RANGE * 2;
      }
      
      for ( var i = 0, tileId; i < cut.length; ++i )
      {
        cut[ i ].worldPos.y += deltaY;
        tileId = 0;
        if ( config.WORLD_DATA[ cut[ i ].worldPos.y ] && config.WORLD_DATA[ cut[ i ].worldPos.y ][ cut[ i ].worldPos.x ] ) {
          tileId = config.WORLD_DATA[ cut[ i ].worldPos.y ][ cut[ i ].worldPos.x ];
        }
        cut[ i ].updateTile( tileId );
      }
      
      cut = [];
      firstTilePos = mapTiles[ 0 ][ 0 ].worldPos;
      lastTilePos = mapTiles[ mapTiles.length - 1 ][ mapTiles[ mapTiles.length - 1 ].length - 1 ].worldPos;
      if ( wx - firstTilePos.x > config.LAZY_RENDER_RANGE ) {
        for ( var y = 0; y < mapTiles.length; ++y )
        {
          cut.push( mapTiles[ y ].splice( 0, 1 )[ 0 ] );
          mapTiles[ y ].push( cut[ cut.length - 1 ] );
        }
        deltaX = config.LAZY_RENDER_RANGE * 2;
      }
      else if ( lastTilePos.x - wx > config.LAZY_RENDER_RANGE ) {
        for ( var y = 0; y < mapTiles.length; ++y )
        {
          cut.push( mapTiles[ y ].splice( mapTiles[ y ].length - 1, 1 )[ 0 ] );
          mapTiles[ y ].unshift( cut[ cut.length - 1 ] );
        }
        deltaX = -config.LAZY_RENDER_RANGE * 2;
      }
      
      for ( var i = 0; i < cut.length; ++i )
      {
        cut[ i ].worldPos.x += deltaX;
        tileId = 0;
        if ( config.WORLD_DATA[ cut[ i ].worldPos.y ] && config.WORLD_DATA[ cut[ i ].worldPos.y ][ cut[ i ].worldPos.x ] ) {
          tileId = config.WORLD_DATA[ cut[ i ].worldPos.y ][ cut[ i ].worldPos.x ];
        }
        cut[ i ].updateTile( tileId );
      }
      
      // if ( deltaX > 0 || deltaY > 0 ) {
      //   Game.map.sortGameObjects();
      // }
      // Game.scene.sortGameObjects();
    } );
    
    DE.on( "world-tiles-update", function( tiles )
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