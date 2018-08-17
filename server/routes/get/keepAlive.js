module.exports = function( req, res )
{
  if ( !req.session || !req.session.user ) {
    return res.status( 400 ).send( "Nop" );
  }
  req.session.keepAlive = Date.now();
  req.session.save();
  console.log( "expire in", req.session.cookie._expires );
  res.send( { code: "ok" } );
};