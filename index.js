(function () {
    var video = document.querySelector('.camera__video'),
        canvas = document.querySelector('.camera__canvas');

    var getVideoStream = function (callback) {
        navigator.getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia;

        if (navigator.getUserMedia) {
            navigator.getUserMedia({video: true},
                function (stream) {
                    video.src = window.URL.createObjectURL(stream);
                    video.onloadedmetadata = function (e) {
                        video.play();

                        callback();
                    };
                },
                function (err) {
                    console.log("The following error occured: " + err.name);
                }
            );
        } else {
            console.log("getUserMedia not supported");
        }
    };

    var applyFilterToPixel = function (block) {
        var filters = {
            invert: function (block) {
               for (var x = 0; x < (canvas.width * canvas.height * 4); x++) {
                    block[x] = 255 - block[x];
                    x++;
                    block[x] = 255 - block[x];
                    x++;
                    block[x] = 255 - block[x];
                    x++;
                }

                return block;
            },
            grayscale: function (block) {
                for (var x = 0; x < (canvas.width * canvas.height * 4); x++) {
                    var v = 0.2126 * block[x] + 0.7152 * block[x+1] + 0.0722 * block[x+2];

                    block[x] = block[x+1] = block[x+2] = v;

                    x+=3;
                }

                return block;
            },
            threshold: function (block) {
                for (var x = 0; x < (canvas.width * canvas.height * 4); x++) {
                    var v = (0.2126 * block[x] + 0.7152 * block[x+1] + 0.0722 * block[x+2] >= 128) ? 255 : 0;

                    block[x] = block[x+1] = block[x+2] = v;

                    x+=3;
                }

                return block;
            }
        };

        var filterName = document.querySelector('.controls__filter').value;

        return filters[filterName](block);
    };

    var applyFilter = function () {
        var block = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);

        block.data = applyFilterToPixel(block.data);
        
        canvas.getContext('2d').putImageData(block, 0, 0);
    }

    var captureFrame = function () {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        canvas.getContext('2d').drawImage(video, 0, 0);
        applyFilter();
    };

    getVideoStream(function () {
        captureFrame();

        setInterval(captureFrame, 16);
    });
})();
