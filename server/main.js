const collections = require( "./mongo/collections");
const app         = require( "./initServer" );

const ejs         = require( "ejs" );

const config      = require( "./config" );
const routes      = require( "./routes" );
const adminRoutes = require( "./routes/admin" );
const Inventory   = require( "./utils/Inventory" );

var startedAt = Date.now();

setTimeout( function()
{
  
console.log( "load chunk test" );
// collections.Map.loadChunk( 0, 0, 40 )
// .then( chunk => {
//   var duration = ( Date.now() - startedAt ) / 1000;
//   console.log( "chunk loaded in " + duration + "s" );
//   console.log( "chunk size", chunk.length );
  
//   process.exit()
// } );
// return;

// no time for lazy load for this lol should be fine anyway
collections.WorldObjects.find().lean().exec( ( err, objs ) => {
  if ( err ) {
    return console.error( "cannot load world object, should reboot :/" );
  }
  var objects = [];
  for ( var i = 0, o; i < objs.length; ++i )
  {
    o = objs[ i ];
    objects.push( {
      "id": o._id, "oId": o.object_id, "x": o.x, "y": o.y
    } );
  }
  config.WORLD_OBJECTS = objects;
  console.log( i + " WORLD_OBJECTS loaded", config.WORLD_OBJECTS.length );
} );
collections.ResourceSpots.find().lean().exec( ( err, objs ) => {
  if ( err ) {
    return console.error( "cannot load world object, should reboot :/" );
  }
  var objects = {};
  for ( var i = 0, o; i < objs.length; ++i )
  {
    o = objs[ i ];
    objects[ o._id ] = {
      "id": o._id, "resId": o.spot_id, "x": o.x, "y": o.y, energy: config.RESOURCES_SPOTS[ o.spot_id ].maxEnergy
    };
  }
  config.WORLD_RESOURCES_SPOTS = objects;
  console.log( i + " WORLD_RESOURCES_SPOTS loaded" );
} );

app.engine( '.html', ejs.__express );
app.set( 'views', __dirname + '/views' );
app.set( "view engine", "html" );

app.post( "/login", routes.post.login );

app.get( "/userData", (req, res ) => {
  res.send( { user: req.session.user } );
} );
app.get( "/logout", routes.get.logout );
app.get( "/keepAlive", routes.get.keepAlive );

app.get( "/admin/*", adminRoutes.checkAdminAuth );
app.post( "/admin/*", adminRoutes.checkAdminAuth );
app.delete( "/admin/*", adminRoutes.checkAdminAuth );
// app.get( "/admin", adminRoutes.checkAdminAuth );
// app.get( "/admin", adminRoutes.get.home );

// not working, receive a 403 when logged but same route as get is OK
// app.delete( "/disconnect", routes.get.logout );

app.server.listen( process.env.PORT || 1234, function()
{
  console.log( "Server AUTH ready on port " + ( process.env.PORT || 1234 ) );
} );

var connectedPlayers = {};
var playersData = {};
config.connectedPlayers = connectedPlayers;
config.playersData = playersData;

app.io.on( "connection", function( socket )
{
  socket.gameSession = {};
  
  var user    = socket.request.session.user;
  var myIndex = user.id;
  
  socket.user    = user;
  socket.myIndex = myIndex;
  
  // wait what ? lol
  if ( connectedPlayers[ myIndex ] ) {
    // double check disconnect the afk?
    // if ( Date.now() - connectedPlayers[ myIndex ].lastAction > config.AFK_CONSIDERATION_TIME ) {
      connectedPlayers[ myIndex ].disconnect( "Someone else logged to this account, and you are AFK !" );
    // }
    console.error( "A player tried to connect but it looks like he's already logged in :o => " + user.nick + " -- " + user.id );
    // return disconnect( socket );
  }
  
  console.log( "New user joined the game, welcome back: " + user.nick + " -- " + user.id );
  socket.player = {
    id          : myIndex
    ,currentMode: "fight"
    ,worldX     : 2000 + 42//user.worldX
    ,worldY     : 2000 + 42//user.worldY
    ,xp         : user.xp
    ,hp         : user.hp
    ,level      : user.level
    ,atk        : user.atk
    ,nick       : user.nick
  };
  
  user.resources = {
    "dirt-block"      : { q: 10040, used: 0 },
    "grass-seed"      : { q: 10040, used: 0 },
    "forest-branch"   : { q: 10040, used: 0 },
    "magic-blob"      : { q: 1000, used: 0 },
    "sand-sample"     : { q: 1000, used: 0 },
    "rock-gem"        : { q: 1000, used: 0 },
    "sea-dragon-shell": { q: 1000, used: 0 },
    "flower-petal"    : { q: 1000, used: 0 },
    "ears-wheat"      : { q: 1000, used: 0 },
    "hill-root"       : { q: 1000, used: 0 }
  };
  user.tiles = {
    2: { q: 1000, used: 0 },
    1: { q: 100, used: 0 },
    3: { q: 200, used: 0 },
    4: { q: 200, used: 0 },
    5: { q: 200, used: 0 },
    6: { q: 200, used: 0 },
    7: { q: 200, used: 0 },
    8: { q: 200, used: 0 },
    9: { q: 200, used: 0 }
  };
  
  connectedPlayers[ myIndex ] = socket;
  playersData[ myIndex ] = socket.player;
  
  // player join
  socket.broadcast.emit( "pj", socket.player );
  
  // initialization packet, the user should have received the standard data while login, here we send the dynamic data
  // worldMap can be very heavy, so just sending the chunk
  socket.emit( "ii", myIndex, {
    WORLD_OBJECTS          : config.WORLD_OBJECTS
    , ENV_OBJECTS          : config.ENV_OBJECTS
    , RESOURCES_SPOTS      : config.RESOURCES_SPOTS
    , WORLD_RESOURCES_SPOTS: config.WORLD_RESOURCES_SPOTS
    , RESOURCES            : config.RESOURCES
    , RECIPES              : config.RECIPES
    , TILES                : config.TILES
    , BLOCKS               : config.BLOCKS
  }, playersData );//, getNearbyPlayers( socket.player ) );
  socket.emit( "u-resources", socket.user.resources );
  socket.emit( "u-tiles", socket.user.tiles );
  
  // update input
  socket.on( "ui", ( type, v1, v2, x, y ) => {
    playersData[ myIndex ].worldX = ( x / config.WORLD.TILE_W_HALF + y / config.WORLD.TILE_H_HALF) / 2 + 1 >> 0;
    playersData[ myIndex ].worldY = ( y / config.WORLD.TILE_H_HALF - ( x / config.WORLD.TILE_W_HALF ) ) / 2 + 1 >> 0;
    
    app.io.emit( "ui", myIndex, type, v1, v2, x >> 0, y >> 0 );
  } );
  
  socket.on( "pt", routes.socket.placeTile );
  
  // craft tile
  socket.on( "ct", ( tile, materials ) => {
    // materials not full?
    if ( materials.indexOf( null ) !== -1 ) {
      return;
    }
    
    // check we own all materials announced
    var mats = {};
    for ( var i = 0; i < materials.length; ++i )
    {
      resId = materials[ i ];
      if ( !mats[ resId ] ) {
        mats[ resId ] = 0;
      }
      ++mats[ resId ];
    }
    for ( var i in mats )
    {
      if ( !socket.user.resources[ i ]
        || socket.user.resources[ i ].q < mats[ i ] ) {
        // nop
        return;
      }
    }
    
    var tileCreated;
    // now find the RECIPES
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
        
        // try the next recipe directly
        if ( failed ) {
          p = poss.length;
        }
      }
      
      // if passed all possibilities without failure, the pattern is ok
      if ( !failed ) {
        tileCreated = config.RECIPES[ i ].tileCreated;
        break;
      }
    }
    
    // if it's not the same, the user mb try a hack
    if ( tileCreated != tile ) {
      return;
    }
    
    // it's ok?? let's remove resource to user and add the tile
    Inventory.addTile( socket.user, tileCreated );
    for ( var i in mats ) { Inventory.useResource( socket.user, i, mats[ i ] ); }
    // no need to return the new data to the user, the client will do it properly because it's the same data
    socket.emit( "ct-ok", tileCreated );
  } );
  
  // ask chunk
  socket.on( "ck", ( x, y ) => {
    collections.Map.loadChunk( x, y, 40 )
    .then( chunk => {
      socket.emit( "ck", chunk );
    } )
    .catch( err => {
      console.error( "Crap, lazy load the chunk failed" );
      console.error( err );
    } );
  } )
  
  /*** hit a resource (will earn resources and decrease energy of the resource)
   * just receiving the id of the item, the server can check the distance etc
   */
  socket.on( "hr", ( id ) => {
    // TODO add check if distance is correct (later)
    
    var obj = config.WORLD_RESOURCES_SPOTS[ id ];
    if ( obj.energy <= 0 ) {
      return;
    }
    
    obj.energy -= socket.player.atk;
    
    var res = config.RESOURCES_SPOTS[ obj.resId ];
    var loot = res.minimumDrop + Math.random() * ( res.extraLuckDrop + 0.2 ) >> 0;
    app.io.emit( "hr", socket.myIndex, id, obj.energy, loot );
    
    if ( loot > 0 ) {
      Inventory.addResource( socket.user, res.drop, loot );
      socket.emit( "u-resources", socket.user.resources );
    }
  } );
  
  // tchat
  socket.on( "t", ( msg ) => {
    socket.broadcast( "t", msg );
  } );
  
  /***
   * disconnect stuff
   */
  socket.on( "disconnect", routes.socket.disconnect );
} );

// ticker every seconds
setInterval( function()
{
  var update = [];
  var now = Date.now();
  var spot;
  for ( var i in config.WORLD_RESOURCES_SPOTS )
  {
    spot = config.WORLD_RESOURCES_SPOTS[ i ];
    data = config.RESOURCES_SPOTS[ spot.resId ];
    
    if ( spot.energy >= data.maxEnergy ) {
      continue;
    }
    
    if ( now - spot.lastRegen > data.reloadInterval ) {
      spot.lastRegen = now;
      ++spot.energy;
    }
    update.push( { id: i, en: spot.energy } );
  }
  
  if ( update.length > 0 ) {
    app.io.emit( "res-up", update );
  }
}, 2000 );

}, 2000 );
