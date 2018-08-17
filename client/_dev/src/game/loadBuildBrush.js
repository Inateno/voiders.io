define( [ 'DREAM_ENGINE', 'config' ],
function( DE, config )
{
  /******************
   * brush used to place a tile
   */
  var brush;
   
  var _called = false;
  function loadBuildBrush( Game, player )
  {
    if ( _called ) {
      return console.warn( "loadBuildBrush already called, preventing double call. Check the code" );
    }
    _called = true;
    
    brush = new DE.GameObject( {
      zindex: 100
      ,renderer: new DE.SheetRenderer( config.TILES[ 1 ].sheetIds[ 0 ], { scale: 0.5 } )
    } );
    
    brush.currentTile;
    brush.enable = false;
    brush.axes = { x: 0, y: 1 };
    brush.worldPos = { x: 0, y: 0 };
    brush.offsets = { x: 0, y: 0 };
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
    }
    brush.placeTile = function()
    {
      if ( !Inventory.hasTile( this.currentTile ) ) {
        // TODO play sound "empty"
        console.warn( "go make some tiles before trying to use it" );
        return;
      }
      
      var wx = this.worldPos.x + this.offsets.x;
      var wy = this.worldPos.y + this.offsets.y;
      
      if ( wy < config.WORLD_DATA.length
        && wx < config.WORLD_DATA[ wy ].length
        && config.WORLD_DATA[ wy ][ wx ] != 0
        && config.WORLD_DATA[ wy ][ wx ] != -1 ) {
        // TODO play sound "error"
        console.log( "no way, already something here fucker", config.WORLD_DATA[ wy ][ wx ] );
        return;
      }
      else {
        if ( wy < 0 || wx < 0 || wy >= config.WORLD_DATA.length || wx >= config.WORLD_DATA[ wy ].length ) {
          // TODO play sound "error"
          console.warn( "limit reach, you literally ran out of space" );
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
          if ( ns[ i ] != 0 && ns[ i ] != -1 && config.TILES[ ns[ i ] ] && tileData.compatibleTilesTypes.indexOf( config.TILES[ ns[ i ] ].type ) == -1 ) {
            // TODO play sound "error"
            console.warn( "Incompatible type detected" );
            this.renderer.setTint( "0xff3333" );
            return;
          }
        }
        
        DE.emit( "send-place-tile", this.currentTile, wx, wy );
      }
    };
    
    // when player move on the world coordinates
    player.on( "worldPositionChanged", function( wx, wy, axes, direction )
    {
      brush.worldPos.x = wx;
      brush.worldPos.y = wy;
      updateBrushPos( wx, wy, axes, direction );
    } );
    player.on( "update-axes", function( axes, direction )
    {
      console.log( "player update axes, direction", axes, direction )
      updateBrushPos( brush.worldPos.x, brush.worldPos.y, axes, direction );
    } )
    
    DE.on( "change-building-tile", function( tileId )
    {
      Game.currentTile = tileId;
      brush.currentTile = tileId;
      brush.renderer.texture = DE.PIXI.utils.TextureCache[ config.TILES[ tileId ].sheetIds[ 0 ] ];
    } );
    return brush;
  }
  
  function updateBrushPos( wx, wy, axes, direction )
  {
    brush.updateAxes( axes.x, axes.y );
    
    var offsetX = 0;
    var offsetY = 0;
    switch( direction )
    {
      case 0:
        offsetX = 1;
        offsetY = 1;
        break;
      case 1:
        offsetX = 1;
        offsetY = 0;
        break;
      case 2:
        offsetX = 1;
        offsetY = -1;
        break;
      case 3:
        offsetX = 0;
        offsetY = -1;
        break;
      case 4:
        offsetX = -1;
        offsetY = -1;
        break;
      case 5:
        offsetX = -1;
        offsetY = 0;
        break;
      case 6:
        offsetX = -1;
        offsetY = 1;
        break;
      case 7:
        offsetX = 0;
        offsetY = 1;
        break;
    }
    
    brush.offsets.x = offsetX;
    brush.offsets.y = offsetY;
    
    wx += offsetX;
    wy += offsetY;
    
    brush.vector2.setPosition(
      ( wx - wy ) * config.WORLD.TILE_W_HALF,
      ( wx + wy ) * config.WORLD.TILE_H_HALF
    );
    
    // not a free slot
    if ( !Inventory.hasTile( brush.currentTile ) ) {
      brush.renderer.setTint( "0xff3333" );
    }
    else {
      brush.renderer.setTint( "0xffffff" );
    }
  }
  
  return loadBuildBrush;
} );