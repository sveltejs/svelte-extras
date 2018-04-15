# svelte-extras

Extra methods for [Svelte](https://svelte.technology) components.

## Usage

Install with npm or yarn...

```bash
npm install --save svelte-extras
```

...then add to your component methods:

```html
<input bind:value='newTodo'>
<button on:click='push("todos", newTodo)'>add todo</button>

<ul>
  {{#each todos as todo, i}}
    <li>
      <button on:click='splice("todos", i, 1)'>x</button>
      {{todo}}
    </li>
  {{/each}}
</ul>

<script>
  import { push, splice } from 'svelte-extras';

  export default {
    data: function () {
      return {
        newTodo: '',
        todos: ['add some more todos']
      };
    },

    methods: {
      push,
      splice
    }
  };
</script>
```

## Available methods

### Array methods ([live demo](https://svelte.technology/repl?gist=66bb8372ed59124c3568c26a2b39dce2))

* push
* pop
* shift
* unshift
* splice
* sort
* reverse

These all work exactly as their `Array.prototype` counterparts, except that the first argument must be the *keypath* that points to the array. The following are all examples of keypaths:

```js
component.push('todos', 'finish writing this documentation');
component.push('foo.bar.baz', 42);
component.push('rows[4]', cell);
```

### tween(key, end, options?) ([live demo](https://svelte.technology/repl?gist=996cc5446b4f12d0708d2d1fca9f53b6))

Smoothly tweens `key` from its current value to the `end` value. Numerical values (and non-cyclical objects and arrays, as long as their leaf properties are numerical) are automatically interpolated, or you can supply a custom function.

The available options (and default values) are:

* **delay** (0) — the delay in milliseconds before the tween starts
* **duration** (400) — the duration of the tween
* **easing** (x => x) — which easing function to use (see e.g. [eases-jsnext](https://github.com/rollup/eases-jsnext)))
* **interpolate** (see above) — a function that generators a custom interpolator, for e.g. transitioning strings representing colors. Must take arguments `a` and `b` and return a function that takes a value `t` between 0 and 1

This method returns a promise with an additional `abort` method. The tween will be aborted automatically if `key` is updated separately, either by a second tween or via `component.set(...)`. The promise will not resolve if the tween is aborted.

### spring(key, end, options) ([live demo](https://svelte.technology/repl?version=1.38.0&gist=0afd4fc40944a544330ab03ee71f3649))

Similar to `tween`, except it uses a spring physics simulation rather than a pre-defined easing curve, which gives more natural results in some situations. The `end` value can be anything you could pass to `tween`.

The following options must be provided:

* **stiffness** — the *spring constant*, a value between 0 and 1
* **damping** — the *damping coefficient*, again between 0 and 1

Figuring out the optimal combination of stiffness and damping typically takes a bit of trial and error. The higher the stiffness, the quicker the motion will be; the lower the damping, the 'springier' it will be.

This method returns a promise that resolves when the simulation is complete — or not at all, if the simulation is aborted by another call to `spring(...)` or a call to `set(...)`.


### observe(key, callback, options?)

Runs the `callback` function with two arguments, `newValue` and `oldValue`, every time the value of `key` changes. `options` can contain two booleans — `init`, which determines whether to fire the callback immediately (the default) instead of waiting for a change, and `defer`, which determines whether the callback fires before or after the DOM has updated.

This method used to be built in to Svelte; it's now recommended that you use the `onstate` and `onupdated` lifecycle hooks instead.


### observeDeep(keypath, callback, options?) ([live demo](https://svelte.technology/repl?gist=94f68745adb18799030ef4c732c9774d))

Exactly the same as `observe` method, except that it observes nested properties of objects and arrays, rather than the objects themselves. The `keypath` option is a string like `foo.bar` (observe the `bar` property of the `foo` object) or `baz[0]` (observe the first member of the `baz` array).


### observeMany(keys, callback, options?) ([live demo](https://svelte.technology/repl?gist=9194723c88b6f3ddcc79a6ed07cc5f1e))

Observes multiple keys, without firing multiple times when they change simultaneously. `keys` is an array of keys, while the callback receives two arguments — an array of the new values corresponding to those keys, and an array of the old values. `options` can include `init` and `defer`, like the built-in `observe` method.


### getDeep(keypath) ([live demo](https://svelte.technology/repl?gist=42b551d60f971f953468a2142cfb25f3))

Similar to the built-in `get` method, except that it gets nested properties of objects and arrays, rather than the objects themselves. The `keypath` option is a string like `foo.bar` (get the `bar` property of the `foo` object) or `baz[0]` (get the first member of the `baz` array).


### setDeep(keypath, value) ([live demo](https://svelte.technology/repl?gist=e33d01f9796341992101d8c23070eb76))

Similar to the built-in `set` method, except that it sets nested properties of objects and arrays, rather than the objects themselves. The `keypath` option is a string like `foo.bar` (set the `bar` property of the `foo` object) or `baz[0]` (set the first member of the `baz` array).


## Tree-shaking

If you're using a module bundler that supports tree-shaking, such as [Rollup](https://rollupjs.org), only the methods your components use will be included in your app.


## Universal module definition

If you *really* need it, a UMD build is available at [svelte-extras/dist/svelte-extras.umd.js](https://unpkg.com/svelte-extras/dist/svelte-extras.umd.js), and will register itself as `svelte.extras`. We recommend using a module bundler instead, however.


## License

[MIT](LICENSE)
