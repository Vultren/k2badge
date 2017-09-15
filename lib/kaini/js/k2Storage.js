function setCookie(name, value, domain) {
    var dom = domain ? ("; domain=" + domain) : '';
    document.cookie = name + "=" + encodeURIComponent(value) + "; max-age=" + (60 * 60 * 24 * 365) + "; path=/" + dom;
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
}

function store(key, value) {
    if (storage) {
        localStorage.setItem(key, value)
    } else {
        setCookie(key, value);
    }
}

function restore(key) {
    var item = null;
    if (storage) {
        item = localStorage.getItem(key)
        if (item) return item;
    }
    return getCookie(key);
}

function getBase64Image(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    var dataURL = canvas.toDataURL("image/png");

    return dataURL;
}

var storage = (function () {
    var uid = new Date;
    var storage;
    var result;
    try {
        (storage = window.localStorage).setItem(uid, uid);
        result = storage.getItem(uid) == uid;
        storage.removeItem(uid);
        return result && storage;
    } catch (exception) { }
}());

var saveAll = function () {
    var furnitures = $(".furnitureClass input:checked").toArray();
    var furnObj = {};
    for (var i in furnitures) {
        furnObj[furnitures[i].name] = furnitures[i].id;
    }
    $(".shipClass").each(function () {
        var abbr = this.id;
        var k2s = $(this).find("input");
        var k2Array = {};
        k2s.each(function (i) {
            k2Array[this.id] = $(this).prop("checked");
        });
        k2[abbr] = k2Array;
    });
    store("ttkName", $("input[name='name']").val());
    store("ttkLvl", $("input[name='level']").val());
    store("ttkServer", $("select[name='server']").val());
    store("ttkFurn", Base64.encode(JSON.stringify(furnObj)));
    store("ttkFurnCam", $("#roomY").val());
    store("ttkTint", $("#tint-color").val());
    store("ttkHexOpa", $("#hexOpa").val());
    store("k2", Base64.encode(JSON.stringify(k2)));
    store("secretaryCam", JSON.stringify([$("#customX").val(), $("#customY").val(), $("#customZ").val()]));
    store("secretaryHit", $(".damaged").size() > 0 && !$($(".damaged")[0]).hasClass("abyss")) ? true : false;
    store("fleet", Base64.encode(fleets.join("|")));
    store("fleetLvl", Base64.encode(fleetLevels.join("|")));
    store("colle", Base64.encode(JSON.stringify(colle)));
    store("bg", globalbg);
    store("bgUse", $("#useBG").prop("checked"));
    store("bgCam", JSON.stringify([$("#bgX").val(), $("#bgY").val(), $("#bgZ").val()]));
    store("bgStretch", $("#bgStretch").prop("checked"));
    store("avatar", globalavatar);
};

var loadAll = function () {
    $(".flagship").removeClass("flagship");
    $(".damaged").removeClass("damaged");
    $("input[name='name']").val(restore("ttkName"));
    $("input[name='level']").val(restore("ttkLvl"));
    var bgCamTemp = restore("bgCam");
    bgCamTemp = bgCamTemp ? JSON.parse(bgCamTemp) : [0, 0, 100]
    $("#bgX").val(bgCamTemp[0]);
    $("#bgY").val(bgCamTemp[1]);
    $("#bgZ").val(bgCamTemp[2]);
    $("#useBG").prop("checked", (!restore("bgUse") || restore("bgUse") == "true"));
    var secretaryCamTemp = restore("secretaryCam");
    secretaryCamTemp = secretaryCamTemp ? JSON.parse(secretaryCamTemp) : [0, 0, 0]
    $("#customX").val(secretaryCamTemp[0]);
    $("#customY").val(secretaryCamTemp[1]);
    $("#customZ").val(secretaryCamTemp[2]);
    $("#roomY").val(restore("ttkFurnCam") || 0);
    $("#tint-color").val(restore("ttkTint") || "#ffffff");
    $("#hexOpa").val(restore("ttkHexOpa") || 0.33);
    $("#hexOpa").val(restore("ttkHexOpa") || 0.33);
    $("#bgStretch").prop("checked", (!restore("bgStretch") || restore("bgStretch") == "true"));

    globalbg = restore("bg");
    if (globalbg != 'null') $('#bg').attr('src', globalbg);

    globalavatar = restore("avatar");
    if (globalavatar != 'null') {
        $('#avatar').attr('src', globalavatar);
    } else $('#avatar').removeAttr('src');
    var serverTemp = restore("ttkServer");
    if (serverTemp != 'null') {
        $("select[name='server']").val(serverTemp);
    }

    var k2Temp = restore("k2");
    k2Temp = k2Temp ? JSON.parse(Base64.decode(k2Temp)) : null;
    var colleTemp = restore("colle");
    colleTemp = colleTemp ? JSON.parse(Base64.decode(colleTemp)) : null;
    var furnTemp = restore("ttkFurn");
    furnTemp = furnTemp ? JSON.parse(Base64.decode(furnTemp)) : null;
    var fleetsTemp = restore("fleet");
    fleetsTemp = fleetsTemp ? Base64.decode(fleetsTemp).split("|") : null;
    for (var i in fleetsTemp) {
        fleetsTemp[i] = fleetsTemp[i].split(",");
    }
    var fleetLevelsTemp = restore("fleetLvl");
    fleetLevelsTemp = fleetLevelsTemp ? Base64.decode(fleetLevelsTemp).split("|") : null;
    for (var i in fleetLevelsTemp) {
        fleetLevelsTemp[i] = fleetLevelsTemp[i].split(",");
    }

    if (k2Temp) {
        k2 = k2Temp;
        $(".shipClass input").prop("checked", false);
        for (var i in k2) {
            for (var j in k2[i]) {
                $("#" + j).prop("checked", k2[i][j]);
            }
        }
    }
    if (colleTemp) {
        colle = colleTemp;
        $("#colleDiv img").removeClass("selected");
        for (var i in colle) {
            $("#kore" + i).addClass("selected");
        }
    }
    if (fleetsTemp) {
        fleets = fleetsTemp;
        for (var i in fleets[0]) {
            var ship = fleets[0][i];
            if (ship !== null && ship !== "") {
                if (i == 0) {
                    $("#" + ship).addClass("flagship");
                    if (restore("secretaryHit") == "true") $("#" + ship).next("span").addClass("damaged");
                    flagRarity = shipDB[ship.substring(4)] ? shipDB[ship.substring(4)].rarity : 0;
                }
                var slot = parseInt(i) + 1;
                $("#slot" + slot).html('<img style="height:50px; width:50px;" src="' + $("#" + ship).attr("src") + '"/>');
            }
        }
    }

    if (fleetLevelsTemp) {
        fleetLevels = fleetLevelsTemp;
        for (var i in fleetLevels[0]) {
            var level = parseInt(fleetLevels[0][i]);
            if (level && level > 0) {
                var slot = parseInt(i) + 1;
                $("#level" + slot).val(level);
            }
        }
    }
    if (furnTemp) {
        var loadCount = 0;
        $("#buttons button").prop("disabled", true);
        $("#loadingDiv").html("Rendering...");
        var imgError = false;
        for (var i in furnTemp) {
            var furniture = furnTemp[i];
            var current = $("#" + furniture);
            current.prop("checked", true);
            var type = current.parent().parent().parent().attr("id");
            var activeImg = $("#active" + type);
            activeImg.off("load");
            if (type == "Outside") {
                var selectedOut = $("#Outside").find(":checked");
                var windowType = $("#Window").find(":checked").attr("data-pType");
                var imgToLoad = selectedOut.val() + windowType;
                var path = "furniture/outside/" + imgToLoad + ".png";
                activeImg.attr("src", path);
            } else {
                var imgToLoad = current.val();
                activeImg.attr("src", "furniture/" + type.toLowerCase() + "/" + imgToLoad + ".png");
            }
            if (activeImg.prop("complete")) {
                loadCount++;
                if (loadCount == Object.keys(furnTemp).length) {
                    $("#buttons button").prop("disabled", false);
                    $("#loadingDiv").html("");
                    if ($("#displayRoom").hasClass("on")) {
                        drawRoom(132);
                    } else {
                        generateFunction("loadAllImgCached");
                    }
                }
            } else {
                activeImg.load(function () {
                    loadCount++;
                    if (loadCount == Object.keys(furnTemp).length) {
                        $("#buttons button").prop("disabled", false);
                        $("#loadingDiv").html(imgError ? "Couldn't find a furniture's image." : "");
                        if ($("#displayRoom").hasClass("on")) {
                            drawRoom(132);
                        } else {
                            generateFunction("loadAllImgLoaded");
                        }
                    }
                })
                    .error(function (error) {
                        loadCount++;
                        imgError = true;
                        if (loadCount == Object.keys(furnTemp).length) {
                            $("#buttons button").prop("disabled", false);
                            $("#loadingDiv").html("Couldn't find a furniture's image.");
                        }
                    });
            }
        }
    } else {
        generateFunction("loadNoFurniture");
    }
};