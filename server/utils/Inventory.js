const config = require( "../config" );

var Inventory = {};

Inventory.addResource = function( player, resId, q )
{
  var resources = player.resources;
  if ( !resources[ resId ] ) {
    resources[ resId ] = { q: 0, used: 0 };
  }
  
  resources[ resId ].q += q || 1;
};

Inventory.hasResource = function( player, resId, q )
{
  var resources = player.resources;
  return resources[ resId ] ? resources[ resId ].q >= ( q || 1 ) : false;
};
Inventory.useResource = function( player, resId, q )
{
  var resources = player.resources;
  resources[ resId ].q -= q || 1;
  resources[ resId ].used += q || 1;;
}

Inventory.addTile = function( player, tileId )
{
  var tiles = player.tiles;
  if ( !tiles[ tileId ] ) {
    tiles[ tileId ] = { q: 0, used: 0 };
  }
  ++tiles[ tileId ].q;
};

Inventory.hasTile = function( player, tileId )
{
  var tiles = player.tiles;
  return tiles[ tileId ] ? tiles[ tileId ].q > 0 : false;
};
Inventory.useTile = function( player, tileId )
{
  var tiles = player.tiles;
  tiles[ tileId ].q -= 1;
  tiles[ tileId ].used += 1;
}

module.exports = Inventory;