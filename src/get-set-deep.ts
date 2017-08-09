import { Component } from './interfaces';

function getDeep( this:Component, keypath:string ) {
  if ( keypath === undefined ) { 
    return this.get(); 
  }
  
  const keys = keypath.split( '.' );
  let value = this.get( keys[0] );
  for ( let i = 1; i < keys.length; i++ ) {
    value = value[ keys[i] ];
  }
  return value;
}

function setDeep( this:Component, keypath:string, value:any ) {
  if ( keypath === undefined ) { return; }
  
  const keys = keypath.split( '.' );
  const lastKey = keys.pop();
  
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
