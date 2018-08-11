/**
* Author
 @Inateno / http://inateno.com / http://dreamirl.com

* ContributorsList
 @Inateno

***
simple Game declaration
**/
define( [ 'DREAM_ENGINE', 'DE.NebulaOffline', 'config', 'Player', 'SheetRenderer' ],
function( DE, NebulaOffline, config, Player, SheetRenderer )
{
  
  DE.SheetRenderer = SheetRenderer;
  var Game = {};
    
  Game.render = null;
  Game.scene  = null;
  
  // init
  Game.init = function()
  {
    console.log( "game init" );
    // DE.config.DEBUG = 1;
    // DE.config.DEBUG_LEVEL = 2;
    
    // Create the renderer before assets start loading
    Game.render = new DE.Render( "render", {
      resizeMode       : "stretch-ratio"
      , width          : config.SCREEN_W
      , height         : config.SCREEN_H
      , backgroundColor: "0x00004F"
      , roundPixels    : false
      , powerPreferences: "high-performance"
    } );
    Game.render.init();
    
    // NebulaOffline.init();
    
    DE.start();
  }
  
  // tiles are scaled by 0.25 this is why I explain the calculation
  var myPos = {
    x: 1000 + 2,
    y: 1000 + 3
  };
  
  Game.onload = function()
  {

    console.log( "game start" );

    // scene
    Game.scene = new DE.Scene();
    Game.camera = new DE.Camera( 0, 0, config.SCREEN_W, config.SCREEN_H, { scene: Game.scene/*, backgroundImage: "bg"*/ } );
    Game.camera.interactive = true;
    Game.render.add( Game.camera );
    Game.camera.x = config.SCREEN_W / 2 + 400 >> 0;
    Game.camera.y = config.SCREEN_H / 2 + 200 >> 0;
    Game.camera.pointermove = function( pos, e )
    {
      Game.cursor.moveTo( pos, 50 );
    };
    Game.camera.pointerdown = function( pos, e )
    {
      Game.cursor.shake( 10, 10, 200 );
      Game.cursor.renderer.setBrightness( [ 0, 1 ] );
    };
    Game.camera.pointerup = function( pos, e )
    {
      
      console.log( "up" ); Game.cursor.shake( 10, 10, 200 );
    };
    
    Game.cursor = new DE.GameObject( {
      zindex: 500
      , renderer: new DE.SpriteRenderer( { spriteName: "cursor", scale: 0.3 } )
    } );
    
    /***************
     * player stuff
     */
      config.myIndex = 1;
      var player = new Player( 1, { pos: { x: myPos.x, y: myPos.y } } );
      
      // waiting for server I do this
      var offline_axis = {
        x: 0,
        y: 0
      };
      player.on( "update-input", function( type, v1, v2 )
      {
        if ( type === "action" ) {
          console.log( "do: ", player.currentMode );
          if ( player.currentMode == "fight" ) {
            
          }
          else {
            brush.placeTile();
          }
        }
        else if ( type === "switch" ) {
          player.currentMode = player.currentMode == "fight" ? "create" : "fight";
          // TODO remove player weapons of create
          UI.renderer.currentLine = player.currentMode == "fight" ? 0 : 1;
          brush.toggle( UI.renderer.currentLine );
        }
        else if ( type === "shield" ) {
          
        }
        else {
          // io.send( "update-axis", [ axis, value ] )
          
          // waiting for server we call in local
          // x
          if ( v1 === 1 ) {
            offline_axis.x = v2;
          }
          // y
          else {
            offline_axis.y = v2;
          }
          player.updateAxes( offline_axis.x, offline_axis.y );
          brush.updateAxes(  offline_axis.x,  offline_axis.y );
        }
      } );
    
    // map
      var mapTiles = [];
      var lazyLimit = 24;
      for ( var y = myPos.y - lazyLimit; y < myPos.y + lazyLimit; ++y )
      {
        mapTiles.push( [] );
        for ( var x = myPos.x - lazyLimit, tileId, obj; x < myPos.x + lazyLimit; ++x )
        {
          tileId = "tile-" + config.WORLD_DATA[ y ][ x ];
          if ( config.WORLD_DATA[ y ][ x ] == 0 ) {
            tileId = "void";
          }
          obj = new DE.GameObject( {
            x         : ( x - y ) * config.WORLD.TILE_W_HALF
            , y       : ( x + y ) * config.WORLD.TILE_H_HALF
            , renderer: new DE.SheetRenderer( tileId, { scale: 0.25 } )
            , worldPos: {
              x: x,
              y: y
            }
            , tileId: tileId
          } );
          obj.updateTile = function( newTile )
          {
            this.tileId = newTile;
            this.x = ( this.worldPos.x - this.worldPos.y ) * config.WORLD.TILE_W_HALF;
            this.y = ( this.worldPos.x + this.worldPos.y ) * config.WORLD.TILE_H_HALF;
            if ( newTile == 0 ) {
              this.renderer.texture = DE.PIXI.utils.TextureCache[ "void" ];
            }
            else {
              this.renderer.texture = DE.PIXI.utils.TextureCache[ "tile-" + config.WORLD_DATA[ this.worldPos.y ][ this.worldPos.x ] ];
            }
            this.toggleVoid();
          }
          obj.fadeVoid = function()
          {
            if ( this.alpha < 0.8 ) {
              this.fade( this.alpha, 1, 1500 + Math.random() * 1000, true, this.fadeVoid );
            }
            else {
              this.fade( this.alpha, 0.5, 1500 + Math.random() * 1000, true, this.fadeVoid );
            }
          }
          obj.toggleVoid = function()
          {
            if ( this.tileId == 0 ) {
              this.zindex = 2;
              this.y -= 24;
              this.fadeVoid();
            }
            else {
              this.zindex = 0;
              this._fadeData.done = true;
              this.alpha = 1;
            }
          }
          
          obj.toggleVoid();
          Game.scene.add( obj );
          mapTiles[ y - ( myPos.y - lazyLimit ) ].push( obj );
        }
      }
      player.on( "worldPositionChanged", function( wx, wy, axes )
      {
        var cut = [];
        var deltaY = 0;
        var deltaX = 0;
        
        var firstTilePos = mapTiles[ 0 ][ 0 ].worldPos;
        var lastTilePos = mapTiles[ mapTiles.length - 1 ][ mapTiles[ mapTiles.length - 1 ].length - 1 ].worldPos;
        
        if ( wy - firstTilePos.y > lazyLimit ) {
          cut = mapTiles.splice( 0, 1 )[ 0 ];
          mapTiles.push( cut );
          deltaY = lazyLimit * 2;
        }
        else if ( lastTilePos.y - wy > lazyLimit ) {
          cut = mapTiles.splice( mapTiles.length - 1, 1 )[ 0 ];
          mapTiles.unshift( cut );
          deltaY = -lazyLimit * 2;
        }
        
        for ( var i = 0; i < cut.length; ++i )
        {
          cut[ i ].worldPos.y += deltaY;
          cut[ i ].updateTile( config.WORLD_DATA[ cut[ i ].worldPos.y ][ cut[ i ].worldPos.x ] );
        }
        
        cut = [];
        firstTilePos = mapTiles[ 0 ][ 0 ].worldPos;
        lastTilePos = mapTiles[ mapTiles.length - 1 ][ mapTiles[ mapTiles.length - 1 ].length - 1 ].worldPos;
        if ( wx - firstTilePos.x > lazyLimit ) {
          for ( var y = 0; y < mapTiles.length; ++y )
          {
            cut.push( mapTiles[ y ].splice( 0, 1 )[ 0 ] );
            mapTiles[ y ].push( cut[ cut.length - 1 ] );
          }
          deltaX = lazyLimit * 2;
        }
        else if ( lastTilePos.x - wx > lazyLimit ) {
          for ( var y = 0; y < mapTiles.length; ++y )
          {
            cut.push( mapTiles[ y ].splice( mapTiles[ y ].length - 1, 1 )[ 0 ] );
            mapTiles[ y ].unshift( cut[ cut.length - 1 ] );
          }
          deltaX = -lazyLimit * 2;
        }
        
        for ( var i = 0; i < cut.length; ++i )
        {
          cut[ i ].worldPos.x += deltaX;
          cut[ i ].updateTile( config.WORLD_DATA[ cut[ i ].worldPos.y ][ cut[ i ].worldPos.x ] );
        }
        
        Game.scene.sortGameObjects();
      } );
      DE.on( "new-tiles", function( tiles )
      {
        for ( var i = 0, obj, tile; i < tiles.length; ++i )
        {
          tile = tiles[ i ];
          obj = new DE.GameObject( {
            x         : ( tile.x - tile.y ) * config.WORLD.TILE_W_HALF
            , y       : ( tile.x + tile.y ) * config.WORLD.TILE_H_HALF
            , renderer: new DE.SheetRenderer( "tile-" + tile.id, { scale: 0.25 } )
          } );
          Game.scene.add( obj );
          
          if ( mapTiles[ tile.y ][ tile.x ] ) {
            mapTiles[ tile.y ][ tile.x ].fadeOut( 500, true, mapTiles[ tile.y ][ tile.x ].askToKill )
          }
          
          mapTiles[ tile.y ][ tile.x ] = obj;
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
      } );
      
      /***
       * generate objects which are not tiles
       * TODO add lazy load and collisions
       */
      for ( var i = 0, obj; i < config.WORLD_OBJECTS.length; ++i )
      {
        obj = config.WORLD_OBJECTS[ i ];
        Game.scene.add( new DE.GameObject( {
          x         : ( obj.wx - obj.wy ) * config.WORLD.TILE_W_HALF
          , y       : ( obj.wx + obj.wy ) * config.WORLD.TILE_H_HALF
          , zindex  : 2
          , renderer: new DE.SpriteRenderer( config.ENVS[ obj.id ].rendererOpts )
        } ) );
      }
    
    
    /******************
     * brush
     */
      var brush = new DE.GameObject( {
        zindex: 100
        ,renderer: new DE.SheetRenderer( "tile-5", { scale: 0.25 } )
      } );
      brush.currentTile = 5;
      brush.enable = false;
      brush.axes = { x: 0, y: 1 };
      brush.worldPos = { x: 0, y: 0 };
      brush.toggle = function( bool ) {
        this.enable = !!bool;
        this.updateAxes( this.axes.x, this.axes.y );
      }
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
          console.log( "no way, already something here fucker" );
          return;
        }
        else {
          if ( wy >= config.WORLD_DATA.length || wx >= config.WORLD_DATA[ wy ].length ) {
            // y doesn't exist, add a row
            if ( wy >= config.WORLD_DATA.length ) {
              var row = [];
              for ( var x = 0; x < config.WORLD_DATA[ 0 ].length; ++x )
              {
                row.push( 0 );
              }
              config.WORLD_DATA.push( row );
            }
            // y exist but not the X, have to parse all Y and add an entry
            else {
              for ( var y = 0; y < config.WORLD_DATA.length; ++y )
              {
                config.WORLD_DATA[ y ].push( 0 );
              }
            }
            // config.WORLD_DATA[ wy ][ wx ];
          }
          
          config.WORLD_DATA[ wy ][ wx ] = this.currentTile;
          DE.emit( "new-tiles", [ { x: wx, y: wy, id: this.currentTile } ] );
        }
      };
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
        if ( wy >= 0 && wx >= 0
          && wy < config.WORLD_DATA.length
          && wx < config.WORLD_DATA[ wy ].length
          && config.WORLD_DATA[ wy ][ wx ] != 0 ) {
          brush.renderer.setTint( "0xff3333" );
        }
        else {
          brush.renderer.setTint( "0xffffff" );
        }
      } );
    
    // ui / cam stuff
    DE.on( "player-pos-update", function( x, y ) {
      Game.camera.x = config.SCREEN_W - x;
      Game.camera.y = config.SCREEN_H - y;
    } );
    
    var UI = new DE.GameObject( {
      zindex: 200
      , renderer: new DE.SpriteRenderer( { spriteName: "actionMode" } )
    } );
    
    UI.focus( player, { offsets: { y: config.SCREEN_H * 0.5 - 25 >> 0 } } );
    
    window.player = player;
    window.config = config;
    window.mapTiles = mapTiles;
    
    Game.scene.add( player, Game.cursor, UI, brush );
    
    DE.config.DEBUG = false;
    DE.config.DEBUG_LEVEL = 1;
  }
  
  window.Game = Game;
  window.DE = DE;

  return Game;
} );