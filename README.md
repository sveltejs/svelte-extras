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

## Tree-shaking

If you're using a module bundler that supports tree-shaking, such as [Rollup](https://rollupjs.org), only the methods your components use will be included in your app.


## Universal module definition

If you *really* need it, a UMD build is available at [svelte-extras/dist/svelte-extras.umd.js](https://unpkg.com/svelte-extras/dist/svelte-extras.js), and will register itself as `svelte.extras`. We recommend using a module bundler instead, however.


## License

[MIT](LICENSE)