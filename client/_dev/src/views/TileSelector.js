define( [
  "DREAM_ENGINE", "jquery", "underscore", "backbone", "config"
  , "tools.getTemplate"
]
, function(
  DE, $, _, Backbone, config
  , getTemplate
)
{
  return Backbone.View.extend( {
    tagName   : "div"
    ,id       : "TileSelector"
    ,className: "fs-window"
    
    , initialize: function()
    {
      var self = this;
      
      $( "#render" ).append( this.$el );
      this.$el.hide();
      
      getTemplate( "TileSelector", function( data )
      {
        self.ready = true;
        self.template = _.template( data );
        
        if ( self.waitForRender )
          self.render( self.lastRenderArgs );
        self.waitForRender = false;
      } );
    }
    
    , events: {
      "click .okBtn": "hide"
      ,"click .tile": "changeActiveTile"
    }
    
    , render: function()
    {
      if ( !this.ready ) {
        this.waitForRender = true;
        this.lastRenderArgs = null;
        return this;
      }
      
      this.$el.html( this.template( {
        dictionary   : DE.Localization.dictionary[ DE.Localization.currentLang ]
        , tiles      : config.TILES
        , currentTile: this.currentTile
      } ) );
      
      return this;
    }
    
    , changeActiveTile: function( ev )
    {
      var tileId = $( ev.currentTarget ).attr( "data-target" );
      this.currentTile = tileId;
      DE.emit( "change-building-tile", tileId );
      this.render();
    }
    
    , hide: function()
    {
      this.$el.fadeOut( 500 );
      return this;
    }
    , show: function()
    {
      this.render();
      this.$el.fadeIn( 500 );
      return this;
    }
  } );
} );