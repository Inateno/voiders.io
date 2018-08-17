define( [ 'DREAM_ENGINE', 'config' ],
function( DE, config )
{
  function ResourceSpot( data )
  {
    this._data = config.RESOURCES_SPOTS[ data.resId ];
    DE.GameObject.call( this, {
      x         : ( data.x - data.y ) * config.WORLD.TILE_W_HALF
      , y       : ( data.x + data.y ) * config.WORLD.TILE_H_HALF
      , zindex  : 2
      , renderer: new DE.SheetRenderer( this._data.rendererOpts.sheetId, this._data.rendererOpts )
      , id      : data.id
      , resId   : data.resId
    } );
    
    this.energy         = data.energy;
    this.maxEnergy      = this._data.maxEnergy;
    this.colliderRadius = this._data.colliderRadius;
  }
  
  ResourceSpot.prototype = new DE.GameObject();
  ResourceSpot.prototype.constructor = ResourceSpot;
  ResourceSpot.prototype.supr        = DE.GameObject.prototype;
  
  ResourceSpot.prototype.getDamage = function( player, energy, loot )
  {
    this.shake( 10, 10, 200 );
    this.energy = energy;
    
    // retrieve vector between the player and the spot to create the good offset for the resource
    var vector2 = new DE.Vector2().getVector( player, this );
    var spot = this;
    
    for ( var i = 0, obj, posr; i < loot; ++i )
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
        player.getLootFeedback( spot._data.drop );
        this.fadeOut( 200, true, this.askToKill );
      } );
      
      // add the object to the player this way even if the player move, the object will follow it
      player.add( obj );
    }
  };
  
  ResourceSpot.prototype.updateStatus = function( energy )
  {
    this.energy = energy;
    if ( this.energy <= 0 ) {
      this.alpha = 0.5;
    }
    else {
      this.fadeTo( 0.5 + this.energy / this.maxEnergy / 2, 200, true );
    }
  }
  
  return ResourceSpot;
} );