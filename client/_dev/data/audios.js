/**
 * @ContributorsList
 * @Inateno / http://inateno.com / http://dreamirl.com
 *
 * this is the audios list sample that will be loaded by the project
 * Please declare in the same way than this example.
 * To automatically preload a file just set "preload" to true.
 */

define( [],
function()
{
  var audios = [
    // MUSICS
    [ "happiness", "audio/happiness", [ 'mp3', 'ogg' ], { "preload": true, "loop": true, "isMusic": true } ]
    , [ "the-void", "audio/the-void", [ 'mp3', 'ogg' ], { "preload": true, "loop": true, "isMusic": true } ]
  ];
  
  return audios;
} );