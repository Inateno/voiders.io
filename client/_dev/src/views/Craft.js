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
    ,id       : "Craft"
    ,className: "fs-window w-o-bg"
    
    , initialize: function()
    {
      var self = this;
      
      $( "#render" ).append( this.$el );
      this.$el.hide();
      DE.on( "craft-success", this.onCraftSuccess, this );
      
      getTemplate( "Craft", function( data )
      {
        self.ready = true;
        self.template = _.template( data );
        
        if ( self.waitForRender )
          self.render( self.lastRenderArgs );
        self.waitForRender = false;
      } );
      
      this.materials   = [ null, null, null, null, null, null ]; // need the void, null, null, null ];
      this.tempUsed    = {};
      this.tileCreated = null;
    }
    
    , events: {
      "click .closeBtn": "hide"
      ,"click .craftBtn": "launchCraft"
      ,"click .addItem": "addItem"
      
      ,"click .craft-slot": "selectSlot"
      ,"click .items-list .item": "chooseItem"
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
        , selectedSlot   : this.selectedSlot
        , materials      : this.materials
        , tempUsed       : this.tempUsed
        , tileCreated    : this.tileCreated
      } ) );
      
      return this;
    }
    
    , closeSelector: function()
    {
      this.selectedSlot = null;
      this.$el.find( ".items-list" ).removeClass( "opened" );
    }
    , selectSlot: function( ev )
    {
      this.$el.find( ".craft-slot" ).removeClass( "active" );
      
      var $target = $( ev.currentTarget );
      var targetId = parseInt( $target.attr( "data-target" ) );
      
      if ( this.selectedSlot == targetId ) {
        this.closeSelector();
        return;
      }
      
      $target.addClass( "active" );
      this.$el.find( ".items-list" ).addClass( "opened" );
      
      this.selectedSlot = targetId;
    }
    , chooseItem: function( ev )
    {
      var itemId = $( ev.currentTarget ).attr( "data-target" );
      
      if ( this.tempUsed[ itemId ] && Inventory.resources[ itemId ].q <= this.tempUsed[ itemId ] ) {
        return;
      }
        
      this.materials[ this.selectedSlot ] = itemId;
      this.$el.find( ".slot-" + this.selectedSlot ).html( itemId );
      this.closeSelector();
      
      this.recalculateTempUsed();
      var tileCreated = this.getTileCreated();
      if ( tileCreated ) {
        this.tileCreated = tileCreated;
        this.$el.find( ".craft-result" ).html( tileCreated );
      }
    }
    
    , recalculateTempUsed: function()
    {
      this.tempUsed = {};
      for ( var i = 0, resId; i < this.materials.length; ++i )
      {
        resId = this.materials[ i ];
        
        if ( !this.tempUsed[ resId ] ) {
          this.tempUsed[ resId ] = 0;
        }
        ++this.tempUsed[ resId ];
      }
      this.render();
    }
    
    , launchCraft: function()
    {
      var tileCreated = this.getTileCreated();
      if ( !tileCreated ) {
        return;
      }
      
      DE.emit( "send-launch-craft", tileCreated, this.materials );
    }
    
    ,onCraftSuccess: function( tileCreated )
    {
      this.tileCreated = tileCreated;
      
      Inventory.addTile( tileCreated );
      for ( var i = 0; i < this.materials.length; ++i )
      {
        Inventory.useResource( this.materials[ i ] );
      }
      this.tempUsed = {};
      
      // once all resources are consumed, check if the user has enough to make an other craft
      // else, empty the craft result (and the slot)
      for ( var i = 0, resId; i < this.materials.length; ++i )
      {
        resId = this.materials[ i ];
        
        if ( !Inventory.hasResource( resId, 1 + this.tempUsed[ resId ] ) ) {
          console.log( "no more resource for ", resId, Inventory.resources[ resId ] );
          this.materials[ i ]  = null;
          this.tileCreated = null;
        }
        else {
          if ( !this.tempUsed[ resId ] ) {
            this.tempUsed[ resId ] = 0;
          }
          ++this.tempUsed[ resId ];
        }
      }
      this.render();
    }
    
    , getTileCreated: function()
    {
      if ( this.materials.indexOf( null ) !== -1 ) {
        return false;
      }
      
      var materials = this.materials;
      
      for ( var i in config.RECIPES )
      {
        var poss = config.RECIPES[ i ].possibilities;
        
        for ( var p = 0, failed = false; p < poss.length; ++p )
        {
          failed = true;
          types = poss[ p ];
          
          // must check all the types
          for ( var t = 0, material; t < types.length; ++t )
          {
            material = materials[ p ]
            materialTypes = config.RESOURCES[ material ].types;
            if ( materialTypes.indexOf( types[ 0 ] ) !== -1 ) {
              failed = false;
              t = types.length;
            }
          }
          
          // try the next recipe
          if ( failed ) {
            p = poss.length;
          }
        }
        
        // if passed all possibilities without failure, the pattern is ok
        if ( !failed ) {
          return config.RECIPES[ i ].tileCreated;
        }
      }
      
      return false;
    }
    
    , hide: function()
    {
      this.$el.fadeOut( 500 );
      this.visible = false;
      DE.Inputs.keyLocked = false;
      return this;
    }
    , show: function()
    {
      this.render();
      this.visible = true;
      this.$el.fadeIn( 500 );
      DE.Inputs.keyLocked = true;
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