define( [ 'DREAM_ENGINE', 'config' ],
function( DE, config )
{
  /******************
   * brush used to place a tile
   */
   
  var _called = false;
  function loadBuildBrush( Game, player )
  {
    if ( _called ) {
      return console.warn( "loadBuildBrush already called, preventing double call. Check the code" );
    }
    _called = true;
    
    var brush = new DE.GameObject( {
      zindex: 100
      ,renderer: new DE.SheetRenderer( config.TILES[ 1 ].sheetIds[ 0 ], { scale: 0.5 } )
    } );
    
    brush.currentTile;
    brush.enable = false;
    brush.axes = { x: 0, y: 1 };
    brush.worldPos = { x: 0, y: 0 };
    brush.toggle = function( mode ) {
      this.enable = mode != "fight";
      this.updateAxes( this.axes.x, this.axes.y );
    };
    
    // get the new player orientation
    brush.updateAxes = function( x, y )
    {
      if ( x == 0 && y == 0 ) {
        return;
      }
      
      this.axes.x = x;
      this.axes.y = x;
      this.focusOffset = {
         x: x * config.WORLD.TILE_W_HALF * 4
        ,y: y * config.WORLD.TILE_H_HALF * 4
      };
    }
    brush.placeTile = function()
    {
      var wx = this.worldPos.x;
      var wy = this.worldPos.y;
      
      if ( wy < config.WORLD_DATA.length
        && wx < config.WORLD_DATA[ wy ].length
        && config.WORLD_DATA[ wy ][ wx ] != 0 ) {
        // TODO play sound "error"
        console.log( "no way, already something here fucker" );
        return;
      }
      else {
        // We should be able to make the map bigger dynamically but the lazy rendering is tricky to update with this
        // if ( wy >= config.WORLD_DATA.length || wx >= config.WORLD_DATA[ wy ].length ) {
        //   // y doesn't exist, add a row
        //   if ( wy >= config.WORLD_DATA.length ) {
        //     var row = [];
        //     for ( var x = 0; x < config.WORLD_DATA[ 0 ].length; ++x )
        //     {
        //       row.push( 0 );
        //     }
        //     config.WORLD_DATA.push( row );
        //   }
        //   // y exist but not the X, have to parse all Y and add an entry
        //   else {
        //     for ( var y = 0; y < config.WORLD_DATA.length; ++y )
        //     {
        //       config.WORLD_DATA[ y ].push( 0 );
        //     }
        //   }
        //   // config.WORLD_DATA[ wy ][ wx ];
        // }
        if ( wy < 0 || wx < 0 || wy >= config.WORLD_DATA.length || wx >= config.WORLD_DATA[ wy ].length ) {
          // TODO play sound "error"
          console.warn( "limit reach, you literally ran out of space" );
          return;
        }
        
        if ( !Inventory.hasTile( this.currentTile ) ) {
          // TODO play sound "empty"
          console.warn( "go make some" );
          return;
        }
        
        // test if we can place this block here
        // get neighbors
        var tileData = config.TILES[ this.currentTile ];
        console.log( "compatibility: ", tileData.compatibleTilesTypes );
        var ns = [
          config.WORLD_DATA[ wy - 1 ][ wx ],
          config.WORLD_DATA[ wy + 1 ][ wx ],
          config.WORLD_DATA[ wy ][ wx + 1 ],
          config.WORLD_DATA[ wy ][ wx - 1 ],
          config.WORLD_DATA[ wy - 1 ][ wx + 1 ],
          config.WORLD_DATA[ wy + 1 ][ wx + 1 ],
          config.WORLD_DATA[ wy - 1 ][ wx - 1 ],
          config.WORLD_DATA[ wy + 1 ][ wx - 1 ]
        ];
        
        for ( var i = 0; i < ns.length; ++i )
        {
          if ( ns[ i ] != 0 && tileData.compatibleTilesTypes.indexOf( config.TILES[ ns[ i ] ].type ) == -1 ) {
            // TODO play sound "error"
            console.warn( "Incompatible type detected" );
            this.renderer.setTint( "0xff3333" );
            return;
          }
        }
        
        config.WORLD_DATA[ wy ][ wx ] = this.currentTile;
        Inventory.useTile( this.currentTile );
        DE.emit( "new-tiles", [ { x: wx, y: wy, id: this.currentTile } ] );
      }
    };
    
    // when player move on the world coordinates
    player.on( "worldPositionChanged", function( wx, wy, axes )
    {
      Game.scene.sortGameObjects();
      brush.updateAxes( axes.x, axes.y );
      
      if ( axes.y < 0 && axes.x < 0 ) { wx -= 2; }
      else if ( axes.y < 0 ) { wy -= 2; }
      else if ( axes.x > 0 ) { wx += 2; }
      else if ( axes.y > 0 ) { wy += 2; }
      else if ( axes.x < 0 ) { wx -= 2; }
      
      brush.vector2.setPosition(
        ( wx - wy ) * config.WORLD.TILE_W_HALF,
        ( wx + wy ) * config.WORLD.TILE_H_HALF
      );
      brush.worldPos.x = wx;
      brush.worldPos.y = wy;
      
      // not a free slot
      if ( wy < 0 || wx < 0
        || !Inventory.hasTile( brush.currentTile )
        || wy >= config.WORLD_DATA.length
        || wx >= config.WORLD_DATA[ wy ].length
        || ( wy < config.WORLD_DATA.length
          && wx < config.WORLD_DATA[ wy ].length
          && config.WORLD_DATA[ wy ][ wx ] != 0 ) ) {
        brush.renderer.setTint( "0xff3333" );
      }
      else {
        brush.renderer.setTint( "0xffffff" );
      }
    } );
    
    DE.on( "change-building-tile", function( tileId )
    {
      Game.currentTile = tileId;
      brush.currentTile = tileId;
      brush.renderer.texture = DE.PIXI.utils.TextureCache[ config.TILES[ tileId ].sheetIds[ 0 ] ];
    } );
    return brush;
  }
  
  return loadBuildBrush;
} );