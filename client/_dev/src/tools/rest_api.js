define( [ "jquery" ], function( $ )
{
  function makeAjax( url, method, data, cb, ctx )
  {
    $.ajax( {
      url       : url
      // fix a specific bug on some Firefox and Safari versions ?
      ,beforeSend: function( xhr ) {
        if ( xhr.overrideMimeType )
          xhr.overrideMimeType( "application/json" );
      }
      ,context  : document.body
      ,dataType : "json"
      ,jsonp    : false
      ,method   : method || "GET"
      ,xhrFields: { withCredentials: true }
      ,data     : data
    } ).done( function( d )
    {
      cb.call( ctx || window, null, d );
    } ).fail( function( req, err, stack )
    {
      console.error( "AJAX ERROR" );
      console.log( req );
      console.log( "error value", err );
      console.error( stack );
      var error = err;
      if ( req.responseJSON && req.responseJSON.error ) {
        error = req.responseJSON.error;
      }
      else if ( req.responseJSON && req.responseJSON.message ) {
        error = req.responseJSON.message;
      }
      else if ( req.responseJSON && req.responseJSON.e ) {
        error = req.responseJSON.e;
      }
      else if ( req.responseText ) {
        error = req.responseText;
      }
      
      cb.call( ctx || window, error, null );
    } );
  }
  return {
    post: function( url, data, cb, ctx )
    {
      makeAjax( url, "POST", data, cb, ctx );
    }
    , get: function( url, data, cb, ctx )
    {
      makeAjax( url, "GET", data, cb, ctx );
    }
    , delete: function( url, data, cb, ctx )
    {
      makeAjax( url, "DELETE", data, cb, ctx );
    }
    , put: function( url, data, cb, ctx )
    {
      makeAjax( url, "PUT", data, cb, ctx );
    }
  }
} );