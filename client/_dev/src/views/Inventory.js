define( [
  'DREAM_ENGINE', 'jquery', 'underscore', 'backbone', 'config'
  , 'tools.getTemplate'
  , 'Inventory'
]
, function(
  DE, $, _, Backbone, config
  , getTemplate
  , Inventory
)
{
  return Backbone.View.extend( {
    tagName   : "div"
    ,id       : "Inventory"
    ,className: "fs-window"
    
    , initialize: function()
    {
      var self = this;
      
      $( "#render" ).append( this.$el );
      this.$el.hide();
      
      getTemplate( "Inventory", function( data )
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
      ,"click .item": "changeActiveItem"
    }
    
    , render: function()
    {
      if ( !this.ready ) {
        this.waitForRender = true;
        this.lastRenderArgs = null;
        return this;
      }
      
      this.$el.html( this.template( {
        dictionary       : DE.Localization.dictionary[ DE.Localization.currentLang ]
        , resourcesData  : config.RESOURCES
        , inventory      : Inventory.resources
        , currentItem    : this.currentItem
      } ) );
      
      return this;
    }
    
    , changeActiveItem: function( ev )
    {
      var targetId = $( ev.currentTarget ).attr( "data-target" );
      this.currentItem = targetId;
      this.render();
    }
    
    , hide: function()
    {
      this.$el.fadeOut( 500 );
      this.visible = false;
      return this;
    }
    , show: function()
    {
      this.render();
      this.visible = true;
      this.$el.fadeIn( 500 );
      return this;
    }
    , toggle: function()
    {
      if ( this.visible ) {
        this.hide();
      }
      else {
        this.show();
      }
    }
  } );
} );