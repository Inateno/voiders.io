module.exports = function( req, res )
{
  if ( !req.session || !req.session.user ) {
    return res.send( { code: "nothing to logout" } );
  }
    
  var nick = req.session.user.nick;
  console.log( "user " + nick + " disconnecting" );
  
  if ( req.logout ) {
    console.log( nick + " calling logout" );
    req.logout();
  }
  
  if ( req.session.destroy ) {
    console.log( nick + " destroy session" );
    req.session.destroy();
  }
  
  res.send( { code: "ok" } );
};