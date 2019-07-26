$(function () {
    resaltar(0);
    //$(window).on("load", resaltar);

});

var formu;

(function ($) {
    $.fn.serializeFormJSON = function () {

        var obj = {};
        var arg = this.serializeArray();
        $.each(arg, function () {
            if (obj[this.name]) {
                if (!obj[this.name].push) {
                    obj[this.name] = [obj[this.name]];
                }
                obj[this.name].push(this.value || '');
            } else {
                obj[this.name] = this.value || '';
            }
        });
        return obj;
    };
})(jQuery);

$('#formulario').submit(function (e) {
    e.preventDefault();
    var data = $(this).serializeFormJSON();
    alert(JSON.stringify(data));
    formu = data;

});


var canvas = $("#canvas"),
    context = canvas.get(0).getContext("2d"),
    $result = $('#result');

$('#fileInput').on('change', function () {
    if (this.files && this.files[0]) {
        if (this.files[0].type.match(/^image\//)) {
            var reader = new FileReader();
            reader.onload = function (evt) {
                var img = new Image();
                img.onload = function () {
                    context.canvas.height = img.height;
                    context.canvas.width = img.width;
                    context.drawImage(img, 0, 0);
                    var cropper = canvas.cropper({
                        aspectRatio: 1 / 1, viewmode: 2,
                    });
                    $('#btnCrop').click(function () {
                        var croppedImageDataURL = canvas.cropper('getCroppedCanvas').toDataURL("image/png");
                        $result.append($('<img id="hola" width="300" height="300">').attr('src', croppedImageDataURL));
                        $(this).prop("disabled", true);
                    });
                    $('#btnRestore').click(function () {
                        canvas.cropper('reset');
                        $result.empty();
                        $("#btnCrop").prop("disabled", false);
                    });
                };
                img.src = evt.target.result;
            };
            reader.readAsDataURL(this.files[0]);
        }
        else {
            alert("Invalid file type! Please select an image file.");
        }
    }
    else {
        alert('No file(s) selected.');
    }
});



function resaltar(n) {
    $("#paso1").css("background-color", "rgb(221, 221, 221)");
    $(".prev").attr("disabled", true);
}

function select_sexo(s) {
    $("#sexo").val(s);
}

function select_step(str) {
    var wiz_steps = ["frm", "subir-img", "seleccion-ubicacion", "mostrar-resultado"]
    var nav_steps = ["paso1", "paso2", "paso3", "paso4"]

    for (var i = 0; i < 4; i++) {
        if (wiz_steps[i] != str) {
            $("." + wiz_steps[i]).css("display", "none");
            $("#" + nav_steps[i]).css("background-color", "white");
        } else {

            $("." + wiz_steps[i]).css("display", "block");
            $("#" + nav_steps[i]).css("background-color", "rgb(221, 221, 221)");


            if (i == 0) { $(".prev").attr("disabled", true) } else { $(".prev").attr("disabled", false) };

            if (i == 3) {
                $(".nxt").attr("disabled", true);

                resumen();

            } else {
                $(".nxt").attr("disabled", false);

            }

        }
    }

}

function detectarSig() {
    if ($(".frm").css("display") == "block") {
        $(".subir-img").css("display", "block");
        $("#paso1").css("background-color", "white");
        $("#paso2").css("background-color", "rgb(221, 221, 221)");
        $(".frm").css("display", "none");
        $(".prev").attr("disabled", false);
    } else if ($(".subir-img").css("display") == "block") {
        $(".seleccion-ubicacion").css("display", "block");
        $("#paso2").css("background-color", "white");
        $("#paso3").css("background-color", "rgb(221, 221, 221)");
        $(".subir-img").css("display", "none");
        $(".prev").attr("disabled", false);

    } else if ($(".seleccion-ubicacion").css("display") == "block") {
        $(".mostrar-resultado").css("display", "block");
        $("#paso3").css("background-color", "white");
        $("#paso4").css("background-color", "rgb(221, 221, 221)");
        $(".seleccion-ubicacion").css("display", "none");
        $(".prev").attr("disabled", false);
        $(".nxt").attr("disabled", true);
        resumen();
    }
}

function detectarAnterior() {
    if ($(".subir-img").css("display") == "block") {
        $(".frm").css("display", "block");
        $("#paso2").css("background-color", "white");
        $("#paso1").css("background-color", "rgb(221, 221, 221)");
        $(".subir-img").css("display", "none");
        $(".prev").attr("disabled", true);
    } else if ($(".seleccion-ubicacion").css("display") == "block") {
        $(".subir-img").css("display", "block");
        $("#paso3").css("background-color", "white");
        $("#paso2").css("background-color", "rgb(221, 221, 221)");
        $(".seleccion-ubicacion").css("display", "none");
        $(".prev").attr("disabled", false);

    } else if ($(".mostrar-resultado").css("display") == "block") {
        $(".seleccion-ubicacion").css("display", "block");
        $("#paso4").css("background-color", "white");
        $("#paso3").css("background-color", "rgb(221, 221, 221)");
        $(".mostrar-resultado").css("display", "none");
        $(".prev").attr("disabled", false);
        $(".nxt").attr("disabled", false);
    }
}

function cancelar() {
    window.location.reload(true)
}

/**MAPS*/
var marker;
function initMap(coords) {
    var map = new google.maps.Map(document.getElementById('map'), {
        center: coords,
        zoom: 12
    });


    addMarker(coords);

    $(".p").remove();

    $("#crds").append("<p class='p'>" + JSON.stringify(coords) + "</p>");

    map.addListener('click', function (event) {
        marker.setMap(null);
        addMarker(event.latLng);
    });

    function addMarker(location) {
        marker = new google.maps.Marker({
            position: location,
            map: map
        });


        $(".p").remove();

        $("#crds").append("<p class='p'>" + JSON.stringify(location) + "</p>");
    }

}
var place;
function initialize() {
    geocoder = new google.maps.Geocoder();
    var input = document.getElementById("address");
    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.addListener('place_changed', function () {
        place = autocomplete.getPlace();
        if (place.geometry) {
            $(".p").remove();
            buscar();

        }
    });
    $("#address").val("");

};
function buscar() {
    coords = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() }
    initMap(coords);
}


/**RESUMEN */

function resumen() {

    $("#sp1").text(formu["fecha"]);
    $("#sp2").text(formu["telefono"]);
    $("#sp3").text(formu["url"]);
    $("#sp4").text(formu["edad1"]);
    $("#sp5").text(formu["edad2"]);
    $("#sp6").text(formu["sexo"]);
    $("#sp7").text(formu["titulo"]);
    $("#sp8").text(formu["info"]);

    var imgcrop = document.getElementById("hola").src;
    $("#img-recortada").attr("src", imgcrop);

    $("#coordenadas").html($("#crds").html());

}
