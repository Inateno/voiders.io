const collections = require( '../../mongo/collections' );
const config      = require( '../../config' );
const updateWallet= require( '../../utils/updateWallet' );

const nebulaApi    = require( "nebula-api" )( config.NEBULA_SECRET, config.NEBULA_GAMENAME );

const ObjectIdRegex = /^[0-9a-fA-F]{24}$/;
const forbiddenChars = /[<>\*\\\]\[]/gi;

const emailregex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

module.exports = function( req, response )
{
  var isGuest = req.body.guest;
  var nick    = ( req.body.nick || "" ).replace( forbiddenChars, "" );
  var tk      = req.body.tk // sso oauth token;
  
  if ( isGuest ) {
    
    if ( !config.ALLOW_GUEST ) {
      return response.status( 401 ).send( "Guest are not allowed" );
    }
    
    var d = Date.now().toString();

    if ( nick === "" ) {
      nick = "guest-" + ( d.slice( d.length - 6, d.length - 1 ) );
    }
    else {
      nick = nick.slice( 0, 20 );
    }
    
    var nickConvertedToHexa = "";
    for ( var i = 0; i < nick.length; ++i )
    {
      nickConvertedToHexa += nick.charCodeAt( i ).toString( 16 );
    }
    
    nickConvertedToHexa = nickConvertedToHexa.slice( 0, 24 );
    
    // check uid is correct
    if ( nickConvertedToHexa.length < 24 ) {
      d = d + "" + d; // double value because date can be to short
      var missing = ( 24 - nickConvertedToHexa.length ) + 1;
      nickConvertedToHexa += d.slice( d.length - missing, d.length - 1 );
    }
    
    uid = nickConvertedToHexa;
    
    console.log( "new guest", nick, uid );
  }
  
  // console.log( "uid is", uid );
  // if ( !uid || !uid.toString().match( ObjectIdRegex ) ) {
  //   return response.status( 403 ).send( { error: "Not a valid ID" } );
  // }

  console.log( "a login appear", tk );
  return new Promise( ( res, rej ) => {
    
    if ( isGuest ) {
      var user = {
        "id"           : uid
        ,"is_guest"    : true
        ,"nick"        : nick
        ,"nick_lower"  : nick.toLowerCase()
        ,"lang"        : ( req.body.lang || "en" ).replace( forbiddenChars, "" )
      }
      console.log( "guest user is:", user );
      return res( user );
    }
    else {
      // token validation by third party, just do your own stuff instead
      nebulaApi.get.checkToken( tk )
      .then( data => {
        res( { nebula_user_id: data.user_id } );
      } )
      .catch( e => {
        console.log( "Error on validate the token" );
        console.log( e );
        console.log( "===" );
        return rej( "Token Error" );
      } );
    }
  } )
  
  // find or create the user (data can be the user if it's a guest)
  .then( data => {
    return new Promise( ( res, rej ) => {
      // no lean because user is saved later
      if ( data.is_guest ) {
        return res( data );
      }
      
      // change this depending your needs
      var searchBy = { nebula_id: data.nebula_user_id };
      
      console.log( "search by", searchBy )
      
      // not lean because save appears on user model
      collections.Users.findOne( searchBy, undefined, {} )
      .exec( ( err, user ) => {
        
        if ( err ) {
          console.error( "auth /login, error on first request Users -- " + err );
          return rej( "An error occurred while login, code #1001" );
        }
        
        // if user is nebula, update it
        if ( user ) {
          return new Promise( ( res, rej ) => {
            nebulaApi.get.identity( data.nebula_user_id ).then( nebuData => res( nebuData.user ) );
          } )
          .then( nebuUser => {
            user.nick = nebuUser.username;
            user.lang  = nebuUser.lang || "en";
            user.email = nebuUser.mail;
            
            user.save( ( err, updatedUser ) => {
              if ( err ) {
                console.error( "auth /login, while updating NebulaData -- " + err );
                // still login, prevent crash it's not "very important"
                return res( user );
              }
              
              return res( updatedUser )
            } );
          } );
        }
        
        return new Promise( ( res, rej ) => {
          if ( data.nebula_user_id ) {
            nebulaApi.get.identity( data.nebula_user_id ).then( okData => res( okData.user ) );
          }
          // if not using nebula_api you can remove this Promise and keep then only, this will create the user
          // with data
          else {
            res( data );
          }
        } )
        .then( okData => {
          collections.Users.create( okData, ( err, user ) => {
            if ( err ) {
              console.error( "auth /login, error on create Users request -- " + err );
              return rej( err );
            }
            return res( user );
          } );
        } );
      } );
    } );
  } )
  
  // update the nebula session wallet, you can safely remove this
  .then( user => {
    if ( user.is_guest ) {
      return Promise.resolve( user );
    }
    else {
      return updateWallet( req, user );
    }
  } )
  
  // end, user is the data coming from the db excepted if it's a guest
  .then( user => {
    // store all in the session
    console.log( "Login success for " + user.nick + " session is now created" );
    console.log( "at " + new Date().toLocaleString() );
    
    req.session.userId = user.id;
    req.session.user = user.toObject ? user.toObject() : user;
    
    
    req.session.save( () => {
      // 2 seconds is what redis need to get the session cookie expire time ok ? (with 500 ms it's throw an error)
      setTimeout( function()
      {
        response.send( {
          result         : "ok"
          , myData       : user.toJSON ? user.toJSON() : user
          , wallet       : req.session.wallet
        } );
      }, 2000 );
    } );
  } )
  
  .catch( err => {
    var httpStatus = 500;
    
    console.log( "Error while login::", err );
    response.status( httpStatus ).send( err.toString() );
  } );
};