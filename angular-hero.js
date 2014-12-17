(function () {
'use strict';
    
angular.module('alAngularHero', ['ngAnimate'])
    .animation('.hero-transition', [function () {
            
        var _fromScreen, _toScreen, _doneList, _startTimer, _movingList;
            
        var enter = function enter(screen, done) {
            _toScreen = screen;
            _doneList.push(done);
            return tryStart();
        };
            
        var leave = function leave(screen, done) {
            _fromScreen = screen;
            _doneList.push(done);
                
            screen.addClass('hero-leave');
            return tryStart();
        };
            
        var tryStart = function tryStart() {
            if (!_fromScreen || !_toScreen) {
                // Allow time to get a second screen, or else cancel
                _startTimer = setTimeout(function () { finish(true); });
                return null;
            } else {
                if (_startTimer) clearTimeout(_startTimer);
                    
                // Both screens, so start now
                setTimeout(start);
                    
                // Return cancel function, which should only call clear once                
                var cancelled = false;
                return function () {
                    if (!cancelled) {
                        cancelled = true;
                        clear();
                    }
                };
            }
        };
            
        var start = function start() {
            // Get hero elements
            var fromHeros = _fromScreen[0].getElementsByClassName("hero");
            var toHeros = _toScreen[0].getElementsByClassName("hero");
                
            var pairs = [];
            for (var n = 0; n < fromHeros.length; n++) {
                for (var m = 0; m < toHeros.length; m++) {
                    if (fromHeros[n].getAttribute('hero-id') === toHeros[m].getAttribute('hero-id')) {
                        pairs.push({ from: fromHeros[n], to: toHeros[m] });
                    }
                }                    ;
            }                ;
                
            pairs.forEach(function (pair) {
                animateHero(angular.element(pair.from), angular.element(pair.to));
            });
                
            finish();
        };
            
        var animateHero = function animateHero(fromHero, toHero) {
            // Get the screen positions
            var fromRect = getScreenRect(fromHero, _fromScreen);
            var toRect = getScreenRect(toHero, _toScreen);
                
            // Clone and hide the source and target
            var moving = fromHero.clone();
            fromHero.css('visibility', 'hidden');
            toHero.css('visibility', 'hidden');
                
            // Move to parent at absolute position
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
                    handler.complete = true;
                    finish();
                },
                remove: function () {
                    toHero.css('visibility', '');
                        
                    // Unbind the event and remove the element
                    moving.unbind('transitionend', handler.onComplete);
                    moving.remove();
                }
            };
            _movingList.push(handler);
                
            setTimeout(function () {
                // Move to the new position (animated by css transition)
                moving.css({
                    transform: 'translate3d(' + (toRect.left - fromRect.left) + 'px, ' 
                        + (toRect.top - fromRect.top) + 'px, 0)',
                    width: toRect.width + 'px',
                    height: toRect.height + 'px'
                }).addClass('hero-animating-active');
                    
                moving.attr('class', toHero.attr('class') + ' hero-animating');
                    
                // Handle the event at the end of transition
                moving.bind('transitionend', handler.onComplete);
            }, 50);
        };
            
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
            
        var finish = function finish(cancelled) {
            // Check that all the moving elements are complete
            var allComplete = true;
            if (!cancelled) {
                _movingList.forEach(function (m) { allComplete = allComplete && m.complete; });
            }
                
            if (allComplete) {
                // Call done on both screens
                var doneCallbacks = _doneList.slice(0);
                clear();
                doneCallbacks.forEach(function (done) { done(); });
            }
        };
            
        var clear = function clear() {
            _fromScreen = null;
            _toScreen = null;
            _doneList = [];
                
            if (_movingList) _movingList.forEach(function (m) { m.remove(); });
            _movingList = [];
        };
        clear();
            
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
