define( [ 'DREAM_ENGINE', 'config' ],
function( DE, config )
{
  function ResourceSpot( id, worldX, worldY )
  {
    console.log( "resource spot", id, worldY, worldX );
    this._data = config.RESOURCES_SPOTS[ id ];
    DE.GameObject.call( this, {
      x         : ( worldX - worldY ) * config.WORLD.TILE_W_HALF
      , y       : ( worldX + worldY ) * config.WORLD.TILE_H_HALF
      , zindex  : 2
      , renderer: new DE.SpriteRenderer( this._data.rendererOpts )
    } );
    
    this.energy         = this._data.maxEnergy;
    this.colliderRadius = this._data.colliderRadius;
  }
  
  ResourceSpot.prototype = new DE.GameObject();
  ResourceSpot.prototype.constructor = ResourceSpot;
  ResourceSpot.prototype.supr        = DE.GameObject.prototype;
  
  ResourceSpot.prototype.getDamage = function( player )
  {
    this.shake( 10, 10, 200 );
    // if ( this.energy <= 0 ) {
    //   return;
    // }
    
    this.energy -= player.atk;
    // dropEvery // TODO use this later
    var drop = this._data.minimumDrop + Math.random() * this._data.extraLuckDrop >> 0;
    var vector2 = new DE.Vector2().getVector( player, this );
    
    for ( var i = 0, obj, posr; i < drop; ++i )
    {
      posr = this._data.dropOffsets[ Math.random() * this._data.dropOffsets.length >> 0 ];
      
      obj = new DE.GameObject( {
        zindex    : 10
        ,x        : posr[ 0 ] + vector2.x
        ,y        : posr[ 1 ] + vector2.y
        , renderer: new DE.SheetRenderer( config.RESOURCES[ this._data.drop ].sheetId )
      } );
      obj.moveTo( { x: 0, y: 0 }, 800, function()
      {
        player.getLoot( this );
        this.fadeOut( 200, true, this.askToKill );
      } );
      
      // parent should be the scene for this type of object
      player.add( obj );
    }
  }
  
  return ResourceSpot;
} );