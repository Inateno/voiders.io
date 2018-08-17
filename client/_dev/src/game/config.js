define( [], function()
{
  var config = {
    myIndex: null // received by server
    , SCREEN_W: 1280
    , SCREEN_H: 720
    
    , instancied_resources_points : {} // store resources points
    , instancied_world_objects    : {} // store all "world objects"
    , instancied_world_interactive: {} // store all "world objects" you can interact with
    
    , SERVER_URL: "http://server.voiders.io:1234/"
    
    , LAZY_RENDER_RANGE : 23
    , LAZY_LOAD_SECURITY: 5
    , LAZY_LOAD_RANGE   : 30
    
    , WORLD: {
      TILE_H_HALF: 16, // ~~160 / 4 = 40 - thickness => 32 / 4 = 8 so 32 / 2 (only half height) = 16 >> 0,
      TILE_W_HALF: 32
    }
    , WORLD_DATA: []
  };
  
  for ( var y = 0, row; y < 4000; ++y )
  {
    row = [];
    for ( var x = 0; x < 4000; ++x ) { row.push( -1 ); }
    config.WORLD_DATA.push( row );
  }
  
  if ( window.i_m_l_n ) {
    config.SERVER_URL = "http://localhost:1234/";
  }
  
  return config;
} );