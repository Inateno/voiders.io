define( [
  "DREAM_ENGINE", "jquery", "underscore", "backbone", "config", "tools.getTemplate"
  , "view.TileSelector"
  , "view.Inventory"
  , "view.Craft"
  // , "view.Settings"
]
, function(
  DE, $, _, Backbone, config, getTemplate
  , ViewTileSelector
  , ViewInventory
  , ViewCraft
  // , ViewSettings
)
{
  return Backbone.View.extend( {
    tagName   : "div"
    ,id       : "MainUI"
    ,className: ""
    
    , initialize: function()
    {
      var self = this;
      
      $( "#render" ).append( this.$el );
      this.$el.hide();
      DE.on( "open-craft", this.showCraft, this );
      this.views = {
        tileSelector: new ViewTileSelector(),
        inventory: new ViewInventory(),
        craft: new ViewCraft()
      };
      
      getTemplate( "Main", function( data )
      {
        self.ready = true;
        self.template = _.template( data );
        
        if ( self.waitForRender )
          self.render( self.lastRenderArgs );
        self.waitForRender = false;
      } );
      
      DE.Inputs.on( "keyDown", "inventory", function() { self.showInventory(); } );
      DE.Inputs.on( "keyDown", "tiles-book", function() { self.showTileSelector(); } );
    }
    
    , events: {
      "click .settings"         : "showSettings"
      ,"click .mode-swapper div": "changePlayerMode"
      ,"click .action-attack"   : "playerAttack"
      ,"click .action-defend"   : "playerDefend"
      ,"click .action-create"   : "playerCreate"
      ,"click .action-book"     : "showTileSelector"
      ,"click .action-inventory": "showInventory"
    }
    
    , render: function()
    {
      if ( !this.ready ) {
        this.waitForRender = true;
        this.lastRenderArgs = null;
        return this;
      }
      
      this.$el.html( this.template( {
        dictionary: DE.Localization.dictionary[ DE.Localization.currentLang ]
      } ) );
      
      this.playerModeChanged( this.savedMode );
      
      return this;
    }
    
    , showTileSelector: function() { this.views.tileSelector.toggle(); }
    , showInventory: function() { this.views.inventory.toggle(); }
    , showCraft: function() { this.views.craft.show(); }
    
    , playerAttack: function(){ DE.emit( "player-update-input", "action" ); }
    , playerCreate: function(){ DE.emit( "player-update-input", "action" ); }
    , playerDefend: function(){ DE.emit( "player-update-input", "shield" ); }
    
    , changePlayerMode: function( ev )
    {
      DE.emit( "player-update-input", null, "switch", $( ev.currentTarget ).attr( "data-target" ) );
    }
    , playerModeChanged: function( newMode )
    {
      this.savedMode = newMode;
      this.$el.find( ".mode-fight" ).toggleClass( "active", newMode == "fight" );
      this.$el.find( ".mode-create" ).toggleClass( "active", newMode == "create" );
      
      this.$el.find( ".bottom-right-controls div" ).hide();
      this.$el.find( ".bottom-right-controls ." + newMode ).show();
    }
    
    , hide: function()
    {
      this.$el.hide( 0 );
      return this;
    }
    , show: function()
    {
      this.render();
      this.$el.show( 0 );
      return this;
    }
  } );
} );