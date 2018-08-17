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
  , 'view.Launcher'
  , 'tools.loadIO'
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
  , ViewLauncher
  , loadIO
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
    console.log( DE.about )
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
    
    NebulaOffline.init( undefined, undefined, true );
    // DE.trigger( "force-nebula-load", false );
    
    DE.start();
    
    Game.launcher = new ViewLauncher();
    Game.launcher.show();
    
    DE.on( "show-launcher", function() { Game.launcher.show(); } );
    
    DE.on( "nebula-logged-success", function( nebulaData )
    {
      DE.Localization.getLang( nebulaData.lang || DE.Localization.currentLang );
    } );

    DE.on( "nebula-game-connected-success", function( gameData )
    {
      // apply loaded settings
    } );

    Backbone.on( "game-disconnected", function()
    {
      Game.launcher.show();
    } );

    DE.on( "game-logged-success", function()
    {
      Game.launcher.hide();
      loadIO( Game.initConnection, Game );
    } );
      
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
    
    // ui / cam stuff
    DE.on( "player-pos-update", function( x, y ) {
      Game.camera.x = config.SCREEN_W - x;
      Game.camera.y = config.SCREEN_H - y;
    } );
    
    DE.Audio.setVolume( 0.25 );
    DE.Audio.music.stopAllAndPlay( "happiness" );
  }
  
  Game.players = {};
  Game.initConnection = function()
  {
    this._socket = window.io.connect( config.SERVER_URL, { forceNew : true } );
    this.__connected = true;
    
    var soc = this._socket;
    
    soc.on( "ii", function( myIndex, data, players )
    {
      // config.WORLD_DATA = chunk;
      for ( var i in data )
      {
        config[ i ] = data[ i ];
      }
      
      /***************
       * generate players
       */
     console.log( "myIndex is", myIndex );
     console.log( "players", players );
      config.myIndex = myIndex;
      for ( var i in players )
      {
        if ( Game.players[ i ] ) {
          Game.players[ i ].askToKill();
          delete Game.players[ i ];
        }
        Game.players[ i ] = new Player( players[ i ] );
        Game.scene.add( Game.players[ i ] );
      }
      Game.player = Game.players[ myIndex ];
      
      soc.emit( "ck", Game.player.worldPosition.x, Game.player.worldPosition.y );
      Game.onDataReady();
    } );
    
    // update inputs
    soc.on( "ui", function( id, type, v1, v2, x, y )
    {
      var player = Game.players[ id ];
      if ( id != config.myIndex ) {
        player.x = x;
        player.y = y;
      }
      
      switch( type )
      {
        // axes
        case "a":
          player.updateAxes( v1, v2 );
          if ( id === config.myIndex ) {
            Game.brush.updateAxes(  player.axes.x, player.axes.y );
          }
          break;
        
        // action
        case "ac":
          player.currentMode = v1;
          if ( player.currentMode == "fight" ) {
            console.log( "ayaaaaaaa" );
            player.attack();
          }
          else {
            Game.brush.placeTile();
          }
          break;
          
        case "sw":
          player.currentMode = v1;
          break;
      }
    } );
    DE.on( "player-update-input", function( player, type, v1, v2 )
    {
      if ( !player ) {
        player = Game.player;
      }
      if ( type == "action" ) {
        soc.emit( "ui", "ac", player.currentMode, null, player.x, player.y )
      }
      else if ( type == "switch" ) {
        player.currentMode = player.currentMode == "fight" ? "create" : "fight";
        soc.emit( "ui", "sw", player.currentMode, null, player.x, player.y )
        
        // this is just for me
        uiView.playerModeChanged( player.currentMode );
        Game.brush.toggle( player.currentMode );
      }
      else if ( type == "shield" ) {
        // nothing yet
      }
      else {
        soc.emit( "ui", "a", v1, v2, player.x >> 0, player.y >> 0 );
      }
    } );
    
    // player join
    soc.on( "pj", function( playerData )
    {
      if ( Game.players[ playerData.id ] ) {
        Game.players[ playerData.id ].askToKill();
        delete Game.players[ playerData.id ];
      }
      Game.players[ playerData.id ] = new Player( playerData );
      Game.scene.add( Game.players[ playerData.id ] );
    } );
    // player leave
    soc.on( "pl", function( pid )
    {
      Game.players[ pid ].askToKill();
      delete Game.players[ pid ];
    } );
    
    soc.on( "u-tiles", function( tiles )
    {
      Inventory.tiles = tiles;
      DE.emit( "inventory-tiles-update", Inventory.tiles );
    } );
    soc.on( "u-resources", function( resources )
    {
      Inventory.resources = resources;
      DE.emit( "inventory-resources-update", Inventory.resources );
    } );
    
    // resource spot update
    soc.on( "res-up", function( spots )
    {
      for ( var i = 0; i < spots.length; ++i )
      {
        config.instancied_resources_points[ spots[ i ].id ].updateStatus( spots[ i ].en );
      }
    } );
    
    soc.on( "pt", function( tileId, wx, wy )
    {
      config.WORLD_DATA[ wy ][ wx ] = tileId;
      DE.emit( "world-tiles-update", [ { x: wx, y: wy, id: tileId } ] );
    } );
    soc.on( "pt-err", function( err ){ alert( err ); } )
    DE.on( "send-place-tile", function( tileId, wx, wy )
    {
      soc.emit( "pt", tileId, wx, wy );
    } );
    
    // hit resource
    DE.on( "send-hit-on-resource", function( id ) { soc.emit( "hr", id ); } );
    soc.on( "hr", function( pid, id, energy, loot )
    {
      config.instancied_resources_points[ id ].getDamage( Game.players[ pid ], energy, loot );
    } );
    
    DE.on( "send-launch-craft", function( tileId, materials )
    {
      soc.emit( "ct", tileId, materials );
    } );
    soc.on( "ct-ok", function( tileCreated )
    {
      DE.emit( "craft-success", tileCreated );
    } );
    
    var _lastPosAsked = { x: 0, y: 0 };
    DE.on( "ask-chunk", function( wx, wy )
    {
      _lastPosAsked.x = wx;
      _lastPosAsked.y = wy;
      soc.emit( "ck", wx, wy );
    } );
    soc.on( "ck", function( flatchunk )
    {
      console.log( "flat chunk received", flatchunk.length );
      for ( var i = 0, tile; i < flatchunk.length; ++i )
      {
        tile = flatchunk[ i ];
        config.WORLD_DATA[ tile[ 1 ] ][ tile[ 0 ] ] = tile[ 2 ];
      }
      
      if ( !Game.map ) {
        // generate map
        console.log( "load map" )
        loadMap( Game, Game.player );
      }
    } );
    
    soc.on( "new-r", function( args )
    {
      if ( args[ 0 ] == "r" ) {
        var obj = { x: args[ 3 ], y: args[ 4 ], id: args[ 1 ], resId: args[ 2 ] };
        var go = new ResourceSpot( obj );
        Game.scene.add( go );
        config.instancied_resources_points[ obj.id ] = go;
      }
      else {
        var obj = { x: args[ 3 ], y: args[ 4 ], id: args[ 1 ], oId: args[ 2 ] };
        config.WORLD_OBJECTS.push( obj );
        addWorldObject( obj );
      }
    } );
  }
  
  Game.onDataReady = function()
  {
    Game.brush = loadBuildBrush( Game, Game.player );
    
      /***
       * generate objects which are not tiles
       * TODO add lazy load and collisions
       */
      for ( var i = 0, obj, wObj, objData; i < config.WORLD_OBJECTS.length; ++i )
      {
        wObj = config.WORLD_OBJECTS[ i ];
        if ( !wObj.oId ) {
          continue;
        }
        addWorldObject( wObj );
      }
      
      var wObj, obj;
      for ( var i in config.WORLD_RESOURCES_SPOTS )
      {
        wObj = config.WORLD_RESOURCES_SPOTS[ i ];
        obj = new ResourceSpot( wObj );
        Game.scene.add( obj );
        config.instancied_resources_points[ i ] = obj;
      }
    
    var uiView = new ViewMain();
    uiView.show();
    uiView.playerModeChanged( Game.player.currentMode );
    
    window.uiView = uiView;
    
    Game.scene.add( Game.cursor, Game.brush );
    
    DE.config.DEBUG = false;
    DE.config.DEBUG_LEVEL = 1;
  }
  
  function addWorldObject( wObj )
  {
    var obj = new DE.GameObject( {
      x         : ( wObj.x - wObj.y ) * config.WORLD.TILE_W_HALF
      , y       : ( wObj.x + wObj.y ) * config.WORLD.TILE_H_HALF
      , zindex  : 2 
      , id      : wObj.id
      , oId     : wObj.oId
    } );
    obj.updatable = false;
    
    var objData = config.ENV_OBJECTS[ wObj.oId ];
    if ( objData.rendererOpts.sheetId ) {
      obj.addRenderer( new DE.SheetRenderer( objData.rendererOpts.sheetId, JSON.parse( JSON.stringify( objData.rendererOpts ) ) ) );
    }
    else {
      obj.addRenderer( new DE.SpriteRenderer( JSON.parse( JSON.stringify( objData.rendererOpts ) ) ) );
    }
    Game.scene.add( obj );
    config.instancied_world_objects[ obj.id ] = obj;
    
    if ( objData.canInteract ) {
      config.instancied_world_interactive[ obj.id ] = obj;
    }
    // TODO push object in an array of simple collider (simple mean 1 tile)
    if ( objData.simpleCollision ) {
      
    }
  };
  
  window.player = Game.player;
  window.config = config;
  window.mapTiles = config.mapTiles;

  window.Game = Game;
  window.DE = DE;

  return Game;
} );