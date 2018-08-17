define( [ 'DREAM_ENGINE', 'config', 'Inventory' ],
function( DE, config, Inventory )
{
  function Player( data )
  {
    DE.GameObject.call( this, {
      x         : ( data.worldX - data.worldY ) * config.WORLD.TILE_W_HALF
      , y       : ( data.worldX + data.worldY ) * config.WORLD.TILE_H_HALF
      , zindex  : 2
      , renderers: [
        new DE.SpriteRenderer( { spriteName: data.skin || "player", y: -20, x: 0, scale: 0.8 } )
        // , new DE.SpriteRenderer( { spriteName: "cursor" } ) // useful for debug the center of the player
      ]
    } );
    
    this.index = data.id;
    this.life  = data.life || 1;
    this.level = data.level || 1;
    this.speed = 5;
    this.atk = 1;
    this.currentMode = "fight"; // "create"
    this.skin = data.skin || "player";
    
    // this one is used to move the player
    this.axes = {
      x: 0,
      y: 0
    };
    // this one is just to keep the input state, not really useful
    this.inputAxes = {
      x     : 0,
      y     : 0,
      attack: 0,
      shield: 0
    }
    
    this.worldPosition = {
      x: data.worldX,
      y: data.worldY
    };
    
    this.addAutomatism( "gameLogic", "gameLogic" );
    
    this.attackFx = new DE.GameObject();
    this.attackFx.enable = false;
    
    this.add( this.attackFx );
    
    if ( config.myIndex === data.id ) {
      this.bindInputs();
    }
  }
  
  Player.prototype = new DE.GameObject();
  Player.prototype.constructor = Player;
  Player.prototype.supr        = DE.GameObject.prototype;
  
  // if it's my instance, bind the input to be able to control it
  Player.prototype.bindInputs = function()
  {
    var self = this;
    DE.Inputs.on( "keyDown", "left", function() { DE.emit( "player-update-input", self, "axis", 1, -1 ); } );
    DE.Inputs.on( "keyDown", "right", function() { DE.emit( "player-update-input", self, "axis", 1, 1 ); } );
    DE.Inputs.on( "keyUp", "right", function() { DE.emit( "player-update-input", self, "axis", 1, 0 ); } );
    DE.Inputs.on( "keyUp", "left", function() { DE.emit( "player-update-input", self, "axis", 1, 0 ); } );
    
    DE.Inputs.on( "keyDown", "up", function() { DE.emit( "player-update-input", self, "axis", 2, -1 ); } );
    DE.Inputs.on( "keyDown", "down", function() { DE.emit( "player-update-input", self, "axis", 2, 1 ); } );
    DE.Inputs.on( "keyUp", "down", function() { DE.emit( "player-update-input", self, "axis", 2, 0 ); } );
    DE.Inputs.on( "keyUp", "up", function() { DE.emit( "player-update-input", self, "axis", 2, 0 ); } );
    
    DE.Inputs.on( "keyDown", "action", function() { DE.emit( "player-update-input", self, "action", 1 ); } );
    // DE.Inputs.on( "keyUp", "action", function() { DE.emit( "player-update-input", "action", 0 ); } );
    
    DE.Inputs.on( "keyDown", "switch-mode", function() { DE.emit( "player-update-input", self, "switch" ); } );
    // DE.Inputs.on( "keyUp", "switch-mode", function() { DE.emit( "player-update-input", "switch", 1 ); } );
    
    this.attackFx.checkHits = function()
    {
      for ( var i in config.instancied_resources_points )
      {
        obj = config.instancied_resources_points[ i ];
        if ( obj.vector2.getDistance( this.getWorldPos() ) < obj.colliderRadius ) {
          DE.emit( "send-hit-on-resource", obj.id );
          return; // can only attack one stuff at a time ?
        }
      }
      
      for ( var i in config.instancied_world_interactive )
      {
        obj = config.instancied_world_interactive[ i ];
        if ( obj.vector2.getDistance( this.getWorldPos() ) < config.ENV_OBJECTS[ obj.oId ].colliderRadius ) {
          DE.emit( config.ENV_OBJECTS[ obj.oId ].triggeredMessage );
          return;
        }
      }
    };
    this.attackFx.addAutomatism( "checkHits", "checkHits", { interval: 100 } );
  };
  
  Player.prototype.updateAxes = function( v1, v2 )
  {
    var x = v1 === 1 ? v2 : this.axes.x;
    var y = v1 === 2 ? v2 : this.axes.y;
    
    this.axes = {
      x: y != 0 && x != 0 ? 0.75 * x : x,
      y: y != 0 && x != 0 ? 0.39 * y : y,
      nasty: false
    };
    
    if ( this.axes.x == 0 && this.axes.y == 0 ) {
      this.renderer.setPause( true );
    }
    else {
      this.renderer.setPause( false );
    }
    
    var direction = this.renderer.currentLine;
    if ( this.axes.y == 1 ) {
      direction = 0;
    }
    else if ( this.axes.y > 0 && this.axes.x > 0 ) {
      direction = 1;
    }
    else if ( this.axes.x == 1 ) {
      direction = 2;
    }
    else if ( this.axes.x > 0 && this.axes.y < 0 ) {
      direction = 3;
    }
    else if ( this.axes.y == -1 ) {
      direction = 4;
    }
    else if ( this.axes.x < 0 && this.axes.y < 0 ) {
      direction = 5;
    }
    else if ( this.axes.x == -1 ) {
      direction = 6;
    }
    else if ( this.axes.x < 0 && this.axes.y > 0 ) {
      direction = 7;
    }
    
    this.renderer.currentLine = direction;
    
    this.emit( "update-axes", this.axes, direction );
  };
  
  // make the player move / collide
  // TODO improve with a collider and not just a point (because the character is able to walk inside the collider otherwise)
  Player.prototype.gameLogic = function()
  {
    this.checkCollisions( this.axes, 0 );
  };
  
  Player.prototype.checkCollisions = function( axes, iteration )
  {
    if ( this._stuck && this.axes.nasty ) {
      return;
    }
    
    this.axes.nasty = true;
    
    var nextPos = {
      x: this.x + axes.x * this.speed,
      y: this.y + axes.y * this.speed
    };
    
    // var worldX = ( nextPos.y / config.WORLD.TILE_H_HALF - ( nextPos.x / config.WORLD.TILE_W_HALF ) ) / 2 + 1 >> 0;
    // var worldY = ( nextPos.x / config.WORLD.TILE_W_HALF + nextPos.y / config.WORLD.TILE_H_HALF) / 2 + 1 >> 0;
    
    
    var worldX = ( nextPos.x / config.WORLD.TILE_W_HALF + nextPos.y / config.WORLD.TILE_H_HALF) / 2 + 1 >> 0;
    var worldY = ( nextPos.y / config.WORLD.TILE_H_HALF - ( nextPos.x / config.WORLD.TILE_W_HALF ) ) / 2 + 1 >> 0;
    
    /* DEAD, todo fix
    if ( worldY <= 0 || worldX <= 0
      || worldY >= config.WORLD_DATA.length
      || worldX >= config.WORLD_DATA[ worldY ].length
      || config.BLOCKS.indexOf( config.WORLD_DATA[ worldY ][ worldX ] ) !== -1 ) {
      
      // can't do better, just rollback the position a little bit
      if ( iteration >= 4 ) {
        // this.translate( { x: -axes.x * this.speed * 0.5, y: -axes.y * this.speed * 0.5 } );
        return;
      }
      
      // try to keep movement fluid
      if ( axes.x > 0 ) {
        if ( worldY < this.worldPosition.y ) {
          return this.checkCollisions( { x: 0, y: 1 }, iteration + 1 );
        }
        else if ( worldX > this.worldPosition.x ) {
          return this.checkCollisions( { x: 0, y: -1 }, iteration + 1 );
        }
      }
      else if ( axes.x < 0 ) {
        if ( worldY > this.worldPosition.y ) {
          return this.checkCollisions( { x: -0, y: -1 }, iteration + 1 );
        }
        else if ( worldX < this.worldPosition.x ) {
          return this.checkCollisions( { x: -0, y: 1 }, iteration + 1 );
        }
        return;
      }
      
      if ( axes.y > 0 ) {
        if ( worldX > this.worldPosition.x ) {
          return this.checkCollisions( { x: -1, y: 0 }, iteration + 1 );
        }
        else if ( worldY > this.worldPosition.y ) {
          return this.checkCollisions( { x: 1, y: 0 }, iteration + 1 );
        }
      }
      else if ( axes.y < 0 ) {
        if ( worldX < this.worldPosition.x && worldY == this.worldPosition.y ) {
          return this.checkCollisions( { x: 1, y: 0 }, iteration + 1 );
        }
        else if ( worldY < this.worldPosition.y && worldX == this.worldPosition.x ) {
          return this.checkCollisions( { x: -1, y: 0 }, iteration + 1 );
        }
      }
      // if ( iteration === 2 ) {
      //   return false;
      // }
      // else if ( iteration === 1 ) {
      //   return this.checkCollisions( { x: 0, y: axes.y }, 2 );
      // }
      // else {
      //   return this.checkCollisions( { x: axes.x, y: 0 }, 1 );
      // }
      this._stuck = true;
      this.translate( { x: -axes.x * ( this.speed + iteration ), y: -axes.y * ( this.speed + iteration ) } );
      return
    }
    /**/
    this._stuck = false;
    this.translate( { x: axes.x * ( this.speed + iteration ), y: axes.y * ( this.speed + iteration ) } );
    
    if ( this.index == config.myIndex ) {
      DE.emit( "player-pos-update", this.x, this.y );
    }
    
    if ( this.worldPosition.x != worldX
      || this.worldPosition.y != worldY ) {
      this.emit( "worldPositionChanged", worldX, worldY, axes, this.renderer.currentLine );
    }
    
    this.worldPosition.x = worldX;
    this.worldPosition.y = worldY;
    
    return true;
  }
  
  // launch attack animation
  Player.prototype.attack = function()
  {
    this.attackFx.enable = true;
    this.attackFx.moveTo( {
      x: this.axes.x * 50
      ,y: this.axes.y * 50
    }, 200, function()
    {
      this.enable = false;
      this.x = 0;
      this.y = 0;
    } );
  };
  
  // launch shield animation
  Player.prototype.shield = function()
  {
    
  };
  
  Player.prototype.getLootFeedback = function( resourceId )
  {
    if ( this.index != config.myIndex ) { return; }
    
    // TODO play juicy sound
    
  };
  
  return Player;
} );