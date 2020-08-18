var xodUrl = "";
var metadataUrl = "";
var loadViewer = function() {
  
        var type = "html5,html5Mobile";
        
        if (getQuery('type')) {
            type = getQuery('type');
        }

        var docType = getQuery('doctype') || 'xod';
        if (docType !== 'xod') {
        }

        $('#objectViewer').height($(window).height() - 350);
        $(window).resize(function () { $('#objectViewer').height($(window).height() - 350); });
        
        var viewerElement = document.getElementById('objectViewer');
        myWebViewer = new PDFTron.WebViewer({
            type: type,
            path: '/Scripts/pdftron', //URL path to the WebViewer root folder
            initialDoc : xodUrl,  //URL path to the document
            config: "/Scripts/pdftron/WebViewerConfig.js", 
            documentType: docType,
            l: 'Adventist Digital Library::W:AMS(20170719):1D7731F11F2754D0437302786F612FF5B756BD33D33C3BB454D57EF022DAB6F5C7',
            //documentId: metadataUrl,
            enableAnnotations: false,
            hideAnnotationPanel: true,
            mobileRedirect: true,
            streaming : false //set streaming to 'true' if your .xod server doesn't acknowledge byte-ranges
        }, viewerElement);

        var $viewerElement = $(viewerElement);

        $viewerElement.on('documentLoaded', function() {
          myWebViewer.setFitMode(PDFTron.WebViewer.FitMode.FitPage);
          myWebViewer.setLayoutMode(PDFTron.WebViewer.LayoutMode.Single );
        }); 

        // events must be bound using .on, not passed as options
        $viewerElement.on('ready', function(event) {
            // webviewer is ready. initialize GUI settings here, such as setShowSideWindow
            //$('#viewerType').html(myWebViewer.selectedType);

            if (myWebViewer.selectedType === "html5Mobile") {
                //the mobile viewer is optimized for cross-device support supports only a subset of features in WebViewer.js
                $('.no-mobile').hide();
                if (!myWebViewer.isMobileDevice()) {
                    $('#notes').append('<div style="color:red">Mobile device not detected.</div>')
                    .append('<div>Note: On mobile devices, this viewer is optimized to be displayed in the full device screen and is not compatible with WebViewer controls. ' +
                            'For the best mobile viewing experience, it is recommended that UI customizations be done directly on the mobile viewer.</div>');
                }
            } else {
                $('.no-mobile').show();
            }

            var toolModeValue = $('#toolModeValue');

            if (myWebViewer.selectedType === "html5") {
                $('#searchMode option[value!=None]').hide();
                if (!myWebViewer.options.enableAnnotations) {
                    toolModeValue.find('option[value*="Annotation"]').hide();
                }
            }
        });

        // listen to change events
        // $viewerElement.on('displayModeChanged layoutModeChanged zoomChanged pageChanged toolModeChanged', function(event, data) {
            // switch(event.type) {
                // case "displayModeChanged":
                // case "layoutModeChanged":
                    // $("#layoutModeValue").val(myWebViewer.getLayoutMode());
                    // break;
                // case "zoomChanged":
                    // $("#zoomLevelValue").val(myWebViewer.getZoomLevel());
                    // break;
                // case "pageChanged":
                    // $("#pageNumberValue").val( myWebViewer.getCurrentPageNumber());
                    // break;
                // case "toolModeChanged":
                    // $("#toolModeValue").val(myWebViewer.getToolMode());
                    // break;
            // }
        // });

        $viewerElement.on('documentLoaded', function(event) {
            //document loaded
            //initialize GUI options here, such as page number, zoom level
            //$("#pageNumberValue").val( myWebViewer.getCurrentPageNumber());
            //$("#pageCountValue").text(myWebViewer.getPageCount());
            //if(myWebViewer.selectedType !== "html5Mobile") {
            //    $("#zoomLevelValue").val(myWebViewer.getZoomLevel());
            //    $("#layoutModeValue").val(myWebViewer.getLayoutMode());
            //    $("#toolModeValue").val(myWebViewer.getToolMode());
            //}
            
            $("#object-display-container").css("visibility","visible");
            $("#object-display-loading").css("visibility","hidden");
                        
        });


    };

    var getQuery = function gqv(a) {
        var b = window.location.search.substring(1);
        var c = b.split("&");
        for (var d = 0; d < c.length; d++) {
            var e = c[d].split("=");
            if (e[0] == a) {
                return e[1];
            }
        }
        return null;
    };