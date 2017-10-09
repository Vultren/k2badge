var lang = "en";
var globalship = null;
var globalbg = null;
var globalavatar = null;
var k2 = {};
var colle = {};
var shipDB = {};
var fleets = [
    new Array(6),
    new Array(6),
    new Array(6),
    new Array(6),
];
var fleetLevels = [
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1]
];
var loading = {};
var selectedFleet = 0;
var selectedSlot = 0;

var conversion = {};
var abyssDB = {};
var shipTypes = {};
var flagRarity = 0;



var deskoffsetdb = {
    "016.png": { x: 0, y: -140 },
    "017.png": { x: 0, y: -140 },
    "021.png": { x: 0, y: -140 },
    "026.png": { x: 0, y: -140 },
    "037.png": { x: 0, y: -140 },
    "042a.png": { x: 0, y: 70 },
    "042b.png": { x: 0, y: 70 },
    "046.png": { x: 0, y: -140 },
    "057.png": { x: 0, y: -140 },
}

//var c = document.getElementById("result");
//var ctx = c.getContext("2d");
var hexagonAngle = 0.523598776,
    sideLength = 24;
var hexHeight = Math.sin(hexagonAngle) * sideLength;
var hexRadius = Math.cos(hexagonAngle) * sideLength;
var hexRectangleHeight = sideLength + 2 * hexHeight;
var hexRectangleWidth = 2 * hexRadius;
var centerx = (hexRectangleHeight * 5 / 4 - hexRectangleWidth) / 2;
var centery = (hexRectangleHeight * 5 / 4 - hexRectangleHeight) / 2 + 5;
var textfont = "'Ubuntu', 'メイリオ', Times, serif";
var numberfont = "'Exo', 'メイリオ', Times, serif";

var loadData = function() {
    $.getJSON("data/shipType.json", function(json) {
        shipTypes = json;
    }).done(function() {
        $.getJSON((lang == "en" ? 'data/db.json?v=13' : 'data/dbj.json?v=13'), function(data) {
            shipDB = data;
        }).done(function() {
            $.getJSON("data/conversion.json?v=13'", function(data2) {
                conversion = data2;

            }).fail(function() {
                console.log("import db not found or invalid format, not performing import");
            }).always(init)
        }).fail(function() {
            //Kill the App
            $("#buttons").html("Can't find Kanmusu DB, please contact Vultren or Nya-chan on Github");
            $("#tabs").remove();
        })
    }).fail(function() {
        //Kill the App
        $("#buttons").html("Ubable to gernerate ship types, please contact Vultren or Nya-chan on Github");
        $("#tabs").remove();
    });
};


var drawPoster = function() {
    var newLength = 10;
    recalculateSides(newLength);
    ctx.save();
    var name = $("[name='name']")[0];
    var level = $("[name='level']")[0];
    var server = $("[name='server'] :selected").text();
    var useBlue = $("#useBlue").prop("checked");
    var maxPerLine = 40;
    var linebarwidth = newLength * (2 * Math.sin(Math.PI / 2) + 1);
    var line = 55;
    var bottomLine = c.height - 10;
    var row = 40;
    var rowbox = row + 15;
    var evenRow = false;

    ctx.font = "20px " + textfont;
    ctx.imageSmoothingEnabled = true;
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    if (name.value) {
        drawText(name.value, 20, 25, 3);
    } else {
        drawText((lang == "en" ? "Nameless Admiral" : "無名提督"), 20, 25, 3);
    }

    ctx.save();
    ctx.font = "10px " + textfont;
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.strokeStyle = 'transparent';
    var date = new Date();
    drawText(date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(), 5, c.height - 5, 3);
    ctx.restore();

    for (var key in shipTypes) {

        var classLang = shipTypes[key]
        var row = 40;
        var rowbox = row + 15;
        var num = 0;
        var max = $("#colleTab .div" + key + " img").length;
        var selected = $("#colleTab .div" + key + " img.selected").length;
        var percentLocation = Math.min(maxPerLine, max);

        if (Math.floor((max - 1) / maxPerLine % 2) == 1) {
            evenRow = !evenRow;
        }

        if (evenRow) {
            row = row + hexRadius;
            rowbox = rowbox + hexRadius;
        }

        ctx.font = "14px " + textfont;

        ctx.textAlign = "right";
        drawText(classLang[lang], row, line + newLength - 9);

        ctx.save();
        ctx.fillStyle = "white";

        $("#colleTab .div" + key + " img").each(function(i) {

            var current = max - num - 1;

            var x = rowbox + num % maxPerLine * hexRectangleWidth;
            if (Math.floor(num / maxPerLine % 2) > 0) {
                x = rowbox + (maxPerLine - num % maxPerLine) * hexRectangleWidth - hexRadius;
            }
            var y = Math.floor(num / maxPerLine) * +linebarwidth / 2 + line - 15;
            var img = document.getElementById(this.id);
            drawHexagon(img, x, y, $(this).hasClass("selected"), false);
            num++;

        });
        ctx.textAlign = "left";
        ctx.font = "14px " + numberfont;
        drawText(selected + "/" + max + " (" + (selected / max * 100).toFixed() + "%)", rowbox + percentLocation * hexRectangleWidth + 8, line);
        ctx.restore();
        line = line + linebarwidth / 2 + linebarwidth / 4
        evenRow = !evenRow;

        if (max / maxPerLine > 1) {
            line = line + linebarwidth / 2 + Math.floor(num / maxPerLine) * 8;
        }

    }

    ctx.font = "12px " + textfont;
    var shipBoxes = $("#colleTab");
    var chkShips = shipBoxes.find("img.selected").length;
    var allShips = shipBoxes.find("img").length;
    drawProgress(chkShips, allShips, 10)

    ctx.font = "12px " + textfont;
    ctx.textAlign = "right";
    drawText("Lv. " + (level.value ? level.value : "?"), c.width / 2, 25);

    if (server != "Your Server") {
        drawText(server.substring(server.indexOf(" ") + 1), c.width - 25, 25);
    } else {
        drawText((lang == "en" ? "Unknown Server" : "不明サーバ"), c.width - 25, 25);
    }
    ctx.textAlign = "left";
    ctx.restore();
    $("#loadingDiv").html("");
    $("#loadingProgress").hide();
    $("#buttons button").prop('disabled', false);
};

var drawBadge = function() {
    var newLength = 16;
    recalculateSides(newLength);
    ctx.save();
    ctx.strokeRect(35, 45, 100, 100);
    //TODO: move to global variables
    var name = $("[name='name']")[0];
    var level = $("[name='level']")[0];
    var server = $("[name='server'] :selected").text();
    var useBlue = $("#useBlue").prop("checked");
    var maxPerLine = 12;
    var linebarwidth = newLength * (2 * Math.sin(Math.PI / 2) + 1);
    var line = 30;
    var line4 = 175;
    var evenRow = false;

    ctx.font = "20px " + textfont;
    ctx.imageSmoothingEnabled = true;
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    if (name.value) {
        drawText(name.value, 20, 25, 3);
    } else {
        drawText((lang == "en" ? "Nameless Admiral" : "無名提督"), 20, 25, 3);
    }

    ctx.save();
    ctx.font = "10px " + textfont;
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.strokeStyle = 'transparent';
    var date = new Date();
    drawText(date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(), 5, c.height - 5, 3);
    ctx.restore();

    for (var key in shipTypes) {
        if ($("#" + key.toLowerCase()).find("[type='checkbox']").length == 0 || ["SS", "AX"].indexOf(key) > -1) {
            continue;
        }
        var classLang = shipTypes[key]
        var row = 175;
        var rowbox = row + 15;
        var loower = key.toLowerCase();
        var num = 0;
        var blue = $("#" + key.toLowerCase()).find(".blueprint").not(".kai").length;
        var max = $("#" + key.toLowerCase()).find("[type='checkbox']").length;
        var selected = $("#" + key.toLowerCase()).find("[type='checkbox']:checked").length;

        if (blue > 0 && useBlue) {
            max -= blue;
        }
        var percentLocation = Math.min(maxPerLine, max);

        if (Math.floor((max - 1) / maxPerLine % 2) == 1) {
            evenRow = !evenRow;
        }

        if (max / maxPerLine > 1) {
            line = line + (linebarwidth * Math.floor(max / maxPerLine)) / 2;
        }
        if (evenRow) {
            row = row + hexRadius;
            rowbox = rowbox + hexRadius;

        }

        ctx.font = "14px " + textfont;

        ctx.textAlign = "right";
        drawText((lang == "en" ? classLang[lang] : classLang["jp"]), row, line + newLength - 9);

        ctx.save();
        ctx.fillStyle = "white";

        $($("#" + key.toLowerCase()).find("[type='checkbox']").get().reverse()).each(function(i) {
            var label = $(this).parent().parent();
            var current = max - num - 1;
            if (!(useBlue && label.hasClass("blueprint") && !label.hasClass("kai"))) {
                var x = rowbox + current % maxPerLine * hexRectangleWidth;
                if (Math.floor(current / maxPerLine % 2) > 0) {
                    x = rowbox + (maxPerLine - (current + 1) % maxPerLine) * hexRectangleWidth - hexRadius;
                }
                var y = Math.floor(current / maxPerLine) * -linebarwidth / 2 + line - 15;
                var img = document.getElementById("icon" + this.id);
                var blueprint = label.hasClass("blueprint") ? (label.hasClass("prototype") ? "pink" : "lightblue") : "white";
                drawHexagon(img, x, y, this.checked, blueprint);

                num++;
            }

        });
        ctx.textAlign = "left";
        ctx.font = "14px " + numberfont;
        drawText(selected + "/" + num, rowbox + percentLocation * hexRectangleWidth + 8, line + newLength - 9);
        ctx.restore();
        line = line + linebarwidth / 2;
        evenRow = !evenRow;

    }
    var numCV = $("#cv").find("[type='checkbox']").length - ((useBlue) ? $("#cv").find(".blueprint").not(".kai").length : 0);
    var startPositionSS = (numCV + 3) * hexRectangleWidth;
    var numSS = 0;
    var maxSS = $("#ss").find("[type='checkbox']:checked").length;
    var ssRow = 190;
    var ssRowbox = ssRow + 15;
    var blue = 0;
    line = line - linebarwidth;
    drawText((lang == "en" ? "SS" : "潜"), ssRow + startPositionSS, line + linebarwidth / 2 + newLength - 9);
    ctx.save();
    ctx.fillStyle = "white";
    $("#ss").find("[type='checkbox']").each(function() {
        var label = $(this).parent().parent();
        if (!(useBlue && label.hasClass("blueprint") && !label.hasClass("kai"))) {
            var x = startPositionSS + ssRowbox + numSS * hexRectangleWidth;
            var y = line - 15 + linebarwidth / 2;
            var img = document.getElementById("icon" + this.id);
            var blueprint = $(this).parent().parent().find("label").hasClass("blueprint") ? "lightblue" : "white";
            drawHexagon(img, x, y, this.checked, blueprint);

            numSS++;
        } else if (this.checked && label.hasClass("blueprint")) {
            blue++;
        }
    });
    ctx.textAlign = "left";
    ctx.font = "14px " + numberfont;
    drawText(maxSS - blue + "/" + numSS, startPositionSS + ssRowbox + numSS * hexRectangleWidth + 8, line + newLength - 9 + linebarwidth / 2);
    ctx.restore();

    var numCVL = $("#cvl").find("[type='checkbox']").length - ((useBlue) ? $("#cvl").find(".blueprint").not(".kai").length : 0);
    var startPositionAX = (numCVL + 3) * hexRectangleWidth;
    var axRow = 163 + hexRadius;
    var axRowbox = axRow + hexRadius;
    drawText((lang == "en" ? "AX" : "その他"), axRow + startPositionAX, line + newLength - 9);
    var numAX = 0;
    var maxAX = $("#ax").find("[type='checkbox']:checked").length;
    var blue = 0;
    ctx.save();
    ctx.fillStyle = "white";
    $("#ax").find("[type='checkbox']").each(function() {
        var label = $(this).parent().parent();
        if (!(useBlue && label.hasClass("blueprint") && !label.hasClass("kai"))) {
            var x = startPositionAX + axRowbox + numAX * hexRectangleWidth;
            var y = line - 15;
            var img = document.getElementById("icon" + this.id);
            var blueprint = $(this).parent().parent().find("label").hasClass("blueprint") ? "lightblue" : "white";
            drawHexagon(img, x, y, this.checked, blueprint);

            numAX++;
        } else if (this.checked && label.hasClass("blueprint")) {
            blue++;
        }
    });
    ctx.textAlign = "left";
    ctx.font = "14px " + numberfont;
    drawText(maxAX - blue + "/" + numAX, startPositionAX + axRowbox + numAX * hexRectangleWidth + 8, line + newLength - 9);
    ctx.restore();

    ctx.font = "12px " + textfont;
    var shipBoxes = $(".shipOptions");
    var allBlue = shipBoxes.find(".blueprint").length - shipBoxes.find(".kai").length;
    var chkBlue = shipBoxes.find(".blueprint :checked").length - shipBoxes.find(".kai :checked").length;
    var chkShips = !useBlue ? shipBoxes.find("[type='checkbox']:checked").length : shipBoxes.find("[type='checkbox']:checked").length - chkBlue;
    var allShips = !useBlue ? shipBoxes.find("[type='checkbox']").length : shipBoxes.find("[type='checkbox']").length - allBlue;

    drawProgress(chkShips, allShips, 20);

    ctx.font = "12px " + textfont;
    ctx.textAlign = "center";
    drawText("Lv. " + (level.value ? level.value : "?"), 85, line4 - 8);

    if (server !== "------") {
        drawText((lang == "en" ? server.substring(server.indexOf(" ") + 1) : server), 85, line4 + 7);
    } else {
        drawText((lang == "en" ? "Unknown Server" : "不明サーバ"), 85, line4 + 7);
    }
    ctx.textAlign = "left";
    ctx.restore();
    $("#loadingDiv").html("");
    $("#loadingProgress").hide();
    $("#buttons button").prop('disabled', false);
};




$(window).on("load", function() {
    $("#tabs").tabs();
    //$("#tabs").show();

    $(".furnitureClass.invert > div div").each(function() {
        //Newest Furniture First
        $(this).prependTo(this.parentNode);
    });
});



$('.tooltip').tooltipster();

$(".shipClasses").find("label").next("div").each(function() {
    if ($(this).find("img").length == 0) {
        $(this).parent().remove();
    }
});

$("#fleetSelect div").click(function() {
    $("#fleetSelect .chosen").removeClass("chosen");
    $(this).toggleClass("chosen");
    var index = this.id.substring(5);
    selectedFleet = parseInt(index) - 1;

    $("#fleets div").html("");
    $("#fleetLevels input").val(1);

    for (var i in fleets[selectedFleet]) {
        var avatar = fleets[selectedFleet][i];
        var slot = parseInt(i) + 1;
        if (avatar !== null && avatar !== "") {
            $("#slot" + slot).html('<img style="height:50px; width:50px;" src="' + $("#" + avatar).attr("src") + '"/>');
        }
        $("#level" + slot).val(fleetLevels[selectedFleet][i]);
    }
});

$("#fleets div").click(function() {
    $("#fleets .chosen").removeClass("chosen");
    $(this).toggleClass("chosen");
    var index = this.id.substring(4);
    selectedSlot = parseInt(index) - 1;
});

$("#fleetLevels input").change(function() {
    var index = this.id.substring(5);
    selectedSlot = parseInt(index) - 1;
    fleetLevels[selectedFleet][selectedSlot] = this.value;
    generateFunction("fleetLevelChange");
});

$("#avatars img").on("click", function() {
    if (!$(this).hasClass("abyss")) {
        fleets[selectedFleet][selectedSlot] = $(this).attr("id");
        $("#fleets .chosen").html('<img style="height:50px; width:50px;" src="' + $(this).attr("src") + '"/>');
    }
    if (selectedFleet == 0 && selectedSlot == 0) {
        $(".flagship").removeClass("flagship");
        $(".damaged").removeClass("damaged");
        $(this).toggleClass("flagship");
        flagRarity = shipDB[this.id.substring(4)] ? shipDB[this.id.substring(4)].rarity : 0;
    }
    generateFunction("fleetShipChange");
});

$("#colleTab img").on("click", function() {
    if (colle[$(this).attr("id").substring(4)] && $(this).hasClass("selected")) {
        delete colle[$(this).attr("id").substring(4)];
    } else if (!$(this).hasClass("selected")) {
        colle[$(this).attr("id").substring(4)] = true;
    }
    $(this).toggleClass("selected");

    generateFunction("colleChange");
});

//$("#avatars span").on("click", bindAvatars);

$(".shipList > label").click(function() {
    $(this).next("div").slideToggle();
});

$(".shipClasses label").click(function() {
    $(this).next("div").toggle();
});

$("#removeSlot").click(function() {
    if (selectedFleet == 0 && selectedSlot == 0) {
        $(".damaged").removeClass("damaged");
        $(".flagship").removeClass("flagship");
        flagRarity = 0;
    }

    fleets[selectedFleet][selectedSlot] = null;
    $("#fleets .chosen").html("");
    generateFunction("fleetRemoveSlot");
});

$(".shipOptions input[type='checkbox']").change(function() {
    generateFunction("kainiShipChange");
});

$("#selectAll").on("change", function() {
    if (this.checked) {
        $(".shipOptions [type='checkbox']").prop("checked", true);
    } else {
        $(".shipOptions [type='checkbox']").prop("checked", false);
    }
    generateFunction("kainiSelectAll");
});

$("#displayBadge").on("click", function() {
    $("#buttonToggles button").removeClass("active");
    $(this).addClass("active");
    c.width = 850;
    c.height = 240;
    generateFunction("displayBadge");
});
$("#displayRoom").on("click", function() {
    $("#buttonToggles button").removeClass("active");
    $(this).addClass("active");
    c.width = 850;
    c.height = 510;
    drawRoom(132);
});
$("#displayPoster").on("click", function() {
    $("#buttonToggles button").removeClass("active");
    $(this).addClass("active");
    c.width = 850;
    c.height = 510;
    generateFunction("displayPoster");
});

//$("#generate").on("click", generateFunction);

$("#Floor,#Wall,#Desk,#Object,#Chest,#Window").on("change", function() {
    var type = this.id;
    delete loading[type];
    var activeImg = $("#active" + type);
    var imgToLoad = $(this).find(":checked").val();
    activeImg.off("load");
    activeImg.attr("src", "assets/furniture/" + this.id.toLowerCase() + "/" + imgToLoad + ".png");
    if (activeImg.prop("complete")) {
        if ($.isEmptyObject(loading) && type != "Window") {
            $("#buttons button").prop("disabled", false);
            $("#loadingDiv").html("");
            if ($("#displayRoom").hasClass("on")) {
                drawRoom(132);
            } else generateFunction("furnitureChangeCache");
        }
    } else {
        loading[type] = imgToLoad;
        $("#buttons button").prop("disabled", true);
        $("#loadingDiv").html("Rendering...");
        activeImg.on("load", function() {
                delete loading[type];
                if ($.isEmptyObject(loading)) {
                    $("#buttons button").prop("disabled", false);
                    $("#loadingDiv").html("");
                    if ($("#displayRoom").hasClass("on")) {
                        drawRoom(132);
                    } else generateFunction("furnitureChangeLoaded");
                }
            })
            .on('error', function() {
                delete loading[type];
                if ($.isEmptyObject(loading)) {
                    $("#buttons button").prop("disabled", false);
                    $("#loadingDiv").html("Couldn't find this furniture's image.");
                }
            });
    }

    if (type == "Window") {
        $("#Outside").change();
    }
});

$("#Outside").on("change", function(byWindow) {
    delete loading["Outside"];
    var activeOut = $("#activeOutside");
    var selectedOut = $("#Outside").find(":checked");
    var windowType = $("#Window").find(":checked").attr("data-pType");
    var imgToLoad = selectedOut.val() + windowType;
    var path = "furniture/outside/" + imgToLoad + ".png";
    activeOut.off("load");
    activeOut.attr("src", path);
    if (activeOut.prop("complete") && $.isEmptyObject(loading)) {
        $("#buttons button").prop("disabled", false);
        $("#loadingDiv").html("");
        if ($("#displayRoom").hasClass("on")) {
            drawRoom(132);
        } else generateFunction("furnitureOutsideCache");
    } else {
        activeOut.on("load", function() {
            delete loading["Outside"];
            if ($.isEmptyObject(loading)) {
                $("#buttons button").prop("disabled", false);
                $("#loadingDiv").html("");
                if ($("#displayRoom").hasClass("on")) {
                    drawRoom(132);
                } else generateFunction("furnitureOutsideLoaded");
            }
        });
    }

})

$("#ttkTab input[type='text'],#ttkTab input[type='number']").blur(function() {
    generateFunction("ttkInfo");
});

$("#ttkTab select").click(function() {
    generateFunction("ttkServer");
});

$("#ttkTab input[type='checkbox']").click(function() {
    generateFunction("ttkLevel");
});

$("#loadAbyss").click(function() {
    loadAbyssalShips();
});

$("#save").on("click", function() {
    saveAll();
    this.setAttribute("disabled", "disabled");
});
$("#load").on("click", function() {
    loadAll();
});

$("#export").on("click", function() {
    alert("Right-click the image that opens up in a new tab and save it as PNG.");
    var dataURL = c.toDataURL("image/png");
    window.open(dataURL, "_blank");
});

$('#avatar').on("load", function() {
    if ($.isEmptyObject(loading)) generateFunction("avatarImgChange");
});

$('#bg').on("load", function() {
    if ($.isEmptyObject(loading)) generateFunction("bgImgChange");
});

$("#customInputs input[type='checkbox']").change(function() {
    generateFunction("customInputChange");
});

$("#customInputs input[type='number']").change(function() {
    generateFunction("customInputChange");
});

$("#avatarImg").change(function() {
    if (this.files && this.files[0]) {
        var reader = new FileReader();

        reader.onload = function(e) {
            $('#avatar').attr('src', e.target.result);
            globalavatar = e.target.result;
        }

        reader.readAsDataURL(this.files[0]);
    }
});

$("#shipImg").change(function() {
    if (this.files && this.files[0]) {
        var reader = new FileReader();

        reader.onload = function(e) {
            $('#customShip').attr('src', e.target.result);
            globalship = e.target.result;
            generateFunction("customShipChange");
        }

        reader.readAsDataURL(this.files[0]);
    }
});

$("#bgImg").change(function() {
    $("#useBG").prop("checked", false);
    if (this.files && this.files[0]) {
        var reader = new FileReader();

        reader.onload = function(e) {
            $('#bg').attr('src', e.target.result);
            globalbg = e.target.result;
        }

        reader.readAsDataURL(this.files[0]);
    }
});

$("#shipClear").click(function() {
    globalship = null;
    $('#shipImg').val("");
    $('#customShip').removeAttr('src');
    generateFunction('clear');
});

$("#avatarClear").click(function() {
    globalavatar = null;
    $('#avatarImg').val("");
    $('#avatar').removeAttr('src');
    generateFunction('clear');
});

$("#bgClear").click(function() {
    globalbg = null;
    $('#bgImg').val("");
    $('#bg').attr('src', 'bg.jpg');
    generateFunction('clear');
});