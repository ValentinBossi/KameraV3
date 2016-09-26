var express = require("express");
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var morgan = require("morgan");
var path = require("path");
var exec = require('child_process').exec;
var fs = require('fs');
//var spawn = require('child_process').spawn;
const events = require("events");
var emitter = new events.EventEmitter();

var foto;
var video;

//app.use(express.static(path.resolve(__dirname, "/public")));

app.use('/', express.static(__dirname + '/public'));

var medienOrdnerInhalt = [];
var picToCopyString;
var gesicherteMedien = [];
var zuKopierendeMedien;

var buttons = [{
    "name": "datentraegerAuswerfen",
    "state": "disabled"
}, {
    "name": "videoMachen",
    "state": "disabled"
}, {
    "name": "aufDatentraegerSpeichern",
    "state": "disabled"
}, {
    "name": "fotoMachen",
    "state": "disabled"
}];

var systemStatus = {
    buttons: buttons,
    usbOK: false,
    hatMedien: false,
    kameraOK: true,
    amFotoMachen: false,
    amVideoMachen: false,
    amKopieren: false,
    medien: medienOrdnerInhalt,
    geloeschtesBild: "leer",
    kopiertesMedium: "leer",
    gemachtesMedium: "leer",
    videoModus: false,
    fotoModus: true
};

var validateButtons = function(state) {
    switch (state) {
        case "amKopieren":
            buttons[0].state = "disabled";
            buttons[1].state = "disabled";
            buttons[2].state = "busy";
            buttons[3].state = "disabled";
            break;
        case "amFotoMachen":
            buttons[0].state = "disabled";
            buttons[1].state = "disabled";
            buttons[2].state = "disabled";
            buttons[3].state = "busy";
            break;
        case "amVideoMachen":
            buttons[0].state = "disabled";
            buttons[1].state = "recording";
            buttons[2].state = "disabled";
            buttons[3].state = "disabled";
            break;
        case "keinUSB":
            buttons[0].state = "disabled";
            buttons[1].state = systemStatus.fotoModus ? "disabled" : "ready";
            buttons[2].state = "disabled";
            buttons[3].state = systemStatus.videoModus ? "disabled" : "ready";
            break;
        case "keineMedien":
            buttons[0].state = systemStatus.usbOK ? auswerfenButtonParat : "disabled";
            buttons[1].state = systemStatus.fotoModus ? "disabled" : "ready";
            buttons[2].state = "disabled";
            buttons[3].state = systemStatus.videoModus ? "disabled" : "ready";
            break;
        case "OK":
            buttons[0].state = systemStatus.usbOK ? "ready" : "disabled";
            buttons[1].state = systemStatus.fotoModus ? "disabled" : "ready";
            buttons[2].state = systemStatus.usbOK && systemStatus.hatMedien ? "ready" : "disabled";
            buttons[3].state = systemStatus.videoModus ? "disabled" : "ready";
            break;
    }
};

// pi '/home/pi/git/Kamera/public/pictures/'
// OSX '/Users/bossival/git/Kamera/public/pictures/'
const pathToMediaFolder = '/home/pi/git/Kamera/public/pictures/';
var arrayOfPictures;
var objectOfPicturesArray = [];
const usbStick = "/media/usb0";

//Makes this entries array available in all views
app.locals.systemStatus = systemStatus;

// argumente noch optimieren!!!
var fotoArgs = ["-t", "0", "-k", "-o", pathToMediaFolder + "bild.jpg", "-v", "-rot", "180", "-h", "2464", "-w", "3280"];
//var videoArgs = ["-t", "0", "-fps", "301", "-k", "-i", "pause", "-o", pathToMediaFolder + "video.h264", "-v", "-rot", "180", "-p", "0,0,1640,1232", "-h", "1232", "-w", "1640" ];
/**
var kameraModus = function(modus) {
    console.log("kameraModus modus", modus);
    if (modus === "foto") {
        if(video != undefined){
            video.kill();
        }
        foto = spawn('raspistill', fotoArgs);
        systemStatus.fotoModus = true;
        systemStatus.videoModus = false;
        validateButtons("OK");
    }
    if (modus === "video") {
        if(foto != undefined){
            foto.kill();
        }
        video = spawn('python3', ['video.py'], {cwd: pathToMediaFolder});
        eventOut(video);
        eventErr(video);
        eventEnd(video);
        console.log("sollte raspivid starten!");
        systemStatus.videoModus = true;
        systemStatus.fotoModus = false;
        validateButtons("OK");
    }
};
kameraModus("foto");**/

var eventOut = function(modus){
    modus.stdout.on('data', function(data){
        var medium = data.toString();
        console.log("gemachtes Medium ", medium);
        emitter.emit("mediumErstellt", medium);
    });
};

var eventErr = function(modus){
    modus.stderr.on('data', function(data){
    });
};

var eventEnd = function(modus){
    modus.stdout.on('end', function(){
        console.log("python-video-script beendet!");
    });
};

// OSX 'diskutil list | grep "FAT32"'
// pi 'mount | grep "vfat"'
var usbCheck = function() {
    exec('diskutil list | grep "FAT32"', function(error, stdout, stderr) {
        if (stdout.length > 0) {
            systemStatus.usbOK = true;
        } else {
            systemStatus.usbOK = false;
        }
        //console.log('stdout ' + stdout);
        //console.log('stderr ' + stderr);
        if (error !== null) {
            console.log('exec error mount: ' + error);
            systemStatus.usbOK = false;
        }
    });
}
usbCheck();

var zeitstempel = function() {
    full = new Date();
    sekunde = full.getSeconds();
    minute = full.getMinutes();
    stunde = full.getHours();
    jahr = full.getFullYear();
    monat = full.getMonth() + 1;
    tag = full.getDate();
    return jahr + "_" + monat + "_" + tag + "_" + stunde + "_" + minute + "_" + sekunde;
};

app.set("view engine", "ejs");

app.set("views", path.resolve(__dirname, "views"));

/**
app.use(bodyParser.urlencoded({
    extended: false
}));**/

app.use(morgan("short"));

io.on('connection', function(client) {

    console.log('Kamera connected...');
    //console.log(client.id);
    //console.log(io.sockets.clients().connected);

    //Video machen
    client.on('videoMachen', function(data) {
        if (data === "start") {
            video.stdin.write("r");
            systemStatus.amVideoMachen = true;
            validateButtons("amVideoMachen");
            client.emit('videoMachen', systemStatus);
        }
        if (data === "stop") {
            video.stdin.write("r");
            emitter.once("mediumErstellt", function(medium) {
                if(medium.startsWith("v")){
                    systemStatus.amVideoMachen = false;
                    systemStatus.hatMedien = true;
                    validateButtons("OK");
                    systemStatus.gemachtesMedium = medium;
                    medienOrdnerInhalt.push({
                        name: medium
                    });
                    console.log("medienOrdnerInhalt nach video: ", medienOrdnerInhalt);
                    client.emit('videoMachen', systemStatus);
                }
            });
        }
    });

    client.on('kameraModus', function(modus) {
        if(modus === "foto"){
            console.log("killed video");
            kameraModus(modus);
        }
        if(modus === "video"){
            console.log("killed foto");
            kameraModus(modus);
        }
        client.emit('kameraModus', systemStatus);
    });

    //OK
    //Bild loeschen
    client.on('bildLoeschen', function(bild) {
        console.log("bild zum loeschen: ", bild);
        var pathToPicture = pathToMediaFolder + bild;
        exec('rm -rf ' + pathToPicture, function(error, stdout, stderr) {
            console.log('stdout ' + stdout);
            console.log('stderr ' + stderr);
            if (error !== null) {
                console.log('exec error rm: ' + error);
            } else {
                console.log("Bild wurde gelöscht: ", bild);
                fs.readdir(pathToMediaFolder, function(err, list) {
                    medienOrdnerInhalt = [];
                    list.filter(mediaFilter).forEach(function(pic) {
                        medienOrdnerInhalt.push({
                            name: pic
                        });
                    });
                    app.locals.pictures = medienOrdnerInhalt;
                    systemStatus.medien = medienOrdnerInhalt;
                    systemStatus.geloeschtesBild = bild;
                    if (medienOrdnerInhalt.length == 0) {
                        systemStatus.hatMedien = false;
                        validateButtons("keineMedien");
                    } else {
                        systemStatus.hatMedien = true;
                        //OK ist es wirklich nur, wenn nichts aufgenommen wird!
                        //kann während video/fotoaufnahmen zu falschen Buttons führen!
                        validateButtons("OK");
                    }
                    client.emit('bildLoeschen', systemStatus);
                });
            }
        });
    });

    //OK
    //Datentraeger auswerfen
    client.on('datentraegerAuswerfen', function() {
        // pi 'sudo umount /media/usb0'
        // OSX diskutil umountDisk /dev/disk3
        exec('diskutil umountDisk /dev/disk3', function(error, stdout, stderr) {
            console.log('stdout ' + stdout);
            console.log('stderr ' + stderr);
            if (error !== null) {
                console.log('exec error umount: ' + error);
            } else {
                systemStatus.usbOK = false;
                validateButtons("keinUSB");
                client.emit('datentraegerAuswerfen', systemStatus);
            }
        });
    });

    //Auf Datentraeger kopieren
    client.on('aufDatentraegerSpeichern', function(data) {
        systemStatus.amKopieren = true;
        validateButtons("amKopieren");
        zuKopierendeMedien = Object.create(medienOrdnerInhalt);
        console.log("am Kopieren...");
        var kopieren = function() {
            bildZumKopieren = zuKopierendeMedien.pop().name;
            exec("sudo cp " + pathToMediaFolder + bildZumKopieren + " " + usbStick, function(error, stdout, stderr) {
                console.log('stdout ' + stdout);
                console.log('stderr ' + stderr);
                if (error !== null) {
                    //zu implementieren!!!!!!!!
                    console.log('exec error copy to usb stick: ' + error);
                } else {
                    console.log("bild wurde kopiert: ", bildZumKopieren);
                    systemStatus.kopiertesMedium = bildZumKopieren;
                    if (zuKopierendeMedien.length > 0) {
                        client.emit('aufDatentraegerSpeichern', systemStatus);
                        kopieren();
                    } else {
                        systemStatus.amKopieren = false;
                        validateButtons("OK");
                        client.emit('aufDatentraegerSpeichern', systemStatus);
                        console.log("fertig kopiert!");
                    }
                }
            });
        };
        kopieren();
    });

    // performance verbessern!!!!!!!!!!!!!!
    //Foto machen
    client.on('fotoMachen', function() {

        systemStatus.amFotoMachen = true;

        foto.stdin.write("\n");
        var stempel = zeitstempel();
        var bild = stempel+".jpg";
        console.log("client fragt nach neuem foto");
        foto.stderr.once('data', (data) => {
            fs.rename(pathToMediaFolder+"bild.jpg", pathToMediaFolder+bild, function(err) {
                if ( err ) {
                    console.log('ERROR: ' + err);
                } else {
                    systemStatus.amFotoMachen = false;
                    systemStatus.hatMedien = true;
                    validateButtons("OK");
                    console.log("schickt foto zu client");
                    systemStatus.gemachtesMedium = bild;
                    medienOrdnerInhalt.push({
                            name: bild
                        });
                    client.emit('fotoMachen', systemStatus);
                }
            });
        });
    });

    //Status senden
    client.on('status', function() {
        if (systemStatus.usbOK) {
            validateButtons("OK");
        }
        if (systemStatus.amKopieren) {
            validateButtons("amKopieren");
        }
        if (systemStatus.amVideoMachen) {
            validateButtons("amVideoMachen")
        }
        if (systemStatus.amFotoMachen) {
            validateButtons("amFotoMachen");
        }
        client.emit('status', systemStatus);
    });

    client.on('ausschalten', function(){
        exec('sudo shutdown -h now', function(error, stdout, stderr) {
            console.log('stdout shutdown ' + stdout);
            console.log('stderr shutdown ' + stderr);
            if (error !== null) {
                console.log('exec error shutdown: ' + error);
            }
        });
    });

});

var mediaFilter = function(media){
    return media.includes("jpg")||media.includes("mp4") ? true : false;
};

app.get('/', function(reg, res) {
    usbCheck();
    fs.readdir(pathToMediaFolder, function(err, list) {
        medienOrdnerInhalt = [];
        list.filter(mediaFilter).forEach(function(pic) {
            medienOrdnerInhalt.push({
                name: pic
            });
        });
        console.log("medienOrdnerInhalt: ", medienOrdnerInhalt);
        systemStatus.hatMedien = medienOrdnerInhalt.length > 0 ? true : false;
        app.locals.pictures = medienOrdnerInhalt;
        systemStatus.medien = medienOrdnerInhalt;
        // um usbCheck() erkennen zu koennen!
        setTimeout(function() {
            res.render('pages/index');
        }, 100);
    });
});

app.get('/:picture', function(reg, res) {
    res.download(pathToMediaFolder + reg.params.picture);
});

server.listen(3000);
