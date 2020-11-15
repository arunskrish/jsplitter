/**
 * @Author: arunkri
 * @Date:   2020-02-05T20:51:54-08:00
 * @Last modified by:   arunkri
 * @Last modified time: 2020-11-15T14:42:19-08:00
 */
(function( $ ) {
    $.fn.jSplitter = function(opts) {
        var body = $('body')

        var defaultSettings    = {
            leftdiv         : null,
            rightdiv        : null,
            cookie          : 'jsplitter',
            flex            : false,
            minleftwidth    : 0,
            maxleftwidth    : 20000,
            persist         : false
        }
        var settings = $.extend({}, defaultSettings, opts)

        /*******************************************************
         Loop through all matching elements and initialise
         splitter on them
        ********************************************************/
        return this.each(function(index) {
            var divider = this
            var leftdiv = $('#'+ settings['leftdiv'])
            var rightdiv = $('#'+ settings['rightdiv'])

            // Cookie based on splitter div id.
            settings['cookie'] = settings['cookie'] + '_' + $(divider).attr('id')

            var dividerwidth = $(divider).width()

            // Check if user-select can be disabled during dragging.
            var disableLeftUserSel = true
            var disableRightUserSel = true
            if ($(leftdiv).css('user-select') == 'none' ||
                $(leftdiv).css('-webkit-user-select') == 'none') {
                disableLeftUserSel = false
            }
            if ($(rightdiv).css('user-select') == 'none' ||
                $(rightdiv).css('-webkit-user-select') == 'none') {
                disableRightUserSel = false
            }

            // Set drag cursor on divider
            $(divider).css('cursor', 'col-resize')

            // console.log($(leftdiv).height())
            var initWidths = function() {
                // If divider is not visible, no dragging. If applied for website navbar,
                // if divider is also hidden for small screen, we won't initialize dragging.
                if (! $(divider).is(":visible")){
                    // console.log("Divider is not visible")
                    $(rightdiv).css('margin-left', '0px')
                    return
                } else {
                    // If drag position can persist, load previously stored width.
                    if (settings['persist'] && localStorage.getItem(settings['cookie']) != null) {
                        var width = parseInt(localStorage.getItem(settings['cookie']))
                        if (settings['flex']) {
                            $(leftdiv).css('flex', '0 0 '+width+'px')
                        } else {
                            $(leftdiv).width(width)
                            $(divider).css('margin-left', width + "px")
                            $(rightdiv).css('margin-left', width+dividerwidth + "px")
                        }

                    } else {
                        // For non-flex, initialize right div margin to left div width.
                        if (! settings['flex']) {
                            var width = $(leftdiv).width()
                            $(divider).css('margin-left', width + "px")
                            $(rightdiv).css('margin-left', width+dividerwidth + "px")
                        }
                    }
                }
            }
            initWidths()

            var currentWidth = $(leftdiv).width()
            var maxWidth = $(leftdiv).css('max-width')
            var minWidth = $(leftdiv).css('min-width')
            console.log('Min/Max - '+maxWidth + ", "+minWidth)
            var startPos = 0

            var startSplitMouse = function(evt) {
                // console.log("from startSplitMouse" + evt["pageX"])
                $(document).bind("mousemove", doSplitMouse)
                           .bind("mouseup", endSplitMouse);

                // Disable selection if needed. If not, text will get selected
                // when mouse is dragged.
                if (disableLeftUserSel) {
                    $(leftdiv).css('user-select', 'none')
                    $(leftdiv).css('-webkit-user-select', 'none')
                }
                if (disableRightUserSel) {
                    $(rightdiv).css('user-select', 'none')
                    $(rightdiv).css('-webkit-user-select', 'none')
                }

                startPos = evt["pageX"]
                // console.log("Got mouse down")
            }
            function doSplitMouse(evt) {
                // console.log("from doSplitMouse " + evt["pageX"])
                var pos = evt["pageX"]
                var diff = pos - startPos

                var newWidth = currentWidth + diff
                if (newWidth > settings['maxleftwidth'] ||
                    newWidth < settings['minleftwidth']) {
                    return
                }
                var splitterMargin = newWidth
                var rightdivMargin = newWidth + dividerwidth

                // console.log("Setting width, margins "+newWidth+", "+splitterMargin+", "+rightdivMargin)
                if (settings['flex']) {
                    $(leftdiv).css('flex', '0 0 '+newWidth+'px')
                } else {
                    $(leftdiv).css('width', newWidth + "px")
                    $(divider).css('margin-left', splitterMargin + "px")
                    $(rightdiv).css('margin-left', rightdivMargin + "px")
                }
            }
            function endSplitMouse(evt) {
                // console.log("from endSplitMouse " + evt["pageX"])
                currentWidth = $(leftdiv).width()
                startPos = 0

                if (settings['persist']) {
                    localStorage.setItem(settings['cookie'], currentWidth);
                }

                // Enable selection if needed.
                if (disableLeftUserSel) {
                    $(leftdiv).css('user-select', '')
                    $(leftdiv).css('-webkit-user-select', '')
                }
                if (disableRightUserSel) {
                    $(rightdiv).css('user-select', '')
                    $(rightdiv).css('-webkit-user-select', '')
                }

                // Unbind mouse events.
                $(document)
				.unbind("mousemove", doSplitMouse)
				.unbind("mouseup", endSplitMouse);
            }

            $(divider).bind("mousedown", startSplitMouse);

            // If window is resized, re-initialize widths.
            $( window ).resize(function() {
                initWidths()
            })
        })
    }
}( jQuery ));
