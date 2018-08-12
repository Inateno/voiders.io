define( [ "config" ], function( config )
{
  return function( cb, ctx )
  {
    if ( window.io )
      return cb.call( ctx || window );
    
    var tag = document.createElement( "script" );
    tag.src = config.server_url + "socket.io/socket.io.js";
    var oldDefine = window.define;
    window.define = undefined;
    tag.onload = function()
    {
      window.define = oldDefine;
      console.log( '%cGet Socket.io !', "color:green" );
      DE.trigger( "io-load-success" );
      if ( cb )
        cb.call( ctx || window );
      document.body.removeChild( tag );
    };
    tag.onerror = function()
    {
      DE.trigger( "io-load-fail" );
      document.body.removeChild( tag );
    };
    document.body.appendChild( tag );
  };
} );