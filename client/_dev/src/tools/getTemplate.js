define( [ 'jquery', 'config' ]
, function( $, config )
{
  var _templates = {};
  
  function getTemplate( template, cb, reset )
  {
    if ( _templates[ template ] && !reset )
    {
      cb( _templates[ template ] );
      return;
    }
    
    $.ajax( {
      url: "./templates/" + template + '.tmpl?' + config.version
      ,context: document.body
      ,dataType: "text"
      
    } ).done( function( data )
    {
      _templates[ template ] = data;
      cb( data );
    } ).fail( function( jqXHR, textStatus, errorThrown )
      {
        // console.log( arguments );
        // errorAlert( "Cannot get template " + template );
        console.log( "Error on get request " + textStatus + " -- " + errorThrown );
      } );
  }
  
  return getTemplate;
} );