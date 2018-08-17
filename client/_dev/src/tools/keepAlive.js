define( [ "config", "tools.rest_api" ],
function( config, rest_api )
{
  var _isAlive = false;
  var _timeout;
  function keepAlive( isAlive )
  {
    if ( isAlive !== undefined ) {
      _isAlive = isAlive;
    }
    
    clearTimeout( _timeout );
    
    if ( isAlive === false ) {
      return;
    }
    
    _timeout = setTimeout( function()
    {
      if ( !_isAlive ) {
        return;
      }
      
      rest_api.get( config.api + "keepAlive", null, function( err, data ) {
        keepAlive();
      } );
    }, 59*60*1000 ); // 59 minutes
  }
  
  return keepAlive;
} );