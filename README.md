Angular-Hero
============

Create hero transitions with Angular, similar to those implemented by Google Polymer's [core-animated-pages](https://www.polymer-project.org/docs/elements/core-elements.html#core-animated-pages).

##Usage

1. Include `alAngularHero` as a dependency in your Angular app.

```js
angular.module('app', ['alAngularHero'])
```

2. Include the suppliers CSS file or add the content to your own.

3. Declare the page transitions to use on the `ng-view` element, including `hero-transition`:
```html
<div ng-view class="page-transition hero-transition"></div>
```
4. Identify hero elements with the `hero` class and `hero-id` attribute:
```html
<div class="name hero" hero-id="name">{{contact.name}}</div>
```

###Install via Bower

```
bower install angular-hero
```

