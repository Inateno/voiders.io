/**
 * @ContributorsList
 * @Inateno / http://inateno.com / http://dreamirl.com
 *
 * this is the images file sample that will be loaded by the project in the ResourcesManager module
 * it can also load .json files (for sheets and particles)
 * Please declare in the same way than this example.
 * To load image as default just set "load" to true.
 *
 * Otherwise you can load/add images when you want, load images by calling the DREAM_ENGINE.ImageManager.pushImage function
 *
 * - [ name, url, { load:Bool, totalFrame:Int, totalLine:Int, interval:Int (ms), animated:Bool, isReversed:Bool } ]
 *
 * name, and url are required
 */
define( [],
function()
{
  var images = {
    // available images sizes (engine will load the best images pool depending on the user resolution)
    resolutions: [
      { "w": 1280, "h": 720, "path": "" }
      // ,{ "w": 1280, "h": 720, "path": "", "notRatio": true }
      // , { "w": 640, "h": 360, "path": "", "notRatio": true }
      // , { "w": 480, "h": 270, "path": "sd/" }
    ]
    
    // index of the used screen size during game conception
    , conceptionSizeIndex: 0
    
    // images folder name 
    , baseUrl: "imgs/"
    
    // usage name, real name (can contain subpath), extension, parameters
    , pools: {
      // loaded when engine is inited
      default: [
        [ "player", "chars/player.png", { "totalFrame": 4, "totalLine": 8, "interval": 75, "animated":false, "isReversed": false } ]
        ,[ "cursor", "ui/target.png", { "totalFrame": 1, "animated":false, "isReversed": false } ]
        ,[ "actionMode", "ui/mode.png", { "totalFrame": 1, "totalLine": 2, "animated":false, "isReversed": false } ]
        ,"tiles/atlas-1.json"
        
        // resources
        ,"resources/resources.json"
        ,"resources/resource-spots.json"
        
        //envs
        ,"env/city-atlas.json"
        ,[ "tree-1", "env/tree-1.png", { "totalFrame": 1, "totalLine": 1, "animated":false, "isReversed": false } ]
        ,[ "tree-1-2", "env/tree-1-2.png", { "totalFrame": 1, "totalLine": 1, "animated":false, "isReversed": false } ]
        ,[ "tree-2", "env/tree-2.png", { "totalFrame": 1, "totalLine": 1, "animated":false, "isReversed": false } ]
        ,[ "house-1", "env/house-1.png", { "totalFrame": 1, "totalLine": 1, "animated":false, "isReversed": false } ]
        ,[ "shop", "env/shop.png", { "totalFrame": 1, "totalLine": 1, "animated":false, "isReversed": false } ]
        ,[ "altar", "env/altar.png", { "totalFrame": 1, "totalLine": 1, "animated":false, "isReversed": false } ]
        
        ,[ "touchControlBackground", "touch-control/background.png", { "totalFrame": 1, "animated": false } ]
        ,[ "touchControlStick", "touch-control/stick.png", { "totalFrame": 1, "animated": false } ]
      ]
      
      // a custom pool not loaded by default, you have to load it whenever you want (you can display a custom loader or just the default loader)
      ,aCustomPool: [
        // resources
      ]
    }
  };
  
  return images;
} );