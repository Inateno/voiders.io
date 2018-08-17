module.exports =  {
  get: {
  }
  , post: {
  }
  , delete: {
  }
  , checkAdminAuth: ( req, res, next ) => {
    if ( req.session && req.session.user && req.session.user.access >= 5 ) {
      next();
    }
    else {
      return res.status( 401 ).send( "Ooops, something probably went wrong, are you lost ? 🙈" );
    }
  }
};