/**
 * @author Inateno / http://inateno.com / http://dreamirl.com
 */

/**
 * @constructor SheetRenderer
 * @augments Renderer
 * @class draw a sprite<br>
 * if the given sprite is animated, it'll animate it automatically according to you imagesDatas file<br>
 * checkout Renderer for standard parameters
 * @example var ship = new DE.GameObject( {
 *   x: 500, y: 500,
 *   renderer: new DE.SheetRenderer( { "spriteName": "ship", "scale": 0.7, "offsetY": -30 } )
 * } );
 */
// define( [ 'PIXI', 'DE.ImageManager', 'DE.CONFIG', 'DE.Time', 'DE.Event', 'DE.BaseRenderer' ],
// function( PIXI, ImageManager, CONFIG, Time, Event, BaseRenderer )
define( [ 'DREAM_ENGINE' ],
function( DE )
{
  var PIXI = DE.PIXI;
  var ImageManager = DE.ImageManager;
  var CONFIG = DE.CONFIG;
  var Time = DE.Time;
  var Event = DE.Event;
  var BaseRenderer = DE.BaseRenderer;
  var SpriteRenderer = DE.SpriteRenderer;
  function SheetRenderer( frameId, params )
  {
    var _params = params || {};
    this.frameId = frameId || undefined;
    
    if ( !PIXI.utils.TextureCache[ frameId ] )
      throw new Error( 'The frameId "' + frameId + '" does not exist in the texture cache ' + this );
    
    PIXI.Sprite.call( this, PIXI.utils.TextureCache[ frameId ] );
    BaseRenderer.instantiate( this, params );
  }
  
  SheetRenderer.prototype = Object.create( PIXI.Sprite.prototype );
  SheetRenderer.prototype.constructor = SheetRenderer;
  SheetRenderer.prototype.DEName      = "SheetRenderer";
  
  BaseRenderer.inherits( SheetRenderer );
  Object.defineProperties( SheetRenderer.prototype, {
  } );
  
  SheetRenderer.prototype.setTint = SpriteRenderer.prototype.setTint;
  SheetRenderer.prototype.setHue = SpriteRenderer.prototype.setHue;
  SheetRenderer.prototype.setSaturation = SpriteRenderer.prototype.setSaturation;
  SheetRenderer.prototype.setBrightness = SpriteRenderer.prototype.setBrightness;
  SheetRenderer.prototype.setContrast = SpriteRenderer.prototype.setContrast;
  SheetRenderer.prototype.setGreyscale = SpriteRenderer.prototype.setGreyscale;
  SheetRenderer.prototype.setBlackAndWhite = SpriteRenderer.prototype.setBlackAndWhite;
  
  // TODO
  /**
   * @public
   * @memberOf SheetRenderer
   * @type {Int}
   */
  // SheetRenderer.prototype.changeFrame = function( frameId, params )
  // {
  //   params = params || {};
  //   this.uncenter();
  //   this.frameId = frameId;
  //   if ( !PIXI.utils.TextureCache[ frameId ] )
  //     throw new Error( 'The frameId "' + frameId + '" does not exist in the texture cache ' + this );
    
  //   // PIXI.Sprite.call( this, PIXI.utils.TextureCache[ frameId ] );
    
  //   if ( !this.spriteName )
  //     throw new Error( "SheetRenderer :: No spriteName defined -- declaration canceled" );
    
  //   if ( this.gameObject )
  //     this.center();
  // };
  
  return SheetRenderer;
} );