define( [ 'DREAM_ENGINE', 'config' ],
function( DE, config )
{
  var Inventory = {};

  Inventory.tiles = {
    1: { q: 10, used: 0 },
    2: { q: 10, used: 0 },
    3: { q: 10, used: 0 }
  };

  Inventory.resources = {
    "magic-seed": { q: 10, used: 0 },
    "grass-seed": { q: 14, used: 0 }
  };

  Inventory.addResource = function( resId, q )
  {
    if ( !Inventory.resources[ resId ] ) {
      Inventory.resources[ resId ] = { q: 0, used: 0 };
    }
    
    Inventory.resources[ resId ].q += q || 1;
    
    DE.emit( "inventory-resources-update", Inventory.resources );
  };
  
  Inventory.hasResource = function( resId, q )
  {
    return this.resources[ resId ] ? this.resources[ resId ].q >= ( q || 1 ) : false;
  };
  Inventory.useResource = function( resId, q )
  {
    this.resources[ resId ].q -= q || 1;
    this.resources[ resId ].used += q || 1;;
    DE.emit( "inventory-resources-update", Inventory.resources );
  }
  
  Inventory.addTile = function( tileId )
  {
    if ( !Inventory.tiles[ tileId ] ) {
      Inventory.tiles[ tileId ] = { q: 0, used: 0 };
    }
    ++Inventory.tiles[ tileId ].q;
    
    DE.emit( "inventory-tiles-update", Inventory.tiles );
  };
  
  Inventory.hasTile = function( tileId )
  {
    return this.tiles[ tileId ] ? this.tiles[ tileId ].q > 0 : false;
  };
  Inventory.useTile = function( tileId )
  {
    this.tiles[ tileId ].q -= 1;
    this.tiles[ tileId ].used += 1;
    DE.emit( "inventory-tiles-update", Inventory.tiles );
  }
  
  window.Inventory = Inventory;
  
  return Inventory;
} );