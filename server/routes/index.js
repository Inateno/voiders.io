module.exports = {
  get: {
    logout    : require( "./get/logout" )
    ,keepAlive: require( "./get/keepAlive" )
  }
  , post: {
    login: require( "./post/login" )
  }
  , delete: {
    
  }
  , socket: {
    disconnect: require( "./socket/disconnect" ),
    placeTile: require( "./socket/placeTile" )
  }
};