const config      = require( "../../config" );

// socket disconnect
module.exports = function()
{
  var socket = this;
  
  socket.disconnected = true;
  console.log( "player disconnected :o" );
  
  delete config.connectedPlayers[ socket.myIndex ];
  delete config.playersData[ socket.myIndex ];
  
  // remove everything after 2 sec (secure delay, if more is required then make this delay longer)
  socket.request.session.save( () => {
    socket.emit( "disconnect-game-success" );
    if ( !socket.disconnected )
      socket.disconnect();
  } );
};
