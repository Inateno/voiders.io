/***
 * This is a generic code to create a Node.js server with Redis and Mongo and WebSocket, with cookie and auth detection
 * (I'm using a third party oauth service, so you have to create your own account system)
 */
  const express      = require( "express" );
  const bodyParser   = require( "body-parser" );
  const cookieParser = require( "cookie-parser" );
  const session      = require( "express-session" );
  const RedisStore   = require( "connect-redis" )( session );
  
  const app = express();
  const server = require( "http" ).Server( app );
  
  var redisOptions = {
    port: process.env.REDIS_PORT || "6379",
    host: process.env.REDIS_HOST || "localhost",
    db  : process.env.REDIS_DB   || 1,
    pass: process.env.REDIS_PWD  || "",
    logErrors: true
  }
  if ( process.env.REDIS_URL ) {
    redisOptions = {
      url: process.env.REDIS_URL
      ,logErrors: true
    };
  }
  
  var SECRET_STUFF = process.env.SECRET_SALT_SESSION || "your secret stuff must goes in the process.env ;)";
  var expressSessionOptions = {
    secret            : SECRET_STUFF
    ,resave           : false
    ,saveUninitialized: false
    ,store            : new RedisStore( redisOptions ) // XXX redis server config
    ,cookie: {
      httpOnly: false,
      // cookie when expire when "nothing" happens
      maxAge  : 10*60*60*1000
    }
  };
  
  // better to be true, but it also depend on your host server architecture ;)
  // I'm using Scalingo and there is a proxy in front all the time, so this isn't require and will make the auth fail
  var cookieParserOptions = {
    httpOnly: false
  };

  // create a write stream (in append mode) 
  if ( process.env.NODE_ENV === "prod" || process.env.NODE_ENV === "preprod" ) {
    const path            = require( "path" );
    const fs              = require( "fs" );
    const morgan          = require( "morgan" );
    const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'})
    // setup the logger
    app.use(morgan('combined', {stream: accessLogStream}));
    
    console.log( "======= starting production mode 😷 ==========" );
    // app.set( 'trust proxy', 1 ); // trust first proxy
    expressSessionOptions.cookie.domain = ".voiders.io";
    expressSessionOptions.domain = ".voiders.io";
    // expressSessionOptions.cookie.secure = true // serve secure cookies
    cookieParserOptions.domain = ".voiders.io";
  }
  
  const sessionMiddleware = session( expressSessionOptions );
  
  // should not be used along express session... but sessions doesn't work without
  // maybe we have to use same decrypt hash
  app.use( cookieParser( SECRET_STUFF, cookieParserOptions ) );
  // app.use( cookieParser( process.env.SECRET_SALT_COOKIE || "Th3S3craytPaTh", cookieParserOptions ) );
  
  app.use( sessionMiddleware );
  
  app.use( bodyParser.json() );
  app.use( bodyParser.urlencoded( { extended: false } ) );
  
  app.use( function( req, res, next )
  {
    if ( process.env.NODE_ENV === "prod" ) {
      res.header( "Access-Control-Allow-Origin", "http://voiders.io" );
    }
    else {
      var origin = req.headers.origin;
      res.header( "Access-Control-Allow-Origin", origin || "localhost" );
    }
    
    res.header( "Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, authorization" );
    res.header( 'Access-Control-Allow-Credentials', true );
    res.header( 'Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS' );
    
    next();
  } );
  
  app.use( function( req, res, next )
  {
    if ( req.originalUrl === "/login"
      || req.originalUrl === "/logout"
      || ( req.session && req.session.user ) )
      next();
    else
    {
      console.log( "no session 😿, return 403" );
      console.log( "cookie is: ", req.cookie );
      console.log( "===============================" );
      res.status( 403 ).send( "Not auth 😿" );
    }
  } );
  
const io = require( "socket.io" )( server );
io.use( function( socket, next )
{
  sessionMiddleware( socket.request, socket.request.res, next );
} );
io.use( function( socket, next )
{
  if ( socket.request.session.user ) {
    return next();
  }
  else {
    console.log( "try websocket connection without session 😠 => kill it" );
    socket.error( "Invalid session 😘" );
    socket.disconnect( "not_auth" );
    // next( new Error( "Invalid session" ) );
    return;
  }
} );
app.io = io;

app.server = server;
module.exports = app;