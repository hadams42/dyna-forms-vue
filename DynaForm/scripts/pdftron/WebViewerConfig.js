var myDocViewer = null;

//=========================================================
// Add buttons to the toolbar
//=========================================================

function AddButtonsToToolbar() {
    //var rightAlignedElements = $('#control .right-aligned');
    var rightAlignedElements = $('#defaultMenuContext');
    var container = $('<a>').addClass('mobile-button').attr("data-transition","none");
    rightAlignedElements.append(container);
    
    var button = $('<span>').attr({
        'id': 'metadataButton',
        'class': 'glyphicons circle_info'
    })
    .on('click', function() {
        parent.window.history.replaceState( {} , "Metadata View", readerControl.docId );
        parent.window.location.reload(true);
    });
    container.append(button);
}

AddButtonsToToolbar();

//=========================================================
// Handle Events
//=========================================================

$(document).on('viewerLoaded', function(e) {
    $("#ui-id-2").css('display', 'none');
});

$(document).on('documentLoaded', function() {
    var docViewer = readerControl.docViewer;
    var doc = docViewer.getDocument();
});

var onError = ReaderControl.prototype.onError;
ReaderControl.prototype.onError = function(e, msg, userMessage) {
  if (userMessage.indexOf('Error retrieving file') > -1) {
    return;
  }
  onError.apply(this, arguments);
};


