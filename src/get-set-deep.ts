import { Component } from './interfaces';

function getDeep( this:Component, keypath:string ) {
  if ( keypath === undefined ) { 
    return this.get(); 
  }
  
  const keys = keypath.replace( /\[(\d+)\]/g, '.$1' ).split( '.' );
  let value = this.get( keys[0] );
  for ( let i = 1; i < keys.length; i++ ) {
    value = value[ keys[i] ];
  }
  return value;
}

function setDeep( this:Component, keypath:string, value:any ) {
  if ( keypath === undefined ) { return; }
  
  const keys = keypath.replace( /\[(\d+)\]/g, '.$1' ).split( '.' );
  const lastKey = keys.pop();
	
	if ( keys[0] === undefined ) { 
		const data:any = {};
		data[ lastKey ] = value;
		this.set( data );
		return;
	}
  
  let object = this.get( keys[0] );
  for ( let i = 1; i < keys.length; i++ ) {
    object = object[ keys[i] ];
  }
  object[ lastKey ] = value;

  const data:any = {};
  data[ keys[0] ] = this.get( keys[0] );
  this.set( data );
}

export { getDeep, setDeep };
