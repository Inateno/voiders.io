const config    = require( "../config" );
const nebulaApi = require( "nebula-api" )( config.NEBULA_SECRET, config.NEBULA_GAMENAME );

module.exports = ( req, user ) => {
  return new Promise( ( res, rej ) => {
    
    var saveSess = false;
    if ( !user ) {
      saveSess = true;
      user = req.session.user;
    }
    
    nebulaApi.get.wallet( user.nebula_id )
    .then( wallet => {
      
      req.session.wallet = {
        dreampoints: wallet.dreampoints
        ,suns      : wallet.suns
      };
      if ( saveSess ) {
        req.session.save();
      }
      return res( user );
      
    } )
    .catch( e => {
      return rej( e );
    } )
    
  } );
}