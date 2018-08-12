/**
* Author
 @Inateno / http://inateno.com / http://dreamirl.com

* ContributorsList
 @Inateno

***
simple Game declaration
**/
define( [
  'DREAM_ENGINE'
  , 'DE.NebulaOffline'
  , 'config'
  , 'Player'
  , 'ResourceSpot'
  , 'loadMap'
  , 'loadBuildBrush'
  , 'view.Main'
  , 'SheetRenderer'
],
function(
  DE
  , NebulaOffline
  , config
  , Player
  , ResourceSpot
  , loadMap
  , loadBuildBrush
  , ViewMain
  , SheetRenderer
)
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
  Game.currentTile = 1;
  
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
    // ui / cam stuff
    DE.on( "player-pos-update", function( x, y ) {
      Game.camera.x = config.SCREEN_W - x;
      Game.camera.y = config.SCREEN_H - y;
    } );
    
    
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
      
      // TODO send stuff to server
      DE.on( "player-update-input", function( type, v1, v2 )
      {
        if ( type == "action" ) {
          console.log( "do: ", player.currentMode );
          if ( player.currentMode == "fight" ) {
            console.log( "ayaaaaaaa" );
            player.attack();
          }
          else {
            Game.brush.placeTile();
          }
        }
        else if ( type == "switch" ) {
          // add a getter/setter to remove the weapon when passing to create mode
          player.currentMode = player.currentMode == "fight" ? "create" : "fight";
          if ( v1 ) {
            player.currentMode = v1;
          }
          
          uiView.playerModeChanged( player.currentMode );
          Game.brush.toggle( player.currentMode );
        }
        else if ( type == "shield" ) {
          
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
          Game.brush.updateAxes(  offline_axis.x,  offline_axis.y );
        }
      } );
    
    loadMap( Game, player );
    Game.brush = loadBuildBrush( Game, player );
    
      /***
       * generate objects which are not tiles
       * TODO add lazy load and collisions
       */
      for ( var i = 0, obj, wObj; i < config.WORLD_OBJECTS.length; ++i )
      {
        wObj = config.WORLD_OBJECTS[ i ];
        obj = new DE.GameObject( {
          x         : ( wObj.wx - wObj.wy ) * config.WORLD.TILE_W_HALF
          , y       : ( wObj.wx + wObj.wy ) * config.WORLD.TILE_H_HALF
          , zindex  : 2
          , renderer: new DE.SpriteRenderer( config.ENVS[ wObj.id ].rendererOpts )
        } );
        Game.scene.add( obj );
        config.instancied_world_objects.push( obj );
      }
      
      for ( var i = 0, obj, wObj; i < config.WORLD_RESOURCES.length; ++i )
      {
        wObj = config.WORLD_RESOURCES[ i ];
        obj = new ResourceSpot( wObj.id, wObj.wx, wObj.wy );
        Game.scene.add( obj );
        config.instancied_resources_points.push( obj );
      }
    
    // var UI = new DE.GameObject( {
    //   zindex: 200
    //   , renderer: new DE.SpriteRenderer( { spriteName: "actionMode" } )
    // } );
    
    // // nasty stuff to make it fit the screen
    // UI.focus( player, { offsets: { y: config.SCREEN_H * 0.5 - 25 >> 0 } } );
    
    var uiView = new ViewMain();
    uiView.show();
    uiView.playerModeChanged( player.currentMode );
    
    window.player = player;
    window.config = config;
    window.mapTiles = config.mapTiles;
    
    Game.scene.add( player, Game.cursor, Game.brush );
    
    DE.config.DEBUG = false;
    DE.config.DEBUG_LEVEL = 1;
  }
  
  window.Game = Game;
  window.DE = DE;

  return Game;
} );