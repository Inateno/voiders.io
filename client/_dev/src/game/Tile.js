define( [ 'DREAM_ENGINE', 'config' ],
function( DE, config )
{
  function Tile( tileId, worldX, worldY )
  {
    var tileData = config.TILES[ tileId ];
    DE.GameObject.call( this, {
      x         : ( worldX - worldY ) * config.WORLD.TILE_W_HALF
      , y       : ( worldX + worldY ) * config.WORLD.TILE_H_HALF
      , renderer: new DE.SheetRenderer( tileData.sheetIds[ Math.random() * tileData.sheetIds.length >> 0 ], { scale: 0.5 } )
      , worldPos: { x: worldX, y: worldY }
      , tileId  : tileId
    } );
    
    this.updatable = false;
    this.toggleVoid();
  }
  
  Tile.prototype = new DE.GameObject();
  Tile.prototype.constructor = Tile;
  Tile.prototype.supr        = DE.GameObject.prototype;
  
  Tile.prototype.updateTile = function( newTile )
  {
    this.tileId = newTile;
    var sheets = config.TILES[ newTile ].sheetIds;
    this.x = ( this.worldPos.x - this.worldPos.y ) * config.WORLD.TILE_W_HALF;
    this.y = ( this.worldPos.x + this.worldPos.y ) * config.WORLD.TILE_H_HALF;
    this.renderer.texture = DE.PIXI.utils.TextureCache[ sheets[ Math.random() * sheets.length >> 0 ] ];
    this.toggleVoid();
  };
  
  Tile.prototype.fadeVoid = function()
  {
    if ( this.alpha < 0.8 ) {
      this.fade( this.alpha, 1, 1500 + Math.random() * 1000, false, this.fadeVoid );
    }
    else {
      this.fade( this.alpha, 0.5, 1500 + Math.random() * 1000, false, this.fadeVoid );
    }
  };
  
  Tile.prototype.toggleVoid = function()
  {
    if ( this.tileId == 0 ) {
      // this.updatable = true;
      this.zindex = 2;
      this.y -= 24;
      this.fadeVoid();
      this.alpha = 0.8;
    }
    else {
      // this.updatable = false;
      this.zindex = 0;
      this._fadeData.done = true;
      this.alpha = 1;
    }
  };
  
  return Tile;
} );