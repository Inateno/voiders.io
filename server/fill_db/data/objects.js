var objects = [
  { "id":0, "oId":"wall-c-N", "x":5, "y":5 }
  ,{ "id":2, "oId":"wall-x", "x":9, "y":5 }
  ,{ "id":4, "oId":"wall-x", "x":13, "y":5 }
  ,{ "id":6, "oId":"wall-x", "x":17, "y":5 }
  ,{ "id":8, "oId":"wall-x", "x":21, "y":5 }
  ,{ "id":9, "oId":"wall-x", "x":25, "y":5 }
  ,{ "id":9, "oId":"wall-x", "x":29, "y":5 }
  ,{ "id":9, "oId":"wall-x", "x":33, "y":5 }
  ,{ "id":10, "oId":"wall-end-SE", "x":37, "y":5 }
  ,{ "id":11, "oId":"wall-end-NW", "x":48, "y":5 }
  ,{ "id":15, "oId":"wall-x", "x":52, "y":5 }
  ,{ "id":17, "oId":"wall-x", "x":56, "y":5 }
  ,{ "id":19, "oId":"wall-x", "x":60, "y":5 }
  ,{ "id":20, "oId":"wall-x", "x":64, "y":5 }
  ,{ "id":20, "oId":"wall-x", "x":68, "y":5 }
  ,{ "id":20, "oId":"wall-x", "x":72, "y":5 }
  ,{ "id":12, "oId":"wall-x", "x":76, "y":5 }
  ,{ "id":21, "oId":"wall-c-E", "x":80, "y":5 }
  ,{ "id":23, "oId":"wall-y", "x":80, "y":9 }
  ,{ "id":25, "oId":"wall-y", "x":80, "y":13 }
  ,{ "id":27, "oId":"wall-y", "x":80, "y":17 }
  ,{ "id":29, "oId":"wall-y", "x":80, "y":21 }
  ,{ "id":30, "oId":"wall-y", "x":80, "y":25 }
  ,{ "id":30, "oId":"wall-y", "x":80, "y":29 }
  ,{ "id":30, "oId":"wall-y", "x":80, "y":33 }
  ,{ "id":31, "oId":"wall-end-SW", "x":80, "y":37 }
  ,{ "id":32, "oId":"wall-end-NE", "x":80, "y":48 }
  ,{ "id":33, "oId":"wall-y", "x":80, "y":52 }
  ,{ "id":35, "oId":"wall-y", "x":80, "y":56 }
  ,{ "id":37, "oId":"wall-y", "x":80, "y":60 }
  ,{ "id":39, "oId":"wall-y", "x":80, "y":64 }
  ,{ "id":39, "oId":"wall-y", "x":80, "y":68 }
  ,{ "id":39, "oId":"wall-y", "x":80, "y":72 }
  ,{ "id":39, "oId":"wall-y", "x":80, "y":76 }
  ,{ "id":42, "oId":"wall-c-S", "x":80, "y":80 }
  ,{ "id":43, "oId":"wall-x", "x":76, "y":80 }
  ,{ "id":44, "oId":"wall-x", "x":72, "y":80 }
  ,{ "id":46, "oId":"wall-x", "x":68, "y":80 }
  ,{ "id":48, "oId":"wall-x", "x":64, "y":80 }
  ,{ "id":50, "oId":"wall-x", "x":60, "y":80 }
  ,{ "id":51, "oId":"wall-x", "x":56, "y":80 }
  ,{ "id":51, "oId":"wall-x", "x":52, "y":80 }
  ,{ "id":76, "oId":"wall-end-NW", "x":48, "y":80 }
  ,{ "id":53, "oId":"wall-end-SE", "x":37, "y":80 }
  ,{ "id":54, "oId":"wall-x", "x":33, "y":80 }
  ,{ "id":54, "oId":"wall-x", "x":29, "y":80 }
  ,{ "id":54, "oId":"wall-x", "x":25, "y":80 }
  ,{ "id":55, "oId":"wall-x", "x":21, "y":80 }
  ,{ "id":57, "oId":"wall-x", "x":17, "y":80 }
  ,{ "id":59, "oId":"wall-x", "x":13, "y":80 }
  ,{ "id":61, "oId":"wall-x", "x":9, "y":80 }
  ,{ "id":63, "oId":"wall-c-W", "x":5, "y":80 }
  ,{ "id":66, "oId":"wall-y", "x":5, "y":76 }
  ,{ "id":67, "oId":"wall-y", "x":5, "y":72 }
  ,{ "id":70, "oId":"wall-y", "x":5, "y":68 }
  ,{ "id":72, "oId":"wall-y", "x":5, "y":64 }
  ,{ "id":72, "oId":"wall-y", "x":5, "y":60 }
  ,{ "id":72, "oId":"wall-y", "x":5, "y":56 }
  ,{ "id":72, "oId":"wall-y", "x":5, "y":52 }
  ,{ "id":73, "oId":"wall-end-NE", "x":5, "y":48 }
  ,{ "id":74, "oId":"wall-end-SW", "x":5, "y":37 }
  ,{ "id":75, "oId":"wall-y", "x":5, "y":33 }
  ,{ "id":75, "oId":"wall-y", "x":5, "y":29 }
  ,{ "id":75, "oId":"wall-y", "x":5, "y":25 }
  ,{ "id":76, "oId":"wall-y", "x":5, "y":21 }
  ,{ "id":78, "oId":"wall-y", "x":5, "y":17 }
  ,{ "id":80, "oId":"wall-y", "x":5, "y":13 }
  ,{ "id":82, "oId":"wall-y", "x":5, "y":9 }
  
  ,{ "id":84, "oId":"house-1", "x":11, "y":13 }
  ,{ "id":85, "oId":"house-1", "x":11, "y":24 }
  ,{ "id":86, "oId":"tree-1", "x":53, "y":44 }
  ,{ "id":87, "oId":"tree-1", "x":53, "y":36 }
  ,{ "id":88, "oId":"tree-1", "x":27, "y":44 }
  ,{ "id":89, "oId":"tree-1", "x":27, "y":36 }
  
  ,{ "id":90, "oId":"tree-1", "x": 44, "y": 53 }
  ,{ "id":91, "oId":"tree-1", "x": 36, "y": 53 }
  ,{ "id":92, "oId":"tree-1", "x": 44, "y": 27 }
  ,{ "id":93, "oId":"tree-1", "x": 36, "y": 27 }
  // ,{ "id":86, "oId":"tree-2", "x":10, "y":32 }
  ,{ "id":94, "oId":"altar", "x": 8, "y": 50 }
  ,{ "id":95, "oId":"shop", "x": 50, "y": 11 }
];

module.exports = objects;