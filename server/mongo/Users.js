const mongoose = require ( "mongoose" );
const config = require ( "../config" );

var Schema = mongoose.Schema;

var schema = new Schema( {
  // user standard data
  nick_lower     : { type: String, unique: true }
  ,nebula_id     : { type: mongoose.Schema.Types.ObjectId, unique: true }
  ,nick          : String
  ,birthdate     : String
  ,date          : { type: Date, default: Date.now() }
  ,lastLog       : { type: Date, default: Date.now() }
  ,lang          : { type: String, default: "en" }
  ,email         : { type: String } // email from Nebula API, can be useful
  
  // game relative
  ,avatar        : { type: String }
  ,settings      : { type: Object, default: {} }
  ,xp            : { type: Number, default: 0 }
  ,level         : { type: Number, default: 1 }
  ,atk           : { type: Number, default: config.DEFAULT_ATK }
  ,hp            : { type: Number, default: config.DEFAULT_HP }
  
  ,worldX        : { type: Number, default: config.SPAWN_X }
  ,worldY        : { type: Number, default: config.SPAWN_Y }
  
  ,resources     : { type: Object, default: {
  } }
  ,tiles         : { type: Object, default: {
    1: { q: 10, used: 0 },
    2: { q: 10, used: 0 },
    3: { q: 6, used: 0 }
  } }
  
  // admin stuff
  ,banned        : { type: Boolean, default: false }
  ,ban_date      : Date
  // this attribute is used for administrators / moderators / whatever can be useful ^^
  ,access        : { type: Number, default: 0 }
}, {
  toObject: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      
      delete ret._id;
      delete ret.__v;
      
      return ret;
    }
  }
  // when send to client
  , toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      
      delete ret._id;
      delete ret.__v;
      delete ret.access;
      delete ret.banned;
      delete ret.ban_date;
      delete ret.nebula_id;
      delete ret.date;
      delete ret.lastLog;
      
      return ret;
    }
  }
} );

schema.statics.create = function( udata, cb )
{
  udata.nebula_id = udata.id;
  delete udata.id;
  
  udata.nick = udata.username;
  udata.nick_lower = udata.username_lower;
  delete udata.username;
  delete udata.username_lower;
  
  udata.email = udata.mail || udata.email; // at Feb-07-2018 it was mail
  delete udata.mail;
  
  // no pwd, we can log it safely
  console.log( "==========================" );
  console.log( "creating user " );
  console.log( udata );
  console.log( "==========================" );
  
  var newUser = new Users( udata );
  // save our user into the database
  newUser.save( function( err )
  {
    if ( err ) {
      console.error( "Users.create user failed when save " + udata.username + " ==> ", err );
      return cb( "An error occurred while saving the user. Code #col_1001", null );
    }
    
    return cb( null, newUser );
  } );
};

var Users;
function make( connection ) {
  if ( Users )
    return Users;
  Users = connection.model( 'User', schema );
  return Users;
}
module.exports = make;