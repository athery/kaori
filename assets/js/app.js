// Brunch automatically concatenates all files in your
// watched paths. Those paths can be configured at
// config.paths.watched in "brunch-config.js".
//
// However, those files will only be executed if
// explicitly imported. The only exception are files
// in vendor, which are never wrapped in imports and
// therefore are always executed.

// Import dependencies
//
// If you no longer want to use a dependency, remember
// to also remove its path from "config.paths.watched".
import "phoenix_html"

// Import local files
//
// Local files can be imported directly using relative
// paths "./socket" or full ones "web/static/js/socket".

// import socket from "./socket"

import "./blueimp-gallery.min"

$( document ).ready(function() {
  var $grid = $('#conception-gallery').masonry({
    itemSelector: '.grid-item',
    percentPosition: true,
    columnWidth: '.grid-sizer'
  });
  $grid.imagesLoaded().progress( function() {
    $grid.masonry();
  });

  $('a[data-toggle=pill]').each(function () {
    var $this = $(this);
    $this.on('shown.bs.tab', function () {
      var $pane = $('#' + $this.attr('aria-controls'));
      $pane.imagesLoaded( function () {
        $pane.masonry({
          itemSelector: '.grid-item',
          percentPosition: true,
          columnWidth: '.grid-sizer'
        });
      });
    });
  });

  function applyLiteBoxToGallery(selector) {
    document.getElementById(selector).onclick = function (event) {
        event = event || window.event;
        var target = event.target || event.srcElement,
            link = target.src ? target.parentNode : target,
            options = {index: link, event: event},
            links = this.getElementsByTagName('a');
        blueimp.Gallery(links, options);
    };
  }

  applyLiteBoxToGallery('conception-gallery');
  applyLiteBoxToGallery('creation-gallery');
  applyLiteBoxToGallery('entretien-gallery');

});
