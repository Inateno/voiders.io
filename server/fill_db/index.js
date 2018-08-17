/******************************
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 * !!!!!!!!!!!!         WARNING          !!!!!!!!!!!
 
 This script will save 4 194 204 entries in the database.
 It takes 15 minutes on a 12 thread I7 and consume more than 13Gb Ram, a night in single thread
 If you don't want to die, and you just want to try the code stuff, remove the loop in the "map.js" file
 */
const cluster = require('cluster');
const numCPUs = require('os').cpus().length - 2;
const map = require ( "./data/map" );
const saveTiles = require( "./fill_map" );
const saveObjects = require( "./fill_objects" );
const saveSpots = require( "./fill_spots" );

var actualY = 0;
var NUMBER_OF_ROWS_PER_WORKER = 1; //20;
var process_is_finished = false;

// worker is a good idea ut not reliable, to much errors in mongoDB (going to fast) and missing some tiles
// I prefer to run a script one night :p but I let this script here at least you can check it out
// function forkOne()
// {
//   var worker = cluster.fork();
//   worker.send( { start: true, y: actualY } );
//   actualY += NUMBER_OF_ROWS_PER_WORKER;
//   worker.on( 'message', function( msg )
//   {
//     if ( msg == "done" && !process_is_finished ) {
//       setTimeout( function() {
//         forkOne();
//       }, 10000 );
//     }
//     else if ( msg == "finish_finish" ) {
//       process_is_finished = true;
//     }
//     worker.kill();
//   } );
// }
// if (cluster.isMaster) {
//   console.log(`Master ${process.pid} is running`);

//   // Fork workers.
//   for (let i = 0; i < numCPUs; i++) {
//     forkOne();
//   }

//   cluster.on( 'exit', ( worker, code, signal ) => {
//     if (worker.exitedAfterDisconnect === true) {
//       console.log(`worker ${worker.process.pid} finished the job`);
//       if ( cluster.workers.lenght == 0 && process_is_finished ) {
//         console.log( "YEAAAAAAAAAAAAAAh" );
//         process.exit();
//       }
//     }
//     else {
//       console.log(`worker ${worker.process.pid} died`);
//     }
//   } );
// } else {
//   process.on( 'message', ( msg ) => {
//     if ( msg.start ) {
//       saveTiles( 0, msg.y, msg.y + NUMBER_OF_ROWS_PER_WORKER );
//     }
//   } );
// }
setTimeout( function()
{
  
saveTiles()
.then( () => {
  return saveObjects();
} )
.then( () => {
  return saveSpots();
} )
.then( () => {
  console.log( "Job done" );
  process.exit();
} );

}, 2000 );