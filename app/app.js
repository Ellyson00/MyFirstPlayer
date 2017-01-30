window.onload = function () {
    var MusicPlayer = function () {
        var player = this;
        var mouseDownEvent;
        
        
        (function getDom() {
            player.mainBlock = document.getElementById("mainBlock");
            player.audio = document.getElementById("player");
            player.volume = document.getElementById("volume-bar");
            player.currentVolume = document.getElementById("current-volume");
            player.currentTime = document.getElementById("currentTime");
            player.timeLine = document.getElementById("timeLine");
            player.songList = document.getElementById("playlist");
        })();
        
        
        //init AudioContext 
        var audioCtx = new(window.AudioContext || window.webkitAudioContext)(); //audio object
        var source, destination;
        var audio = document.querySelector('audio');
        source = audioCtx.createMediaElementSource(audio); //source of sound
        destination = audioCtx.destination; // our Speakers :D
        source.connect(destination);
        player.gainNode = audioCtx.createGain(); //Gain 
        source.connect(player.gainNode);
        player.gainNode.connect(destination);
        player.gainNode.gain.value = 0.5;
        
        
        // trying to learn canvas (the part of visualization code is not mine,srry :D)
        var canvas = document.querySelector("#myCanvas");
        var width = canvas.width;
        var height = canvas.height;
        var canvasContext = canvas.getContext('2d');
        
        buildAudioGraph();
        requestAnimationFrame(visualize);

        function buildAudioGraph() {
            player.analyser = audioCtx.createAnalyser();
            player.analyser.fftSize = 1024;
            // its size is always the fftSize / 2
            player.bufferLength = player.analyser.frequencyBinCount;
            player.dataArray = new Uint8Array(player.bufferLength);
            // connect the nodes
            source.connect(player.analyser);
            player.analyser.connect(audioCtx.destination);
        }

        function visualize() {
            canvasContext.fillStyle = 'rgba(0, 0, 0, 0.5)';
            canvasContext.fillRect(0, 0, width, height);
            canvasContext.beginPath();
            // draw the data as a waveform
            // Get the data from the analyser
            player.analyser.getByteTimeDomainData(player.dataArray);
            canvasContext.lineWidth = 2;
            canvasContext.strokeStyle = '#beffaa';
            // values are between 0 and 255, it's a byte
            // slice width
            var sliceWidth = width / player.bufferLength;
            var x = 0;
            for (var i = 0; i < player.bufferLength; i++) {
                var v = player.dataArray[i]; // between 0 and 255
                v = v / 255; // now between 0 and 1
                var y = v * height;
                if (i === 0) {
                    canvasContext.moveTo(x, y);
                }
                else {
                    canvasContext.lineTo(x, y);
                }
                x += sliceWidth;
            }
            // draw the whole waveform (a path)
            canvasContext.stroke();
            // call again the visualize function at 60 frames/s
            requestAnimationFrame(visualize);
        }
        
        
        this.list = ["src/Sivert Høyem - Prisoner of the Road.mp3", "src/Rag'n'bone Man - Human.mp3", "src/Arrow Benjamin - Love And Hate.mp3", "src/Sivert Høyem - Into the Sea.mp3", "src/Rudimental - Free ft. Emeli Sandé.mp3", "src/Naughty Boy - Runnin' (Lose It All) ft. Beyoncé, Arrow Benjamin.mp3", "src/Etherwood - Begin By Letting Go.mp3",  "src/Sivert Høyem - Görlitzer Park.mp3", "src/Bloc Party - Different Drugs.mp3", "src/Sivert Høyem - Running Out of Time.mp3", "src/Puscifer - Momma Sed (Tandimonium Mix).mp3", "src/Staind - Tangled Up In You.mp3", "src/Naughty Boy & Emeli Sande - Lifted (feat. Emeli Sande).mp3"];
        this.NumberOfSong = 0;
        this.shuffle = false;
        this.hidePlaylist = true;
        this.shuffleHistory = [];
        this.audio.src = player.list[this.NumberOfSong];
        
        
        this.mainBlock.buttons = {};
        this.mainBlock.buttons.items = [];
        
        
        //adding our buttons to nav panel
        this.initButtons = function () {
            var buttons = document.getElementById("buttons");
            player.mainBlock.appendChild(buttons);
            var copiedButtonsItems = player.mainBlock.buttons.items;
            player.mainBlock.buttons = buttons;
            player.mainBlock.buttons.items = copiedButtonsItems;
            for (var i = 0; i < player.mainBlock.buttons.items.length; ++i) {
                var item = player.mainBlock.buttons.items[i];
                item.init();
                player.mainBlock.buttons.appendChild(item.view);
            }
        };
        
        
        //Set current time of song
        this.timeLine.addEventListener('mouseup', function () {
            setTime(player.timeLine.value);
            player.currentTime.style.width = (player.timeLine.value * 449) + "px";
        });
        
        
        //Volume
        this.volume.addEventListener('mousedown', function () {
            setVol(player.volume.value);
            mouseDownEvent = setInterval(function () { //for long time taking mousedown event
                setVol(player.volume.value);
            }, 0);
        });
        this.volume.addEventListener('mouseup', function () {
            clearInterval(mouseDownEvent);
        });
        this.volume.addEventListener('mouseout', function () {
            clearInterval(mouseDownEvent);
        });
        
        
        //Method to set volume
        function setVol(value) {
            //          player.gainNode.gain.value=value;  // it works ;D 
            player.audio.volume = value;
            document.getElementById("current-volume").style.width = (119 * value) + "px";
        }
        
        
        //Method to set time of song
        function setTime(value) {
            var duration = player.audio.duration;
            var durationInProc = duration / 100;
            player.audio.currentTime = durationInProc * value * 100;
        }
        
        
        //Timer
        function Timer(time) {
            var seconds;
            var minutes = 0;
            var minutes = Math.floor(time / 60);
            var seconds = Math.floor(time);
            if (isNaN(seconds) || isNaN(minutes)) {
                return "0:00";
            }
            else {
                seconds = (seconds - (minutes * 60)) < 10 ? ('0' + (seconds - (minutes * 60))) : (seconds - (minutes * 60));
                time = minutes + ':' + seconds;
                return time;
            }
        }
        
        
        //Scaning and set current Time of song
        this.play = function () {
                player.playing = setInterval(function () {
                    var duration = player.audio.duration;
                    var Current = player.audio.currentTime;
                    var Margin = Current / duration;
                    player.currentTime.style.width = (Margin * 449) + "px";
                    if (Margin == 1) {
                        if (player.shuffle == true) {
                            player.NumberOfSong = Math.floor(Math.random() * (player.list.length - 1));
                        }
                        else if (player.NumberOfSong < player.list.length - 1) {
                            player.NumberOfSong++;
                        }
                        player.CurrentSong(player.NumberOfSong);
                        player.audio.src = player.list[player.NumberOfSong];
                        player.audio.play();
                    }
                    document.getElementById("timer").innerHTML = Timer(Current) + "/" + Timer(duration);
                }, 1000);
            }
        
        
            //Stop scaning
        this.pause = function () {
                clearInterval(player.playing);
            }
        
        
            //Playing Song in List
        this.CurrentSong = function (song) {
            document.querySelector(".playing").className = "song";
            document.getElementById("playlist").children[song].className = "song playing";
        };
        
        
        //init Playlist 
        player.list.forEach(function (item, index) {
            var div = document.createElement("div");
            var reg = /src\//g;
            var mp3 = /.mp3/g;
            if (index == 0) {
                div.className = "song playing";
            }
            if (index > 0) {
                div.className = "song";
            }
            item = item.replace(reg, "");
            item = item.replace(mp3, "");
            div.innerHTML += item;
            div.onclick = function () {
                player.NumberOfSong = index;
                player.audio.src = player.list[player.NumberOfSong];
                player.CurrentSong(player.NumberOfSong);
                player.pause();
                player.play();
                player.audio.play();
                document.getElementById("play").firstChild.src = "buttons/pause.png";
            };
            document.getElementById("playlist").appendChild(div);
        });
        
        setVol(0.5);
        
        
        //our buttons in Array :D
        
        
        this.addButtonsItem = function (item) {
            player.mainBlock.buttons.items.push(item);
        };
        
        
        //Constructor of Buttons
        this.Button = function (name, icon, func) {
            var button = this;
            this.name = name;
            this.icon = icon;
            this.func = func;
            this.view = document.createElement("button");
            this.view.className = "button";
            this.init = function () {
                button.view.setAttribute('id', name);
                if (icon) {
                    var img = document.createElement("img");
                    img.src = button.icon;
                    button.view.appendChild(img);
                }
                button.view.addEventListener('mouseup', button.func);
            };
        }
    };
    
    
    //Creat our player :D
    var MusicPlayer = new MusicPlayer();
    
    
    //And now we start to add our Buttons
    
    var play = new MusicPlayer.Button("play", "buttons/play.png", function () {
        if (MusicPlayer.audio.paused) {
            MusicPlayer.play();
            MusicPlayer.audio.play();
            document.getElementById("play").firstChild.src = "buttons/pause.png";
        }
        else {
            MusicPlayer.pause();
            MusicPlayer.audio.pause();
            document.getElementById("play").firstChild.src = "buttons/play.png";
        }
    });
    
    MusicPlayer.addButtonsItem(play);
    
    var backward = new MusicPlayer.Button("forward", "buttons/backward.png", function () {
        if (MusicPlayer.shuffle == true) { //for shuffle
            MusicPlayer.shuffleHistory.splice(MusicPlayer.shuffleHistory.length - 1, 1);
            if (MusicPlayer.shuffleHistory.length != 0) {
                MusicPlayer.NumberOfSong = MusicPlayer.shuffleHistory[MusicPlayer.shuffleHistory.length - 1];
            }
        }
        else if (MusicPlayer.NumberOfSong > 0) {
            MusicPlayer.NumberOfSong--;
        }
        MusicPlayer.audio.src = MusicPlayer.list[MusicPlayer.NumberOfSong];
        MusicPlayer.CurrentSong(MusicPlayer.NumberOfSong);
        MusicPlayer.pause();
        MusicPlayer.play();
        MusicPlayer.audio.play();
        document.getElementById("play").firstChild.src = "buttons/pause.png";
    });
    
    MusicPlayer.addButtonsItem(backward);
    
    var forward = new MusicPlayer.Button("forward", "buttons/forward.png", function () {
        if (MusicPlayer.shuffle == true) {
            MusicPlayer.NumberOfSong = Math.floor(Math.random() * (MusicPlayer.list.length - 1));
            MusicPlayer.shuffleHistory.push(MusicPlayer.NumberOfSong);
        }
        else if (MusicPlayer.NumberOfSong < MusicPlayer.list.length - 1) {
            MusicPlayer.NumberOfSong++;
        }
        MusicPlayer.audio.src = MusicPlayer.list[MusicPlayer.NumberOfSong];
        MusicPlayer.CurrentSong(MusicPlayer.NumberOfSong);
        MusicPlayer.pause();
        MusicPlayer.play();
        MusicPlayer.audio.play();
        document.getElementById("play").firstChild.src = "buttons/pause.png";
    });
    
    MusicPlayer.addButtonsItem(forward);
    
    var shuffle = new MusicPlayer.Button("shuffle", "buttons/shuffle.png", function () {
        if (MusicPlayer.shuffle == false) {
            document.getElementById("shuffle").style.background = "rgba(54, 252, 0, 0.27)";
            MusicPlayer.shuffleHistory = [];
            MusicPlayer.shuffle = true;
        }
        else if (MusicPlayer.shuffle == true) {
            MusicPlayer.shuffle = false;
            document.getElementById("shuffle").style.background = "rgba(0, 0, 0, 0)";
        }
    });
    
    MusicPlayer.addButtonsItem(shuffle);
    
    var hideList = new MusicPlayer.Button("hide", "buttons/playlist.png", function () {
        if (MusicPlayer.hidePlaylist == false) {
            document.getElementById("mainBlock").style.height = "75px";
            MusicPlayer.hidePlaylist = true;
        }
        else if (MusicPlayer.hidePlaylist == true) {
            MusicPlayer.hidePlaylist = false;
            document.getElementById("mainBlock").style.height = "480px";
        }
    });
    
    MusicPlayer.addButtonsItem(hideList);
    
    MusicPlayer.initButtons();
}
