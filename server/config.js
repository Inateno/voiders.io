const config = {
  app_url    : "voiders.io"
  ,server_url: "voiders.io"
  ,db_url    : process.env.MONGO_URL || "mongodb://127.0.0.1:27017/voiders"
  
  , ALLOW_GUEST         : process.env.ALLOW_GUEST || true
  , BETA_ACCESS_REQUIRED: true
  
  , NEBULA_SECRET  : process.env.NEBULA_SECRET || "token-bidon"
  , NEBULA_GAMENAME: process.env.NEBULA_GAMENAME || "voiders"
  
  , OBJECT_ID_REGEX : /^[0-9a-fA-F]{24}$/
  
  , DEFAULT_ATK: 1
  , DEFAULT_HP : 10
  , SPAWN_X    : 1010
  , SPAWN_Y    : 1010
  , AFK_CONSIDERATION_TIME: 20000
  
  , WORLD: {
    TILE_H_HALF: 16, // ~~160 / 4 = 40 - thickness => 32 / 4 = 8 so 32 / 2 (only half height) = 16 >> 0,
    TILE_W_HALF: 32
  }
};

if ( process.env.NODE_ENV === "dev" || process.env.NODE_ENV === "expo" ) {
  console.log( "Start local mode" );
  config.prod = false;
  config.server_url = "http://127.0.0.1";
  config.app_url = "localhost/voiders/";
  config.db_url = "mongodb://127.0.0.1:27017/voiders";
}

config.BLOCKS = [ 0, 18 ] // list of ids of stuff that block the player
config.TILES = {
  0: {
    id                  : 0,
    textId              : "void",
    type                : "void",
    sheetIds            : [ "void" ],
    craftable: false
  },
  1: {
    id                  : 1,
    textId              : "dirt",
    compatibleTilesTypes: [ "dirt", "grass", "rock", "sand", "hill" ],
    type                : "dirt",
    sheetIds            : [ "dirt-1", "dirt-2", "dirt-3", "dirt-4" ],
    spawns              : [
      // { type: "o", rate: 50, ids: [ "tree-1", "tree-2" ] }
      { type: "r", rate: 0.03, id: "sand-castle" }
      ,{ type: "r", rate: 0.05, id: "rock-golem" }
      ,{ type: "r", rate: 0.1, id: "dirt-blob" }
    ]
  }
  , 2: {
    id                  : 2,
    textId              : "grass",
    compatibleTilesTypes: [ "dirt", "grass", "forest", "rock", "meadow", "fields", "hill" ],
    type                : "grass",
    sheetIds            : [ "grass-1", "grass-2", "grass-3", "grass-4" ],
    spawns              : [
      // { type: "o", rate: 50, ids: [ "tree-1", "tree-2" ] }
      { type: "r", rate: 0.01, id: "forest-spirit" }
      ,{ type: "r", rate: 0.05, id: "grass-statue" }
      // ,{ type: "r", rate: 2500, id: "meadow-flower" }
      // ,{ type: "r", rate: 2500, id: "fields-scarecrow" }
    ],
    // WIP should be used to make a beautiful connection between tiles
    connectors: {
      dirt: {
        surrounded: [ "tile-5" ]
        ,NE       : [ "tile-12" ]
        ,NW       : [ "tile-14" ]
        ,SW       : [ "tile-15", "tile-10" ]
        ,SE       : []
        ,outS     : [ "tile-16" ]
        ,inN      : []
      }
    }
  }
  , 3: {
    id                  : 3,
    textId              : "forest",
    compatibleTilesTypes: [ "forest", "grass", "magic-forest", "meadow" ],
    type                : "forest",
    checkRadius         : 2,
    sheetIds            : [ "forest-1", "forest-2", "forest-3", "forest-4" ],
    spawns: [
    // lower rate first
      { type: "r", rate: 0.01, id: "lantern-tree" }
      ,{ type: "r", rate: 0.05, id: "forest-spirit" }
      ,{ type: "o", rate: 0.1, ids: [ "tree-1", "tree-2" ] }
      // ,{ type: "o", rate: 50, ids: [ "bush-1", "bush-2" ] }
    ]
  }
  , 4: {
    id                  : 4,
    textId              : "magic-forest",
    compatibleTilesTypes: [ "forest", "magic-forest" ],
    type                : "magic-forest",
    checkRadius         : 8,
    sheetIds            : [ "magic-forest-1", "magic-forest-2", "magic-forest-3", "magic-forest-4" ],
    spawns              : [
      { type: "r", rate: 0.01, id: "forest-spirit" }
      ,{ type: "r", rate: 0.05, id: "lantern-tree" }
      // ,{ type: "o", rate: 0.1, ids: [ "magic-tree-1", "magic-tree-2" ] }
    ]
  }
  , 5: {
    id                  : 5,
    textId              : "sand",
    compatibleTilesTypes: [ "sand", "dirt", "rock", "sea" ],
    type                : "sand",
    checkRadius         : 2,
    sheetIds            : [ "sand-1", "sand-2", "sand-3", "sand-4" ],
    spawns              : [
      { type: "r", rate: 0.05, id: "sand-castle" }
      // ,{ type: "r", rate: 0.01, id: "sea-dragon" }
    ]
  }
  , 6: {
    id                  : 6,
    textId              : "rock",
    compatibleTilesTypes: [ "sand", "dirt", "rock", "sea", "grass" ],
    type                : "rock",
    checkRadius         : 1,
    sheetIds            : [ "rock-1", "rock-2", "rock-3", "rock-4" ],
    spawns              : [
      { type: "r", rate: 0.05, id: "rock-golem" }
    ]
  }
  , 7: {
    id                  : 7,
    textId              : "sea",
    compatibleTilesTypes: [ "sea", "sand", "rock" ],
    type                : "sea",
    checkRadius         : 4,
    sheetIds            : [ "sea-1", "sea-2", "sea-3", "sea-4" ],
    spawns              : [
      // { type: "r", rate: 0.025, id: "sea-dragon" }
    ]
  }
  , 8: {
    id                  : 8,
    textId              : "meadow",
    compatibleTilesTypes: [ "meadow", "grass", "fields", "hill", "mountain", "forest" ],
    type                : "meadow",
    checkRadius         : 5,
    sheetIds            : [ "meadow-1", "meadow-2", "meadow-3", "meadow-4" ],
    spawns              : [
      // { type: "r", rate: 0.03, id: "fields-scarecrow" }
      // { type: "r", rate: 0.05, id: "meadow-flower" }
      // { type: "o", rate: 0.1, id: "bunch-flowers" }
    ]
  }
  , 9: {
    id                  : 9,
    textId              : "fields",
    compatibleTilesTypes: [ "fields", "grass", "meadow" ],
    type                : "fields",
    checkRadius         : 4,
    sheetIds            : [ "fields-1", "fields-2", "fields-3", "fields-4" ],
    spawns              : [
      // ,{ type: "r", rate: 0.03, id: "meadow-flower" }
      // { type: "r", rate: 0.05, id: "fields-scarecrow" }
      // { type: "o", rate: 0.1, id: "fields-plantation" }
    ]
  }
  , 10: {
    id                  : 10,
    textId              : "hill",
    compatibleTilesTypes: [ "hill", "grass", "dirt", "meadow", "mountain", "rock" ],
    type                : "hill",
    checkRadius         : 4,
    sheetIds            : [ "hill-1", "hill-2", "hill-3", "hill-4" ],
    spawns              : [
      // { type: "r", rate: 0.05, id: "hill-well" }
    ]
  }
};

config.WORLD_DATA = [];

config.WORLD_OBJECTS = [];

config.WORLD_RESOURCES_SPOTS = {
  1: { id: 1, resId: "dirt-blob", x: 30, y: 10, energy: 20 },
  2: { id: 2, resId: "grass-statue", x: 30, y: 10, energy: 20 },
  3: { id: 3, resId: "lantern-tree", x: 40, y: 40, energy: 10 }
};

config.RESOURCES_SPOTS = {
  "dirt-blob": {
    rendererOpts  : { sheetId: "dirt-blob", y: -150, x: 0 },
    maxEnergy     : 20,
    reloadInterval: 5000,
    dropEvery     : 1,
    minimumDrop   : 1,
    extraLuckDrop : 1,
    drop          : "dirt-block",
    colliderRadius: 250,
    dropOffsets   : [ [ 0, -100 ], [ -25, -110 ], [ 25, -110 ] ]
  },
  
  "grass-statue": {
    rendererOpts  : { sheetId: "grass-statue", y: -110, x: 0 },
    maxEnergy     : 20,
    reloadInterval: 5000,
    dropEvery     : 1,
    minimumDrop   : 1,
    extraLuckDrop : 1,
    drop          : "grass-seed",
    colliderRadius: 150,
    dropOffsets   : [ [ 0, -100 ], [ -25, -110 ], [ 25, -110 ] ]
  },
  
  "forest-spirit": {
    rendererOpts  : { sheetId: "forest-spirit", y: -300, x: 0 },
    maxEnergy     : 20,
    reloadInterval: 5000,
    dropEvery     : 1,
    minimumDrop   : 1,
    extraLuckDrop : 1,
    drop          : "forest-branch",
    colliderRadius: 350,
    dropOffsets   : [ [ 0, -100 ], [ -25, -110 ], [ 25, -110 ] ]
  },
  
  "lantern-tree": {
    rendererOpts  : { sheetId: "lantern-tree", y: -110, x: 30 },
    maxEnergy     : 10,
    reloadInterval: 10000,
    dropEvery     : 2,
    minimumDrop   : 0,
    extraLuckDrop : 1,
    drop          : "magic-blob",
    colliderRadius: 95,
    dropOffsets   : [ [ 70, -220 ], [ -60, -180 ], [ 50, -180 ] ]
  },
  
  "sand-castle": {
    rendererOpts  : { sheetId: "sand-castle", y: -110, x: 0 },
    maxEnergy     : 20,
    reloadInterval: 5000,
    dropEvery     : 1,
    minimumDrop   : 1,
    extraLuckDrop : 1,
    drop          : "sand-sample",
    colliderRadius: 150,
    dropOffsets   : [ [ 0, -100 ], [ -25, -110 ], [ 25, -110 ] ]
  },
  
  "rock-golem": {
    rendererOpts  : { sheetId: "rock-golem", y: -250, x: 0 },
    maxEnergy     : 20,
    reloadInterval: 5000,
    dropEvery     : 1,
    minimumDrop   : 1,
    extraLuckDrop : 1,
    drop          : "rock-gem",
    colliderRadius: 300,
    dropOffsets   : [ [ 0, -100 ], [ -25, -110 ], [ 25, -110 ] ]
  },
  
  "sea-dragon": {
    rendererOpts  : { sheetId: "sea-dragon", y: -110, x: 0 },
    maxEnergy     : 20,
    reloadInterval: 5000,
    dropEvery     : 1,
    minimumDrop   : 1,
    extraLuckDrop : 1,
    drop          : "sea-dragon-shell",
    colliderRadius: 110,
    dropOffsets   : [ [ 0, -100 ], [ -25, -110 ], [ 25, -110 ] ]
  },
  
  "meadow-flower": {
    rendererOpts  : { sheetId: "meadow-flower", y: -110, x: 30 },
    maxEnergy     : 10,
    reloadInterval: 10000,
    dropEvery     : 2,
    minimumDrop   : 0,
    extraLuckDrop : 1,
    drop          : "flower-petal",
    colliderRadius: 95,
    dropOffsets   : [ [ 70, -220 ], [ -60, -180 ], [ 50, -180 ] ]
  },
  
  "fields-scarecrow": {
    rendererOpts  : { sheetId: "fields-scarecrow", y: -110, x: 0 },
    maxEnergy     : 20,
    reloadInterval: 5000,
    dropEvery     : 1,
    minimumDrop   : 1,
    extraLuckDrop : 1,
    drop          : "ears-wheat",
    colliderRadius: 110,
    dropOffsets   : [ [ 0, -100 ], [ -25, -110 ], [ 25, -110 ] ]
  },
  
  "hill-well": {
    rendererOpts  : { sheetId: "hill-well", y: -110, x: 0 },
    maxEnergy     : 20,
    reloadInterval: 5000,
    dropEvery     : 1,
    minimumDrop   : 1,
    extraLuckDrop : 1,
    drop          : "hill-root",
    colliderRadius: 110,
    dropOffsets   : [ [ 0, -100 ], [ -25, -110 ], [ 25, -110 ] ]
  },
};

config.RESOURCES = {
  "dirt-block": {
    id: "dirt-block",
    types: [ "dirt", "sand", "rock" ],
    sheetId: "dirt-block"
  },
  "grass-seed": {
    id: "grass-seed",
    types: [ "grass", "flower" ],
    sheetId: "grass-seed"
  },
  "forest-branch": {
    id: "forest-branch",
    types: [ "forest", "tree" ],
    sheetId: "forest-branch"
  },
  "magic-blob": {
    id: "magic-blob",
    types: [ "magic", "blob" ],
    sheetId: "magic-blob"
  },
  "sand-sample": {
    id: "sand-sample",
    types: [ "sand", "glass" ],
    sheetId: "sand-sample"
  },
  "rock-gem": {
    id: "rock-gem",
    types: [ "rock", "gem", "diamond" ],
    sheetId: "rock-gem"
  },
  "sea-dragon-shell": {
    id: "sea-dragon-shell",
    types: [ "water", "shell", "dragon" ],
    sheetId: "sea-dragon-shell"
  },
  "flower-petal": {
    id: "flower-petal",
    types: [ "flower", "plant" ],
    sheetId: "flower-petal"
  },
  "ears-wheat": {
    id: "ears-wheat",
    types: [ "corn", "flower", "plant" ],
    sheetId: "ears-wheat"
  },
  "hill-root": {
    id: "hill-root",
    types: [ "rock", "gem'" ],
    sheetId: "hill-root"
  },
}

config.ENV_OBJECTS = {
  "house-1": {
    rendererOpts: { spriteName: "house-1", y: -100 }
  }
  , "shop": {
    rendererOpts: { spriteName: "shop", y: -100 }
  }
  , "tree-1": {
    rendererOpts: { spriteName: "tree-1", y: -80 }
  }
  , "tree-2": {
    rendererOpts: { spriteName: "tree-2", y: -80 }
  }
  , "altar": {
    tag              : "altar"
    ,rendererOpts    : { spriteName: "altar" }
    ,canInteract     : true
    ,triggeredMessage: "open-craft"
    ,colliderRadius  : 70
  }
  , "wall-x": {
    rendererOpts: { sheetId: "wall-x", y: -70 }
    ,simpleCollision: true
  }
  , "wall-y": {
    rendererOpts: { sheetId: "wall-y", y: -70 }
    ,simpleCollision: true
  }
  , "wall-c-N": {
    rendererOpts: { sheetId: "wall-c-N", y: -70 }
    ,simpleCollision: true
  }
  , "wall-c-E": {
    rendererOpts: { sheetId: "wall-c-E", y: -70 }
    ,simpleCollision: true
  }
  , "wall-c-W": {
    rendererOpts: { sheetId: "wall-c-W", y: -70 }
    ,simpleCollision: true
  }
  , "wall-c-S": {
    rendererOpts: { sheetId: "wall-c-S", y: -70 }
    ,simpleCollision: true
  }
  , "wall-end-NW": {
    rendererOpts: { sheetId: "wall-end-NW", y: -70 }
    ,simpleCollision: true
  }
  , "wall-end-SE": {
    rendererOpts: { sheetId: "wall-end-SE", y: -70 }
    ,simpleCollision: true
  }
  , "wall-end-NE": {
    rendererOpts: { sheetId: "wall-end-NE", y: -70 }
    ,simpleCollision: true
  }
  , "wall-end-SW": {
    rendererOpts: { sheetId: "wall-end-SW", y: -70 }
    ,simpleCollision: true
  }
};

config.RECIPES = {
  "dirt": {
    tileCreated: 1,
    possibilities: [ [ "dirt" ], [ "dirt" ], [ "dirt" ], [ "dirt" ], [ "dirt" ], [ "dirt" ] ]
  },
  "grass": {
    tileCreated: 2,
    possibilities: [ [ "grass" ], [ "grass" ], [ "grass" ], [ "grass" ], [ "grass" ], [ "grass" ] ]
  },
  "forest": {
    tileCreated: 3,
    possibilities: [ [ "forest" ], [ "forest" ], [ "forest" ], [ "grass" ], [ "grass" ], [ "grass" ] ]
  },
  "magic-forest": {
    tileCreated: 4,
    possibilities: [ [ "forest" ], [ "magic" ], [ "forest" ], [ "magic" ], [ "dirt" ], [ "magic" ] ]
  },
  "sand": {
    tileCreated: 5,
    possibilities: [ [ "sand" ], [ "sand" ], [ "sand" ], [ "dirt" ], [ "dirt" ], [ "dirt" ] ]
  },
  "rock": {
    tileCreated: 6,
    possibilities: [ [ "rock" ], [ "rock" ], [ "rock" ], [ "dirt" ], [ "sand" ], [ "dirt" ] ]
  },
  "sea": {
    tileCreated: 7,
    possibilities: [ [ "water" ], [ "diamond" ], [ "water" ], [ "sand" ], [ "dirt" ], [ "sand" ] ]
  },
  "meadow": {
    tileCreated: 8,
    possibilities: [ [ "flower" ], [ "flower" ], [ "flower" ], [ "grass" ], [ "plant" ], [ "grass" ] ]
  },
  "hill": {
    tileCreated: 9,
    possibilities: [ [ "grass" ], [ "grass" ], [ "grass" ], [ "rock" ], [ "gem" ], [ "rock" ] ]
  }
}

// for ( var i = 0; i < config.WORLD_OBJECTS.length; ++i )
// {
//   config.WORLD_OBJECTS[ i ].x += 1000;
//   config.WORLD_OBJECTS[ i ].y += 1000;
// }
// for ( var i in config.WORLD_RESOURCES_SPOTS )
// {
//   config.WORLD_RESOURCES_SPOTS[ i ].x += 1000;
//   config.WORLD_RESOURCES_SPOTS[ i ].y += 1000;
//   config.WORLD_RESOURCES_SPOTS[ i ].lastRegen = Date.now();
// }


module.exports = config;