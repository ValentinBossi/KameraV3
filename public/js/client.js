var main = function() {

    ///////////////////////////////////////////////////////////////VARIABLEN////////////////////////////////////////////////////////////
    var auswerfenButtonParat = '<button title="Datenträger auswerfen" id="datentraegerAuswerfen" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; padding-bottom: ; padding-top:; background-color: #bc4b51;" class="btn btn-default" ><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-eject"></span><br>USB</button>';
    var auswerfenButtonBusy = '<button disabled="disabled" title="Datenträger auswerfen" id="datentraegerAuswerfen" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; padding-bottom: ; padding-top:; background-color: #bc4b51;" class="btn btn-default"><div align="center" class="loader"></div></button>';
    var auswerfenButtonDisabled = '<button disabled="disabled" title="Datenträger auswerfen" id="datentraegerAuswerfen" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; padding-bottom: ; padding-top:; background-color: #bc4b51;" class="btn btn-default" ><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-eject"></span><br>USB</button>';
    var kopierenButtonParat = '<button title="Medien auf Datenträger speichern" id="aufDatentraegerSpeichern" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color:#f4e285;" class="btn btn-default" id="aufUsbSpeichern"><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-save"></span><br>Speichern</button>';
    var kopierenButtonBusy = '<button disabled="disabled" title="Medien auf Datenträger speichern" id="aufDatentraegerSpeichern" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color:#f4e285;" class="btn btn-default" id="aufUsbSpeichern" ><div style="vertical-align:middle;" class="loader"></div></button>';
    var kopierenButtonDisabled = '<button disabled="disabled" title="Medien auf Datenträger speichern" id="aufDatentraegerSpeichern" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color:#f4e285;" class="btn btn-default" id="aufUsbSpeichern"><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-save"></span><br>Speichern</button>';
    var videoButtonParat = '<button title="Video aufnehmen" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; margin-bottom: ; margin-top: ; margin-left: 100px; background-color: #f4a259;" id="videoMachen" class="btn btn-default"><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-facetime-video"></span></button>';
    var videoButtonBusy = '<button disabled="disabled" title="Video aufnehmen" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; margin-bottom: ; margin-top: ; margin-left: 100px; background-color: #f4a259;" id="videoMachen" class="btn btn-default"><div align="center" class="loader"></div></button>';
    var videoButtonDisabled = '<button disabled="disabled" title="Video aufnehmen" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; margin-bottom: ; margin-top: ; margin-left: 100px; background-color: #f4a259;" id="videoMachen" class="btn btn-default"><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-facetime-video"></span></button>';
    var fotoButtonParat = '<button title="Foto aufnehmen" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; margin-bottom: ; background-color: #f4a259;" id="fotoMachen" class="btn btn-default"><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-camera"></span></button>';
    var fotoButtonBusy = '<button disabled="disabled" title="Foto aufnehmen" title="Foto schliessen" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; margin-bottom: ; background-color: #f4a259;" id="fotoMachen" class="btn btn-default"><div align="center" class="loader"></div></button>';
    var fotoButtonDisabled = '<button disabled="disabled" title="Foto aufnehmen" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; margin-bottom: ; background-color: #f4a259;" id="fotoMachen" class="btn btn-default"><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-camera"></span></button>';

    var medienOrdnerInhalt = [];

    var systemStatus = {
        usbOK: false,
        kameraOK: true,
        fotoMachen: false,
        videoMachen: false,
        kopieren: false,
        medien: medienOrdnerInhalt
    };
    var auswerfenButton = {
        state: auswerfenButtonDisabled
    };

    var videoButton = {
        state: videoButtonDisabled
    };

    var kopierenButton = {
        state: kopierenButtonDisabled
    };

    var fotoButton = {
        state: fotoButtonDisabled
    };

    ////////////////////////////////////////////////INITIAL-FUNKTIONEN//////////////////////////////////////////////////////////////////

    //io.connect('/'); '/' heisst von dem server, mit dem man die Webseite bzw client.js hat! ist also generisch!
    var socket = io.connect('/');

    var statusCheck = function() {
        socket.emit('status');
    };

    socket.on('status', function(ServersystemStatus) {
        systemStatus = ServersystemStatus;
        console.log(systemStatus);
        console.log("dann keine fotos anzeigen!");
        if (systemStatus.medien.length == 0){
        	$("#letzterTable").html('<h3 id="keineFotos" align="center"">Keine Fotos!</h3>');
        	$("#aufDatentraegerSpeichern").replaceWith(kopierenButtonDisabled);
        	aufDatentraegerSpeichern();
        }
        console.log("systemStatus bei status socket on ",systemStatus);
    });

    var download = function() {
        $("[name='download']").each(function() {
            console.log("each download");
            $(this).on('click' ,function() {
                top.location.href = $(this).attr("href");
            });
        });
    };

    var loeschen = function() {
            $("[name='loeschen']").each(function() {
                $(this).on('click',function() {
                    var picture = this.getAttribute("data");
                    $(this).html('<div style="vertical-align:middle;" class="loader"></div>');
                    socket.emit('bildLoeschen', picture);
                });
                //console.log("jquery löschen ausgeführt");
            });
        }
        //socket.on muss ausserhalb sein, siehe OneNote Log
    socket.on('bildLoeschen', function(bild) {
    	var stringArray = bild.split(".");
    	var bildTr = "tr"+stringArray[0];
        $("#"+bildTr).remove();
        console.log("bild tr",bildTr);
        console.log("bild",bild);
        console.log("sollte systemStatus check machen und dann keine fotos anzeigen!");
        statusCheck();
        loeschen();
    });

    /////////////////////////////////////////////////////////DIVERSE-FUNKTIONEN/////////////////////////////////////////////////////////

    //var erstelleKopierGallerie = function ()
    /**
	$("img+div").each(function () {
		pictures.push({
			"name": this.textContent
		});
	});**/

    var aufSpeicherListeBildHinzufuegen = function(bild) {
        console.log(bild);
        var stringArray = bild.split(".");
        bild = stringArray[0];
        var html = '<tr id="speichernTr' + bild + '"><td><div id="slide' + bild + '"><div id="loader' + bild + '" class="loaderKopieren"></div><p>' + bild + '</p></div></td></tr>';
        $("#bilderZumSpeichern").append(html);
    };

    //button = auswerfenButton zbsp
    var pressButton = function(button) {
        if (button == auswerfenButton) {
            auswerfenButton.state = auswerfenButtonBusy;
            videoButton.state = videoButtonDisabled;
            kopierenButton.state = kopierenButtonDisabled;
            fotoButton.state = fotoButtonDisabled;
        }
        if (button == videoButton) {
            videoButton.state = videoButtonBusy;
            kopierenButton.state = kopierenButtonDisabled;
            fotoButton.state = fotoButtonDisabled;
            auswerfenButton.state = auswerfenButtonDisabled;
        }
        if (button == kopierenButton) {
            kopierenButton.state = kopierenButtonBusy;
            fotoButton.state = fotoButtonDisabled;
            auswerfenButton.state = auswerfenButtonDisabled;
            videoButton.state = videoButtonDisabled;
        }
        if (button == fotoButton) {
            fotoButton.state = fotoButtonBusy;
            auswerfenButton.state = auswerfenButtonDisabled;
            videoButton.state = videoButtonDisabled;
            kopierenButton.state = kopierenButtonDisabled;
        }
        toggleButtons();
    };

    //callback rerender jquery click methoden! (löschen, download, die 4 menuebuttons)
    var toggleButtons = function() {
        $("#datentraegerAuswerfen").replaceWith(auswerfenButton.state);
        $("#videoMachen").replaceWith(videoButton.state);
        $("#aufDatentraegerSpeichern").replaceWith(kopierenButton.state);
        $("#fotoMachen").replaceWith(fotoButton.state);
        runCheck();
    };

    var releaseButton = function(button) {

        if (button == auswerfenButton) {
            auswerfenButton.state = systemStatus.usbOK ? auswerfenButtonParat : auswerfenButtonDisabled;
            videoButton.state = videoButtonParat;
            kopierenButton.state = systemStatus.usbOK ? kopierenButtonParat : kopierenButtonDisabled;
            fotoButton.state = fotoButtonParat;
        }
        if (button == videoButton) {
            videoButton.state = videoButtonParat;
            kopierenButton.state = systemStatus.usbOK ? kopierenButtonParat : kopierenButtonDisabled;
            fotoButton.state = fotoButtonParat;
            auswerfenButton.state = systemStatus.usbOK ? auswerfenButtonParat : auswerfenButtonDisabled;
        }
        if (button == kopierenButton) {
            console.log(kopierenButton);
            kopierenButton.state = systemStatus.usbOK ? kopierenButtonParat : kopierenButtonDisabled;
            fotoButton.state = fotoButtonParat;
            auswerfenButton.state = systemStatus.usbOK ? auswerfenButtonParat : auswerfenButtonDisabled;
            videoButton.state = videoButtonParat;
        }
        if (button == fotoButton) {
            videoButton.state = videoButtonParat;
            kopierenButton.state = systemStatus.usbOK ? kopierenButtonParat : kopierenButtonDisabled;
            fotoButton.state = fotoButtonParat;
            auswerfenButton.state = systemStatus.usbOK ? auswerfenButtonParat : auswerfenButtonDisabled;
        }
        toggleButtons();
    };

    //////////////////////////////////////////HAUPTAKTIONEN////////////////////////////////////////////////////////////////////////
    /**
    var videoMachen = function() {
        //jquery...click usw
    };**/

    var aufDatentraegerSpeichern = function() {
        $("#aufDatentraegerSpeichern").on('click',function() {
            statusCheck();
            pressButton(kopierenButton);
            socket.emit('kopieren', "start");
            for (var i = 0; i < systemStatus.medien.length; i++) {
                aufSpeicherListeBildHinzufuegen(systemStatus.medien[i].name);
            }
            $("#speichernPanel").slideDown(300);
        });
    };
    //socket.on muss ausserhalb sein, siehe OneNote Log
    socket.on('kopieren', function(bild) {
        if (bild == "ende") {
            releaseButton(kopierenButton);
        } else {
            console.log("kopiertes bild ", bild);
            console.log(bild.length);
            console.log('#loader' + bild)
            console.log($('#loader' + bild));
            var stringArray = bild.split(".");
            bild = stringArray[0];
            var html = '<span style="font-size:2.5em; float: left;" class="glyphicon glyphicon-ok"></span>';
            $("#loader" + bild).replaceWith(html);
            setTimeout(function() {
                $("#slide" + bild).slideUp(400, function(bild) {
                    $("#speichernTr" + bild).remove();
                });
            }, 500);
        }
    });

    var datentraegerAuswerfen = function() {
            $("#datentraegerAuswerfen").on('click',function() {
                pressButton(auswerfenButton);
                socket.emit('datentraegerAuswerfen');
            });
        }
        //socket.on muss ausserhalb sein, siehe OneNote Log
    socket.on('datentraegerAuswerfen', function(data) {
        systemStatus.usbOK = data;
        console.log(data);
        releaseButton(auswerfenButton);
    });

    var fotoMachen = function() {
        $('#fotoMachen').on('click',function() {
            pressButton(fotoButton);
            socket.emit('fotoMachen');
        });
    };
    //socket.on muss ausserhalb sein, siehe OneNote Log
    socket.on('fotoMachen', function(bild) {
    	var stringArray = bild.split(".");
    	var bildTr = "tr"+stringArray[0];
        var html = '<tr id="'+bildTr+'"><td style="border: 2px solid black;"><img align="center" src="pictures/'+bild+'" style="width: 100%;">'+
        '<div align="center" style="background-color: black; color: white; padding-top: 5px; padding-bottom: 5px;">'+bild+'</div>'+
        '<div align="center" style="margin-top: 10px; margin-bottom: 20px;">'+
        '<button title="Löschen" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color:#bc4b51; margin-right: 10px;" class="btn btn-default" name="loeschen" data="'+bild+'"><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-trash"></span></button>'+
        '<button title="Download" name="download" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color:#f4e285;" type="button" class="btn btn-default" href="'+bild+'"><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-cloud-download"></span></button>'+
        '</div></td></tr>';
        $("#letzterTable").prepend(html);
        $("#keineFotos").remove();
        releaseButton(fotoButton);
    });

    var runCheck = function() {
        statusCheck();
        download();
        fotoMachen();
        //videoMachen();
        aufDatentraegerSpeichern();
        datentraegerAuswerfen();
        loeschen();
    };
    runCheck();
}
$(document).ready(main);
