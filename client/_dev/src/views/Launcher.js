define( [
  "DREAM_ENGINE", "jquery", "underscore", "backbone", "config"
  , "tools.getTemplate"
  , "tools.rest_api"
  , "tools.keepAlive"
]
, function(
  DE, $, _, Backbone, config
  , getTemplate
  , rest_api
  , keepAlive
)
{
  // and set filters
  return Backbone.View.extend( {
    tagName   : "div"
    ,id       : "Launcher"
    ,className: "fs-window"
    
    , initialize: function( gameScreen )
    {
      var self = this;
      // this.gameScreen = gameScreen;
      
      getTemplate( "Launcher", function( data )
      {
        self.ready = true;
        self.template = _.template( data );
        
        if ( self.waitForRender )
          self.render( self.lastRenderArgs );
        self.waitForRender = false;
      } );
      
      // Nebula is loading data (not logged yet)
      DE.on( "nebula-is-logging", function()
      {
        this.$el.find( ".loader, .connect-nebula-wip" ).show();
        this.$el.find( ".connect-nebula, .load-data-wip, .connect-guest" ).hide();
      }, this );
      
      DE.on( "nebula-game-connected-success", function( gameData )
      {
        console.log( "nebula logged success nebulaData", gameData );
        
        this.$el.find( ".loader, .load-data-wip" ).show();
        this.$el.find( ".connect-nebula, .connect-nebula-wip, .connect-guest" ).hide();
        
        this.gameData = gameData;
        if ( this.isVisible && this._firstDisconnectCalled ) {
          this.connect();
        }
      }, this );
      // Nebula is now disconnected
      DE.on( "nebula-logout-success", function()
      {
        console.log( "nebula logout" );
        this.$el.find( ".loader, .connect-nebula-wip, .load-data-wip" ).hide();
        this.$el.find( ".connect-guest" ).show();
        this.disconnect();
      }, this );
      
      DE.on( "nebula-login-fail", function( err, translatedError )
      {
        console.log( "Login fail because: " + err + " -- " + translatedError );
        alert( translatedError );
        // TODO feedback in UI
      }, this );
      
      $( "#render" ).append( this.$el );
    }
    
    , events: {
      "click .guest-login"     : "guestLogin"
      ,"click .button-login"   : "login"
      ,"click .settings-wheel" : "showSettings"
      ,"click .mute"           : function(){ DE.Audio.toggle();}
      ,"click .show-nebu-form" :function(){ this.$el.find( ".connect-guest" ).hide();this.$el.find( ".connect-nebula" ).show(); return false;}
      ,"click .show-guest-form":function(){ this.$el.find( ".connect-guest" ).show();this.$el.find( ".connect-nebula" ).hide(); return false;}
    }
    
    , guestLogin: function()
    {
      this.connect( {}, true );
      return false;
    }
    , login: function()
    {
      DE.trigger( "force-nebula-load", true );
      if ( config.gameData ) {
        this.gameData = config.gameData;
        if ( this.isVisible && this._firstDisconnectCalled ) {
          this.connect();
        }
      }
      
      var login = this.$el.find( ".launcher-nickname" ).val();
      var pw    = this.$el.find( ".launcher-pw" ).val();
      console.log( "nebula-login" )
      DE.trigger( "nebula-login", login, pw );
      return false;
    }
    
    , showSettings: function() { Backbone.trigger( "showSettings" ); }
    , connect: function( gameData, guestMode )
    {
      if ( !gameData ) {
        gameData = this.gameData || config.gameData;
      }
      if ( this._logging || !gameData || !this._firstDisconnectCalled ) {
        return;
      }
      this._logging = true;
      
      // if connect is called from the outside, this is required
      this.$el.find( ".loader, .load-data-wip" ).show();
      this.$el.find( ".connect-nebula, .connect-nebula-wip, .connect-guest" ).hide();
      
      rest_api.post( config.SERVER_URL + "login", {
        tk     : gameData.tk
        , lang : DE.Localization.currentLang
        , guest: guestMode
      }, function( err, data )
      {
        this._logging = false;
        
        if ( err ) {
          
          alert( "connection failed: " + err );
          console.error( "connection failed", err );
          delete config.gameData;
          delete this.gameData;
          
          // this.gameScreen.trigger( "changeScreen", "Launcher" );
          DE.trigger( "show-launcher" );
          Backbone.trigger( "game-disconnected", [] );
          DE.trigger( "nebula-logout" );
          return;
        }
        
        config.wallet = data.wallet;
        DE.Localization.getLang( data.myData.lang );
        keepAlive( true );
        
        DE.trigger( "game-logged-success", data.myData );
        DE.trigger( "close-nebula" );
        this._firstDisconnectCalled = false;
        delete this.gameData;
        delete config.gameData;
      }, this );
    }
    
    // TODO
    , disconnect: function( cb )
    {
      console.log( "require a disconnect" );
      keepAlive( false );
      this.$el.find( ".loader, .load-data-wip" ).show();
      this.$el.find( ".connect-nebula, .connect-nebula-wip, .connect-guest" ).hide();
      var self = this;
      rest_api.get( config.SERVER_URL + "logout", null, function( err, ok )
      {
        if ( err ) {
          alert( "Can't logout, server is dead?" );//DE.Localization.get( "errors" ).logout_error + err );
          console.error( "Can't logout because", err );
          self.render();
        }
        
        if ( cb ) { cb(); }
        
        // this.gameScreen.trigger( "changeScreen", "Launcher" );
        DE.trigger( "show-launcher" );
        Backbone.trigger( "game-disconnected", [] );
      }, this );
    }
    
    , render: function( args )
    {
      if ( !this.ready )
      {
        this.waitForRender = true;
        this.lastRenderArgs = args;
        return this;
      }
      
      this.$el.removeClass( function ( index, className ) {
        return ( className.match( /bg[0-9]{1,2}/gi ) || [] ).join(' ');
      } );
      this.$el.html( this.template( {
        dictionary: DE.Localization.dictionary[ DE.Localization.currentLang ]
      } ) );
      this.$el.addClass( "bg" + ( 1 + Math.random() * 3 >> 0 ) );
      
      if ( config.gameData ) {
        this.gameData = config.gameData;
        if ( this._firstDisconnectCalled ) {
          this.connect();
        }
      }
      
      // when the game is launched, be sure to logout from hexa servers to kill the session
      // the flag _firstDisconnectCalled is here to ensure logout is OK, then allow login
      if ( !this._firstDisconnectCalled ) {
        var self = this;
        this.disconnect( function()
        {
          self._firstDisconnectCalled = true;
          self.connect();
        } );
      }
      
      return this;
    }
    
    , hide: function()
    {
      this.isVisible = false;
      this.$el.fadeOut( 500 );
      DE.Inputs.keyLocked = false;
      return this;
    }
    , show: function()
    {
      DE.Audio.music.stopAllAndPlay( "launcher" );
      DE.Inputs.keyLocked = true;
      this.isVisible = true;
      this.render()
        .$el.fadeIn( 500 );
      return this;
    }
  } );
} );