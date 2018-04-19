# svelte-extras changelog

## 2.0.2

* Prevent double-firing of deferred `observeMany` if observer is added in `oncreate`

## 2.0.1

* Update for v2

## 2.0.0

* Add `observe` method, and reimplement `observeMany` and `observeDeep` ([#15](https://github.com/sveltejs/svelte-extras/issues/15))

## 1.6.0

* Add `observeMany` method ([#11](https://github.com/sveltejs/svelte-extras/pull/11))

## 1.5.3

* Preserve existing spring velocity when updating target ([#9](https://github.com/sveltejs/svelte-extras/issues/9))

## 1.5.2

* Only end springs on specific keys when data is set ([#8](https://github.com/sveltejs/svelte-extras/issues/8))

## 1.5.1

* Fix spring end threshold

## 1.5.0

* Add a `spring` method ([#7](https://github.com/sveltejs/svelte-extras/pull/7))

## 1.4.1

* Fix `setDeep` method when keypath is a non-nested data root key ([#5](https://github.com/sveltejs/svelte-extras/issues/5))

## 1.4.0

* Add `getDeep` and `setDeep` methods

## 1.3.0

* Add `observeDeep` method

## 1.2.0

* Interpolate dates

## 1.1.1

* Support custom interpolators with `tween`

## 1.1.0

* Add `tween` method

## 1.0.0

* Initial release
