 var main = function() {

     var socket = io.connect('/');

     var systemStatusClient;

     var datentraegerAuswerfen = function() {
         $("#datentraegerAuswerfen").on('click', function() {
            socket.emit('datentraegerAuswerfen', "soll auswerfen");
            systemStatusClient.buttons[0].state = "busy";
            systemStatusClient.buttons[1].state = "disabled";
            systemStatusClient.buttons[2].state = "disabled";
            systemStatusClient.buttons[3].state = "disabled";
            appCheck(systemStatusClient);
         });
     };
     datentraegerAuswerfen();
     socket.on('datentraegerAuswerfen', function(systemStatusServer) {
         systemStatusClient = systemStatusServer;
         appCheck(systemStatusClient);
     });

     var videoMachen = function() {
         $("#videoMachen").on('click', function() {
             if (systemStatusClient.amVideoMachen) {
                socket.emit('videoMachen', "stop");
                clearInterval(interval);
                systemStatusClient.buttons[1].state = "busy";
                appCheck(systemStatusClient);
                activateLoeschen();
             } else {
                startTimer();
                socket.emit('videoMachen', "start");
                systemStatusClient.buttons[0].state = "disabled";
                systemStatusClient.buttons[1].state = "recording";
                systemStatusClient.buttons[2].state = "disabled";
                systemStatusClient.buttons[3].state = "disabled";
                appCheck(systemStatusClient);
                disableLoeschen();
             }
         });
     };
     videoMachen();
     socket.on('videoMachen', function(systemStatusServer) {
         systemStatusClient = systemStatusServer;
         console.log(systemStatusClient);
         if(!systemStatusClient.amVideoMachen){
            mediumHinzufuegen(systemStatusClient.gemachtesMedium);
            appCheck(systemStatusClient);
         }
     });

     var aufDatentraegerSpeichern = function() {
         $("#aufDatentraegerSpeichern").on('click', function() {
            socket.emit('aufDatentraegerSpeichern', "sollte kopieren");
            systemStatusClient.buttons[0].state = "disabled";
            systemStatusClient.buttons[1].state = "disabled";
            systemStatusClient.buttons[2].state = "busy";
            systemStatusClient.buttons[3].state = "disabled";
            appCheck(systemStatusClient);
            disableLoeschen();
             for (var i = 0; i < systemStatusClient.medien.length; i++) {
                 aufSpeicherListeBildHinzufuegen(systemStatusClient.medien[i].name);
             }
             $("#speichernPanel").slideDown(500);
         });
     };
     aufDatentraegerSpeichern();
     socket.on('aufDatentraegerSpeichern', function(systemStatusServer) {
         systemStatusClient = systemStatusServer;
         activateLoeschen();
         if (systemStatusClient.amKopieren) {
             speicherIconAendern(systemStatusClient.kopiertesMedium);
         } else {
             speicherIconAendern(systemStatusClient.kopiertesMedium);
             setTimeout(function() {
                 $("#speichernPanel").slideUp(500, function() {
                     for (var i = 0; i < systemStatusClient.medien.length; i++) {
                         aufSpeicherListeBildLoeschen(systemStatusClient.medien[i].name);
                     }
                 });
             }, 500);
         }
         appCheck(systemStatusClient);
     });

     var fotoMachen = function() {
         $("#fotoMachen").on('click', function() {
             socket.emit('fotoMachen', "sollte foto machen");
             systemStatusClient.buttons[0].state = "disabled";
             systemStatusClient.buttons[1].state = "disabled";
             systemStatusClient.buttons[2].state = "disabled";
             systemStatusClient.buttons[3].state = "busy";
             appCheck(systemStatusClient);
         });
     };
     fotoMachen();
     socket.on('fotoMachen', function(systemStatusServer) {
         systemStatusClient = systemStatusServer;
         mediumHinzufuegen(systemStatusClient.gemachtesMedium);
         appCheck(systemStatusClient);
     });

     var loeschen = function() {
         $("[name='loeschen']").each(function() {
             console.log("each loeschen");
             $(this).on('click', function() {
                 var picture = this.getAttribute("data");
                 $(this).html('<div style="vertical-align:middle;" class="loader"></div>');
                 socket.emit('bildLoeschen', picture);
             });
         });
     }
     loeschen();
     socket.on('bildLoeschen', function(systemStatusServer) {
         //console.log(systemStatusServer);
         systemStatusClient = systemStatusServer;
         appCheck(systemStatusClient);
         var fileName = systemStatusClient.geloeschtesBild.split(".");
         var image = fileName[0];
         var suffix = fileName[1];
         $("#" + image + "\\." + suffix).remove();
     });

     var download = function() {
         $("[name='download']").each(function() {
             console.log("each download");
             $(this).on('click', function() {
                 top.location.href = $(this).attr("href");
             });
         });
     };
     download();

     var appCheck = function(systemStatusClient) {
        systemStatusClient.buttons.forEach(function(button){
            fotosInfo();
            if (systemStatusClient.fotoModus) {
                $(".switch :checkbox").prop('checked', false);
            } else {
                $(".switch :checkbox").prop('checked', true);
            }
            if(button.state === "disabled"){
                $("#"+button.name).attr('disabled', true);
                if(button.name === "datentraegerAuswerfen"){
                    $("#"+button.name).html('<span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-eject"></span><br>USB');
                }
                if(button.name === "videoMachen"){
                    $("#"+button.name).html('<span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-facetime-video"></span>');
                }
                if(button.name === "aufDatentraegerSpeichern"){
                    $("#"+button.name).html('<span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-save"></span><br>Speichern');
                }
                if(button.name === "fotoMachen"){
                    $("#"+button.name).html('<span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-camera"></span>');
                }
            }
            if(button.state === "busy"){
                $("#"+button.name).attr('disabled', true);
                $("#"+button.name).html('<div style="vertical-align:middle;" class="loader"></div>');
            }
            if(button.state === "ready"){
                $("#"+button.name).attr('disabled', false);
                if(button.name === "datentraegerAuswerfen"){
                    $("#"+button.name).html('<span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-eject"></span><br>USB');
                }
                if(button.name === "videoMachen"){
                    $("#switchButton").attr('disabled', false);
                    $("#"+button.name).html('<span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-facetime-video"></span>');
                }
                if(button.name === "aufDatentraegerSpeichern"){
                    $("#"+button.name).html('<span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-save"></span><br>Speichern');
                }
                if(button.name === "fotoMachen"){
                    $("#"+button.name).html('<span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-camera"></span>');
                }
            }
            if(button.state === "recording"){
                $("#switchButton").attr('disabled', true);
                $("#"+button.name).html('<span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-record"></span>');
            }
        });
        loeschen();
        download();
     };

     var aufSpeicherListeBildHinzufuegen = function(bild) {
         var html = '<tr id="speichernTr' + bild + '"><td><div id="loader' + bild + '" class="loaderKopieren"></div><p>' + bild + '</p></td></tr>';
         $("#bilderZumSpeichern").append(html);
     };

     var aufSpeicherListeBildLoeschen = function(bild) {
         var array = bild.split(".");
         var image = array[0];
         var suffix = array[1];
         $("#speichernTr" + image + "\\." + suffix).remove();
     };

     var speicherIconAendern = function(bild) {
         var array = bild.split(".");
         var image = array[0];
         var suffix = array[1];
         $("#loader" + image + "\\." + suffix).replaceWith('<span style="font-size:2.5em; float: left;" class="glyphicon glyphicon-ok"></span>');
     };

     var mediumHinzufuegen = function(medium) {
         var video = '<video width="100%" controls><source src="pictures/' + medium + '" type="video/mp4">Your browser does not support HTML5 video.</video>';
         var bild = '<img src="pictures/' + medium + '" style="width: 100%;" align="middle">';
         var med = medium.includes("mp4") ? video : bild;
         $("#letzterTable").prepend('<tr id="' + medium + '"><td style="border: 2px solid black;">' +
             med +
             '<div style="background-color: black; color: white; padding-top: 5px; padding-bottom: 5px;" align="center">' + medium + '</div><div style="margin-top: 10px; margin-bottom: 20px;" align="center">' +
             '<button title="Löschen" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color:#bc4b51; margin-right: 10px;" class="btn btn-default" name="loeschen" data="' + medium + '">' +
             '<span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-trash">' +
             '</span></button><button title="Download" name="download" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color:#f4e285;" type="button" class="btn btn-default" href="' + medium + '">' +
             '<span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-cloud-download"></span></button></div></td></tr>');
     };

     $('.switch :checkbox').click(function() {
         if (!systemStatusClient.amVideoMachen && !systemStatusClient.amFotoMachen) {
             if ($(this).is(':checked')) {
                socket.emit('kameraModus', "video");
                systemStatusClient.buttons[0].state = "disabled";
                systemStatusClient.buttons[1].state = "busy";
                systemStatusClient.buttons[2].state = "disabled";
                systemStatusClient.buttons[3].state = "busy";
                appCheck(systemStatusClient);
             } else {
                socket.emit('kameraModus', "foto");
                systemStatusClient.buttons[0].state = "disabled";
                systemStatusClient.buttons[1].state = "busy";
                systemStatusClient.buttons[2].state = "disabled";
                systemStatusClient.buttons[3].state = "busy";
                appCheck(systemStatusClient);
             }
         }
     });
     socket.on('kameraModus', function(systemStatusServer) {
         systemStatusClient = systemStatusServer;
         if(systemStatusClient.videoModus){
            setTimeout(function(){
                appCheck(systemStatusClient);
            }, 1500);
         } else {
            appCheck(systemStatusClient);
         }
     });

     $("[name='download']").each(function() {
             console.log("each download");
             $(this).on('click', function() {
                 top.location.href = $(this).attr("href");
             });
         });

     $("#ausschalten").on('click', function() {
        socket.emit('ausschalten');
        $("#body").html('<h1>Kamera wird ausgeschaltet...</h1>');
    });

     var systemState = function() {
         socket.emit('status');
     };
     systemState();
     socket.on('status', function(systemStatusServer) {
         //console.log(systemStatusServer);
         systemStatusClient = systemStatusServer;
         appCheck(systemStatusClient);
     });
     var interval;
     var startTimer = function() {
         var counter = 1;
         var minuten = 0;
         var nullMin = "0";
         var sekunden = 1;
         var nullSek = "0";
         /**
         if (sekunden != undefined && minuten != undefined) {
             sekunden = setSekunden;
             minuten = setMinuten;
             counter = setSekunden + (60 * setMinuten);
         }**/
         interval = setInterval(function() {
             if (counter == 120) {
                 clearInterval(interval);
             }
             sekunden = sekunden < 10 ? nullSek + sekunden : (sekunden % 60);
             sekunden = sekunden == 0 ? "00" : sekunden;
             $("#counter").html(nullMin + minuten + ":" + sekunden);
             sekunden++;
             counter++
             if ((sekunden % 60) == 0) {
                 minuten++;
             }
         }, 1000);
     };

     var fotosInfo = function() {
         if (systemStatusClient.hatMedien) {
             $("#keineMedien").css('display', 'none');
         } else {
             $("#keineMedien").css('display', 'block');
         }
     };
     
     var disableLoeschen = function() {
         $("[name='loeschen']").each(function() {
             $(this).attr("disabled", true);
         });
     };

     var activateLoeschen = function() {
         $("[name='loeschen']").each(function() {
             $(this).attr("disabled", false);
         });
     };
 }
 $(document).ready(main);
