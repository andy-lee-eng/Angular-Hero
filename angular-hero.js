(function () {
'use strict';
    
angular.module('alAngularHero', ['ngAnimate'])
    .animation('.hero-transition', [function () {
            
        var _fromScreen, _toScreen, _doneList, _startTimer, _movingList;
            
        // Capture the screen that is transitioning in
        var enter = function enter(screen, done) {
            _toScreen = screen;
            _doneList.push(done);
            return tryStart();
        };
            
        // Capture the screen that is transitioning out
        var leave = function leave(screen, done) {
            _fromScreen = screen;
            _doneList.push(done);
            
            screen.addClass('hero-leave');
            return tryStart();
        };
        
        // If we have both screens then trigger the transition
        var tryStart = function tryStart() {
            if (!_fromScreen || !_toScreen) {
                // Allow time to get a second screen, or else cancel
                _startTimer = setTimeout(function () { finish(true); });
                return null;
            } else {
                if (_startTimer) clearTimeout(_startTimer);
                    
                // Both screens, so start now
                setTimeout(start);
                    
                // Return a cancel function, which should only call clear once                
                var cancelled = false;
                return function () {
                    if (!cancelled) {
                        cancelled = true;
                        clear();
                    }
                };
            }
        };
            
        // Start the hero transitions
        var start = function start() {
            // Get hero elements from both screens
            var fromHeros = _fromScreen[0].getElementsByClassName("hero");
            var toHeros = _toScreen[0].getElementsByClassName("hero");
               
            // Find all the matching pairs
            var pairs = [];
            for (var n = 0; n < fromHeros.length; n++) {
                for (var m = 0; m < toHeros.length; m++) {
                    if (fromHeros[n].getAttribute('hero-id') === toHeros[m].getAttribute('hero-id')) {
                        pairs.push({ from: fromHeros[n], to: toHeros[m] });
                    }
                }
            }

            // Trigger the animation for each pair
            pairs.forEach(function (pair) {
                animateHero(angular.element(pair.from), angular.element(pair.to));
            });
            
            finish();
        };
        
        // Animate a hero element from one position to another
        var animateHero = function animateHero(fromHero, toHero) {
            // Get the screen positions
            var fromRect = getScreenRect(fromHero, _fromScreen);
                
            // Clone and hide the source and target elements
            var moving = fromHero.clone();
            fromHero.css('visibility', 'hidden');
            toHero.css('visibility', 'hidden');
                
            // Move outside the screen element and apply animation css
            _fromScreen.parent().append(moving);
            moving.css({
                top: fromRect.top + 'px',
                left: fromRect.left + 'px',
                width: fromRect.width + 'px',
                height: fromRect.height + 'px',
                margin: '0'
            }).addClass('hero-animating');
                
            // Setup the event handler for the end of the transition
            var handler = {
                complete: false,
                onComplete: function () {
                    // Allows us to track which animations have finished
                    handler.complete = true;
                    finish();
                },
                remove: function () {
                    // Show the original target element
                    toHero.css('visibility', '');

                    // Unbind the event handler and remove the element
                    moving.unbind('transitionend', handler.onComplete);
                    moving.remove();
                }
            };
            _movingList.push(handler);

            // Delay here allows the DOM to update before starting
            setTimeout(function () {
                var toRect = getScreenRect(toHero, _toScreen);
                // Move to the new position (animated by css transition)
                var transform = 'translate3d(' + (toRect.left - fromRect.left) + 'px, '
                        + (toRect.top - fromRect.top) + 'px, 0)';
                moving.css({
                    '-webkit-transform': transform,
                    transform: transform,
                    width: toRect.width + 'px',
                    height: toRect.height + 'px'
                }).addClass('hero-animating-active');

                // Switch the animating element to the target's classes,
                // which allows us to animate other properties like color,
                // border, corners, etc.
                moving.attr('class', toHero.attr('class') + ' hero-animating');

                // Handle the event at the end of transition
                moving.bind('transitionend', handler.onComplete);
            }, 50);
        };
        
        // Get the current screen position and size of an element
        var getScreenRect = function getScreenRect(element, screen) {
            var elementRect = element[0].getBoundingClientRect();
            var screenRect = screen[0].getBoundingClientRect();
                
            return {
                top: elementRect.top - screenRect.top,
                left: elementRect.left - screenRect.left,
                width: elementRect.width,
                height: elementRect.height
            };
        };
        
        // Finish up if all elements have finished animating
        var finish = function finish(cancelled) {
            // Check that all the moving elements are complete
            var allComplete = true;
            if (!cancelled) {
                _movingList.forEach(function (m) { allComplete = allComplete && m.complete; });
            }
                
            if (allComplete) {
                // Call "done" on both screens (which may call "clear" so clone the array)
                var doneCallbacks = _doneList.slice(0);
                doneCallbacks.forEach(function (done) { done(); });
                // Make sure we've cleared for the next time
                clear();
            }
        };
        
        // Clear everything down and initialise for next time
        var clear = function clear() {
            _fromScreen = null;
            _toScreen = null;
            _doneList = [];
                
            // Call remove for each animating hero element
            if (_movingList) _movingList.forEach(function (m) { m.remove(); });
            _movingList = [];
        };
        clear();
        
        // Definition of the AngularJS animation
        return {
            enter: function (element, done) {
                return enter(element, done);
            },
            leave: function (element, done) {
                return leave(element, done);
            }
        };
    }]);
})();
