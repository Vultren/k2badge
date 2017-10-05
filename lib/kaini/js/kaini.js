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

$(document).ready(function () {
	$(".shipClass").each(function () {
		var arrLength = $(this).find("input").length;
		var blankArray = new Array(arrLength);
		while (arrLength--) blankArray[arrLength] = false;
		k2[this.id] = blankArray;
	});

	var loading = {};
	var selectedFleet = 0;
	var selectedSlot = 0;

	var conversion = {};
	var abyssDB = {};
	var shipTypes = {};
	var flagRarity = 0;

	$.getJSON("data/shipType.json", function (json) {
		shipTypes = json;
	}).done(function () {
		$.getJSON((lang == "en" ? 'data/db.json?v=13' : 'data/dbj.json?v=13'), function (data) {
			shipDB = data;
		}).done(function () {
			$.getJSON("data/conversion.json?v=13'", function (data2) {
				conversion = data2;

			}).fail(function () {
				console.log("import db not found or invalid format, not performing import");
			}).always(init)
		}).fail(function () {
			//Kill the App
			$("#buttons").html("Can't find Kanmusu DB, please contact Vultren or Nya-chan on Github");
			$("#tabs").remove();
		})
	}).fail(function () {
		//Kill the App
		$("#buttons").html("Ubable to gernerate ship types, please contact Vultren or Nya-chan on Github");
		$("#tabs").remove();
	});

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

	var c = document.getElementById("result");
	var ctx = c.getContext("2d");
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

	var recalculateSides = function (side) {
		sideLength = side;
		hexHeight = Math.sin(hexagonAngle) * sideLength;
		hexRadius = Math.cos(hexagonAngle) * sideLength;
		hexRectangleHeight = sideLength + 2 * hexHeight;
		hexRectangleWidth = 2 * hexRadius;
		centerx = (hexRectangleHeight * 5 / 4 - hexRectangleWidth) / 2;
		centery = (hexRectangleHeight * 5 / 4 - hexRectangleHeight) / 2 + 5;
	};



	var bindAvatars = function () {
		if (!$(this).hasClass("abyss")) {
			fleets[selectedFleet][selectedSlot] = $(this).prev("img").attr("id");
			$("#fleets .chosen").html('<img style="height:50px; width:50px;" src="' + $(this).prev("img").attr("src") + '"/>');
		}

		if (selectedFleet == 0 && selectedSlot == 0) {
			if (!$(this).hasClass("damaged")) {
				$(".damaged").removeClass("damaged");
			}
			$(this).toggleClass("damaged");
			$(".flagship").removeClass("flagship");
			var flagship = $(this).prev("img");
			flagship.toggleClass("flagship");
			flagRarity = shipDB[$(this).prev("img").attr("id").substring(4)] ? shipDB[$(this).prev("img").attr("id").substring(4)].rarity : 0;
			generateFunction("fleetFlagshipChange");
		}
	}

	var loadAbyssalShips = function () {
		$("#loadAbyss").remove();
		$("#avatars .hidden").removeClass("hidden");

		$.ajax({
			dataType: "json",
			timeout: 10000,
			url: (lang == "en" ? 'data/db2.json?v=13' : 'data/db2j.json?v=13'),
			success: function (data) {
				abyssDB = data;
				$("#loadingDiv").html("Loading images: ");
				$("#loadingProgress").show().html("0/" + Object.keys(data).length);
				var i = 0;
				for (var e in abyssDB) {
					var ship = data[e];
					if (ship.name) {
						var newDiv = $('<img class="abyss tooltip2" title="' + ship.full + '" src="assets/icons/' + ship.type + '/' + e + '.png" id="icon' + e + '"></img>');
						var extraSpan = $('<span class="abyss" id="hit' + e + '">破</span>');
						newDiv.on("load", function () {
							i++;
							$("#loadingProgress").html(i + "/" + Object.keys(data).length);
							if (i == Object.keys(data).length) {
								$("#loadingDiv").html("");
								$("#loadingProgress").hide();
							}
						});
						newDiv.on("click", function () {
							$(".flagship").removeClass("flagship");
							$(".damaged").removeClass("damaged");
							$(this).toggleClass("flagship");
							flagRarity = 0;
							generateFunction("fleetShipChangeAbyss");
						});
						if ($(".shipList [data-name='" + ship.name + "']").length == 0) {
							$(".div" + ship.type).append('<div><label>' + ship.name.replace(new RegExp('_', 'g'), ' ') + '</label><div data-name="' + ship.name + '" class="' + ship.type + '"></div></div>');
						}
						$("#avatars [data-name='" + ship.name + "']").append(newDiv);
						if (ship.damageable) {
							$("#avatars [data-name='" + ship.name + "']").append(extraSpan);
						}
					}
				}
				$("#avatars span").unbind("click").on("click", bindAvatars);
				$('.tooltip2').tooltipster();
			},
			error: function () {
				$("#loadingDiv").html("Can't find Abyssal DB, please contact Vultren or Nya-chan on Github");
			}
		});
	}

	var generateFunction = function (source) {
		console.log(source);
		$("#loadingDiv").html("Rendering...");
		$("#buttons button").prop('disabled', true);
		$("#save").prop("disabled", true);

		ctx.clearRect(0, 0, c.width, c.height);
		ctx.save();
		ctx.fillStyle = "#666";
		ctx.fillRect(0, 0, c.width, c.height);
		if ($("#useBG").prop("checked")) {
			drawRoom($("#buttonToggles .active").attr("id") != "displayBadge" ? 132 : parseInt(document.getElementById("roomY").value));
			ctx.globalAlpha = 0.33;
			ctx.fillRect(0, 0, c.width, c.height);
		} else {
			var bg = document.getElementById("bg");
			var stretch = $("#bgStretch").prop("checked");
			var x = $("#bgX").val() || 0;
			var y = $("#bgY").val() || 0;
			var z = $("#bgZ").val() || 0;
			ctx.drawImage(bg, x, y, stretch ? c.width : bg.width * (z / 100), stretch ? c.height : bg.height * (z / 100));
		}
		ctx.restore();

		ctx.strokeRect(0, 0, c.width, c.height);
		redraw();
	}

	var drawSecretary = function (callback, hideAvatar) {
		var avatarImg = $('#avatar');
		var selected = $(".flagship")[0] ? $(".flagship")[0].id.substring(4) : null;
		var damaged = false;
		if (selected && $("#hit" + selected).hasClass("damaged")) damaged = true;
		var dir = $(".flagship").parent().length > 0 ? $(".flagship").parent().attr("class") : null;

		if (globalship != null) {
			var img = new Image();
			img.onload = function () {
				var offx = 0;
				var offy = 0;

				offx += document.getElementById("customX").value ? parseInt(document.getElementById("customX").value) : 0;
				offy += document.getElementById("customY").value ? parseInt(document.getElementById("customY").value) : 0;

				ctx.save();
				var scale = document.getElementById("customZ").value ? parseInt(document.getElementById("customZ").value) + 100 : 100;
				scale = scale / 100;
				ctx.translate(c.width - img.width * 7 / 8 + offx, c.height / 2 - img.height / 5 + offy);
				ctx.translate(img.width / 2, img.height / 2);
				ctx.scale(scale, scale);
				ctx.drawImage(img, -img.width / 2, -img.height / 2);
				ctx.restore();

				callback();

				if (!hideAvatar) {
					drawCustomAvatar(ctx);
				}
			};
			img.onerror = callback;

			img.src = globalship;
		}
		else if (selected) {
			var img = new Image();
			img.onload = function () {
				var offx = 0;
				var offy = 0;
				if (flagRarity == 0 && abyssDB[selected]) {
					if (damaged && abyssDB[selected].offset2) {
						offx = abyssDB[selected].offset2.x;
						offy = abyssDB[selected].offset2.y;
					} else {
						offx = abyssDB[selected].offset.x;
						offy = abyssDB[selected].offset.y;
					}
				}
				else if (shipDB[selected]) {
					if (damaged && shipDB[selected].offset2) {
						offx = shipDB[selected].offset2.x;
						offy = shipDB[selected].offset2.y;
					} else if (shipDB[selected].offset) {
						offx = shipDB[selected].offset.x;
						offy = shipDB[selected].offset.y;
					}
				}

				offx += document.getElementById("customX").value ? parseInt(document.getElementById("customX").value) : 0;
				offy += document.getElementById("customY").value ? parseInt(document.getElementById("customY").value) : 0;

				ctx.save();
				var scale = document.getElementById("customZ").value ? parseInt(document.getElementById("customZ").value) + 100 : 100;
				if (scale >= 50 && scale <= 150) {
					scale = scale / 100;
					ctx.translate(c.width - img.width * 7 / 8 + offx, c.height / 2 - img.height / 5 + offy);
					ctx.translate(img.width / 2, img.height / 2);
					ctx.scale(scale, scale);
					ctx.drawImage(img, -img.width / 2, -img.height / 2);
				} else {
					ctx.drawImage(img, c.width - img.width * 7 / 8 + offx, c.height / 2 - img.height / 5 + offy);
				}
				ctx.restore();

				callback();

				if (!hideAvatar) {
					if (!avatarImg.attr("src")) {
						drawDefaultAvatar(ctx, selected, flagRarity);
					} else {
						drawCustomAvatar(ctx);
					}
				}
			};
			img.onerror = callback;

			img.src = "assets/full/" + dir + "/" + selected + (damaged ? "x" : "") + ".png";
		}
		else {
			callback();

			if (avatarImg.attr("src") && !hideAvatar) {
				drawCustomAvatar(ctx);
			}
		}
	}

	var drawDefaultAvatar = function (ctx, id, rarity) {
		var rarity = document.getElementById("r" + rarity);
		var icon = document.getElementById("icon" + id);
		ctx.save();
		ctx.fillStyle = "black";
		ctx.fillRect(35, 45, 100, 100);
		ctx.strokeRect(35, 45, 100, 100);
		ctx.restore();
		ctx.drawImage(rarity, 30, 5, 100, 100, 35, 45, 100, 100);
		ctx.drawImage(icon, 35, 45);
	}

	var drawCustomAvatar = function (ctx) {
		var avatar = document.getElementById("avatar");
		ctx.save();
		ctx.fillStyle = "transparent";
		ctx.fillRect(35, 45, 100, 100);
		ctx.strokeRect(35, 45, 100, 100);
		ctx.restore();
		ctx.drawImage(avatar, 35, 45, 100, 100);
	}

	var redraw = function () {
		var mode = $("#buttonToggles .active").attr("id");
		if (mode == "displayBadge") {
			if ($("#k2").prop("checked")) {
				drawSecretary(drawNewBadge);
			} else {
				drawSecretary(drawBadge);
			}
		} else if (mode == "displayPoster") {
			drawSecretary(drawPoster, true);
		} else if (mode == "displayRoom") {
			drawRoom(132);
		}
	}

	var drawPoster = function () {
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
		}
		else {
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
			var max = $("#colleTab .div" + key +  " img").length;
			var selected = $("#colleTab .div" + key +  " img.selected").length;
			var percentLocation = Math.min(maxPerLine, max);

			if(Math.floor((max-1) / maxPerLine % 2) == 1) {
				evenRow = !evenRow;
			}
			
			if(evenRow) {
				row = row + hexRadius;
				rowbox = rowbox + hexRadius;
			}
			
			ctx.font = "14px " + textfont;

			ctx.textAlign = "right";
			drawText(classLang[lang], row, line + newLength - 9);
			
			ctx.save();
			ctx.fillStyle = "white";

			$("#colleTab .div" + key +  " img").each(function (i) {
				
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
			drawText(selected + "/" + max + " (" + ( selected / max * 100).toFixed() + "%)", rowbox + percentLocation * hexRectangleWidth + 8, line);
			ctx.restore();
			line = line + linebarwidth/2 + linebarwidth / 4
			evenRow = !evenRow;

			if(max/maxPerLine > 1) {
				line = line + linebarwidth/2 + Math.floor(num / maxPerLine) * 8;
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
		}
		else {
			drawText((lang == "en" ? "Unknown Server" : "不明サーバ"), c.width - 25, 25);
		}
		ctx.textAlign = "left";
		ctx.restore();
		$("#loadingDiv").html("");
		$("#loadingProgress").hide();
		$("#buttons button").prop('disabled', false);
	};

	var drawRoom = function (roomY) {
		var ratio = c.width / bg.clientWidth;
		var activeFloor = document.getElementById("activeFloor");
		var activeWall = document.getElementById("activeWall");
		var activeDesk = document.getElementById("activeDesk");
		var activeOutside = document.getElementById("activeOutside");
		var activeWindow = document.getElementById("activeWindow");
		var activeObject = document.getElementById("activeObject");
		var activeChest = document.getElementById("activeChest");
		ctx.globalAlpha = 1;
		ratio = c.width / activeFloor.clientWidth;
		if (activeFloor.complete)
			ctx.drawImage(activeFloor, 0, 150 * ratio + roomY, c.width, activeFloor.clientHeight * ratio);
		if (activeWall.complete)
			ctx.drawImage(activeWall, 0, -125 * ratio + roomY, c.width, activeWall.clientHeight * ratio);
		if (activeObject.complete)
			ctx.drawImage(activeObject, 0, -125 * ratio + roomY, activeObject.clientWidth * ratio, activeObject.clientHeight * ratio);
		if (activeOutside.complete)
			ctx.drawImage(activeOutside, 210, -125 * ratio + roomY, activeOutside.clientWidth * ratio, activeOutside.clientHeight * ratio);
		if (activeWindow.complete)
			ctx.drawImage(activeWindow, 210, -125 * ratio + roomY, activeWindow.clientWidth * ratio, activeWindow.clientHeight * ratio);

		var isNormalDesk = activeDesk.src.match(/(\d\d\d.?).png$/gm);
		var deskOffset = null;
		if (isNormalDesk) {
			deskOffset = deskoffsetdb[isNormalDesk[0]];
		}

		if (deskOffset) {
			ctx.drawImage(activeDesk, deskOffset.x, deskOffset.y + roomY + 7, activeDesk.clientWidth * ratio, activeDesk.clientHeight * ratio);
		} else {
			ctx.drawImage(activeDesk, 0, roomY + 7, activeDesk.clientWidth * ratio, activeDesk.clientHeight * ratio);
		}

		ctx.drawImage(activeChest, c.width - activeChest.clientWidth * ratio, -125 * ratio + roomY, activeChest.clientWidth * ratio, activeChest.clientHeight * ratio);
		var fillTint = $("#tint-color").val();
		ctx.fillStyle = fillTint ? fillTint : "#ffffff";

		$("#loadingDiv").html("");
		$("#loadingProgress").hide();
		$("#buttons button").prop('disabled', false);
	};

	var drawText = function (text, posx, posy, width) {
		ctx.save();
		ctx.lineWidth = typeof width !== 'undefined' ? width : 2;
		ctx.strokeText(text, posx, posy);
		ctx.fillText(text, posx, posy);
		ctx.restore();
	};

	var drawProgress = function(checked, total, offset) {
		var progressrow = 530;
		var progressrowbox = 540;
		var ships = checked + "/" + total;
		var shipPct = checked / total;
		var barWidth = 300;
		var grd = ctx.createLinearGradient(progressrowbox, 0, progressrowbox + barWidth, 0);
		
		ctx.save();
		ctx.strokeRect(progressrowbox, c.height - offset, barWidth, 8);
		
		grd.addColorStop(0, "#A00000");
		grd.addColorStop(0.33, "#FF9900");
		grd.addColorStop(0.66, "#DDDD33");
		grd.addColorStop(1, "#00A000");
		ctx.fillStyle = grd;
		ctx.fillRect(progressrowbox, c.height - offset, (barWidth * shipPct).toFixed(), 8);
		ctx.restore();

		ctx.font = "20px " + numberfont;
		drawText(ships + " (" + (shipPct * 100).toFixed() + "%)", progressrowbox + barWidth, c.height - 20, 3);
	};

 	var drawHexagon = function (img, x, y, checked, color) {
		ctx.save();
		ctx.beginPath();
		ctx.moveTo(x + hexRadius, y);
		ctx.lineTo(x + hexRectangleWidth, y + hexHeight);
		ctx.lineTo(x + hexRectangleWidth, y + hexHeight + sideLength);
		ctx.lineTo(x + hexRadius, y + hexRectangleHeight);
		ctx.lineTo(x, y + sideLength + hexHeight);
		ctx.lineTo(x, y + hexHeight);
		ctx.closePath();
		ctx.stroke();
		ctx.fillStyle = color ? color : "white";
		ctx.globalAlpha = $("#hexOpa").val() ? $("#hexOpa").val() : 0;
		ctx.fill();
		ctx.globalAlpha = 1;
		ctx.clip();

		if (img && checked) {
			ctx.drawImage(img, x - centerx, y - centery, hexRectangleHeight * 5 / 4, hexRectangleHeight * 5 / 4);
		}
		ctx.restore();
	};

	var drawNewBadge = function () {
		recalculateSides(22);

		ctx.save();
		ctx.strokeRect(35, 45, 100, 100);
		var name = $("[name='name']")[0];
		var alevel = $("[name='level']")[0];
		var server = $("[name='server'] :selected").text();
		var line1 = 45;
		var line2 = line1 + sideLength * 1.5 + 8;
		var line3 = line2 + sideLength * 1.5 + 8;
		var line4 = line3 + sideLength * 1.5 + 8;
		var row1 = 210;
		var row1box = row1 + 15;
		var row2 = row1 + hexRadius;
		var row2box = row1box + hexRadius;
		var row3 = row2 + hexRadius;
		var row3box = row2box + hexRadius;
		var row4 = row3 + hexRadius;
		var row4box = row3box + hexRadius;

		ctx.font = "20px " + textfont;
		ctx.imageSmoothingEnabled = true;
		ctx.fillStyle = 'white';
		ctx.strokeStyle = 'black';
		if (name.value) {
			drawText(name.value, 20, 25, 3);
		}
		else {
			drawText((lang == "en" ? "Nameless Admiral" : "無名提督"), 20, 25, 3);
		}

		ctx.save();
		ctx.font = "10px " + textfont;
		ctx.globalCompositeOperation = "darker";
		ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
		ctx.strokeStyle = 'transparent';
		var date = new Date();
		drawText(date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(), 5, c.height - 5, 3);
		ctx.restore();

		ctx.font = "14px " + textfont;

		ctx.textAlign = "right";
		ctx.drawImage(document.getElementById("fleet1a"), row1 - 23, line1 + sideLength / 2 - 15);
		ctx.drawImage(document.getElementById("fleet2a"), row2 - 23, line2 + sideLength / 2 - 15);
		ctx.drawImage(document.getElementById("fleet3a"), row3 - 23, line3 + sideLength / 2 - 15);
		ctx.drawImage(document.getElementById("fleet4a"), row4 - 23, line4 + sideLength / 2 - 15);
		ctx.save();
		ctx.fillStyle = "white";
		for (var i = 0; i < 6; i++) {
			var x = row1box + i * hexRectangleWidth;
			var y = line1 - 15;
			var img = document.getElementById(fleets[0][i]);
			var level = fleetLevels[0][i];
			drawHexagon(img, x, y, true);
			if (img) {
				ctx.font = "10px " + textfont;
				ctx.textAlign = "left";
				drawText(level, x, y + 8);
			}

			var x = row2box + i * hexRectangleWidth;
			var y = line2 - 15;
			var img = document.getElementById(fleets[1][i]);
			var level = fleetLevels[1][i];
			drawHexagon(img, x, y, true);
			if (img) {
				ctx.font = "10px " + textfont;
				ctx.textAlign = "left";
				drawText(level, x, y + 8);
			}

			var x = row3box + i * hexRectangleWidth;
			var y = line3 - 15;
			var img = document.getElementById(fleets[2][i]);
			var level = fleetLevels[2][i];
			drawHexagon(img, x, y, true);
			if (img) {
				ctx.font = "10px " + textfont;
				ctx.textAlign = "left";
				drawText(level, x, y + 8);
			}

			var x = row4box + i * hexRectangleWidth;
			var y = line4 - 15;
			var img = document.getElementById(fleets[3][i]);
			var level = fleetLevels[3][i];
			drawHexagon(img, x, y, true);
			if (img) {
				ctx.font = "10px " + textfont;
				ctx.textAlign = "left";
				drawText(level, x, y + 8);
			}
		}
		ctx.restore();


		ctx.font = "12px " + textfont;
		ctx.textAlign = "center";
		drawText("Lv. " + (alevel.value ? alevel.value : "?"), 85, line4 - 1);

		if (server != "Your Server") {
			drawText(server.substring(server.indexOf(" ") + 1), 85, line4 + 14);
		}
		else {
			drawText((lang == "en" ? "Unknown Server" : "不明サーバ"), 85, line4 + 14);
		}
		ctx.textAlign = "left";
		ctx.restore();
		$("#loadingDiv").html("");
		$("#buttons button").prop('disabled', false);
	};

	var drawBadge = function () {
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
		}
		else {
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
			if($("#" + key.toLowerCase()).find("[type='checkbox']").length == 0  || ["SS" , "AX"].indexOf(key) > -1){
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
			
			if(blue > 0 && useBlue){
				max -= blue; 
			}
			var percentLocation = Math.min(maxPerLine, max);

			if(Math.floor((max-1) / maxPerLine % 2) == 1) {
				evenRow = !evenRow;
			}
			
			if(max/maxPerLine > 1) {
				line = line + (linebarwidth*Math.floor(max / maxPerLine))/2;
			}
			if(evenRow) {
				row = row + hexRadius;
				rowbox = rowbox + hexRadius;

			}
			
			ctx.font = "14px " + textfont;

			ctx.textAlign = "right";
			drawText((lang == "en" ? classLang[lang] : classLang["jp"] ), row, line + newLength - 9);
			
			ctx.save();
			ctx.fillStyle = "white";

			$($("#" + key.toLowerCase()).find("[type='checkbox']").get().reverse()).each(function (i) {
				var label = $(this).parent().parent();
				var current = max - num - 1;
				if (!(useBlue && label.hasClass("blueprint") && !label.hasClass("kai"))) {
					var x = rowbox + current % maxPerLine * hexRectangleWidth;
					if (Math.floor(current / maxPerLine % 2) > 0) {
						x = rowbox + (maxPerLine - (current+1) % maxPerLine) * hexRectangleWidth - hexRadius;
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
			line = line + linebarwidth/2;
			evenRow = !evenRow;
			
		}
		var numCV = $("#cv").find("[type='checkbox']").length - ((useBlue) ? $("#cv").find(".blueprint").not(".kai").length : 0);
		var startPositionSS = (numCV + 3) * hexRectangleWidth;
		var numSS = 0;
		var maxSS = $("#ss").find("[type='checkbox']:checked").length;
		var ssRow = 190;
		var ssRowbox = ssRow  + 15;
		var blue = 0;
		line = line - linebarwidth;
		drawText((lang == "en" ? "SS" : "潜"), ssRow + startPositionSS, line + linebarwidth / 2 + newLength - 9);
		ctx.save();
        ctx.fillStyle = "white";
		$("#ss").find("[type='checkbox']").each(function () {
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
		$("#ax").find("[type='checkbox']").each(function () {
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
		}
		else {
			drawText((lang == "en" ? "Unknown Server" : "不明サーバ"), 85, line4 + 7);
		}
		ctx.textAlign = "left";
		ctx.restore();
		$("#loadingDiv").html("");
		$("#loadingProgress").hide();
		$("#buttons button").prop('disabled', false);
	};

	var doneLoading = function () {
		for (var i in colle) {
			$("#kore" + i).addClass("selected");
		}
		$(".flagship").removeClass("flagship");
		$(".damaged").removeClass("damaged");
		for (var i in fleets[0]) {
			var ship = fleets[0][i];
			var shipName = ship.substring(4);
			if (ship !== null && ship !== "") {
				if (i == 0) {
					$("#" + ship).addClass("flagship");
					flagRarity = shipDB[shipName] ? shipDB[shipName].rarity : 0;
				}
				var slot = parseInt(i) + 1;
				$("#slot" + slot).html('<img style="height:50px; width:50px;" src="assets/icons/' + shipDB[shipName].type + '/' + shipName + '.png"/>');
			}
		}
		for (var i in fleetLevels[0]) {
			var level = parseInt(fleetLevels[0][i]);
			if (level && level > 0) {
				var slot = parseInt(i) + 1;
				$("#level" + slot).val(level);
			}
		}
		generateFunction("initial");
	};

	//Begin Init Code
	var init = function () {

		var mstId2FleetIdTable = $.extend({}, conversion.mstId2FleetIdTable, conversion.mstId2KainiTable);

		if (apiMode) {
			if (importName) $("input[name='name']").val(importName);
			if (importLvl) $("input[name='level']").val(importLvl);
			if (importServer) $("select[name='server']").val(importServer);

			if (importShips) {
				importShips = JSON.parse(importShips);
				var importedColle = {};
				var importedK2 = {};
				for (var i in importShips) {
					if (importShips[i] in mstId2FleetIdTable) {
						var ship = mstId2FleetIdTable[importShips[i]];
						importedColle[ship] = true;
						// Add implicated ships
						if (ship in conversion.implicationTable) {
							for (var j in conversion.implicationTable[ship]) {
								importedColle[conversion.implicationTable[ship][j]] = true;
							}
						}
					}
				}

				// Deducing K2
				if (importK2) {
					for (var i in importedColle) {
						var ship = $("#" + i);
						if (ship.length > 0) {
							var shipType = shipDB[i].type;
							if (!importedK2[shipType]) importedK2[shipType] = {};
							importedK2[shipType][i] = true;
							$("#" + i).prop("checked", true);
						}
					}
					k2 = importedK2;
				}


				if (importColle) colle = importedColle;
			}
			//4 fleets
			if (importFleets) {
				importFleets = JSON.parse(importFleets);
				var importedFleets = [
					new Array(6),
					new Array(6),
					new Array(6),
					new Array(6)
				];
				var importedFleetLevels = [
					[1, 1, 1, 1, 1, 1],
					[1, 1, 1, 1, 1, 1],
					[1, 1, 1, 1, 1, 1],
					[1, 1, 1, 1, 1, 1]
				];

				for (var fleet in importFleets) {
					for (var i in importFleets[fleet]) {
						if (importFleets[fleet][i] && importFleets[fleet][i] != null && mstId2FleetIdTable[importFleets[fleet][i].id]) {
							importedFleets[fleet][i] = "icon" + mstId2FleetIdTable[importFleets[fleet][i].id];
							importedFleetLevels[fleet][i] = importFleets[fleet][i].lvl;
						}
					}
				}
				fleets = importedFleets;
				fleetLevels = importedFleetLevels;
			}
		}

		ctx.strokeRect(0, 0, c.width, c.height);
		ctx.imageSmoothingEnabled = true;
		ctx.mozImageSmoothingEnabled = true;
		ctx.webkitImageSmoothingEnabled = true;

		var i = 0;
		for (var e in shipDB) {
			var ship = shipDB[e];
			if (ship.name) {
				var newDiv = $('<img class="tooltip" title="' + ship.full + '" src="assets/icons/' + ship.type + '/' + e + '.png" id="icon' + e + '"></img>');
				var extraSpan = $('<span id="hit' + e + '">破</span>');
				newDiv.on("load", function () {
					i++;
					$("#loadingProgress").html(i + "/" + Object.keys(shipDB).length);
					if (i == Object.keys(shipDB).length) {
						doneLoading();
					}
				});
				if ($(".shipList [data-name='" + ship.name + "']").length == 0) {
					$(".div" + ship.type).append('<div><label>' + ship.name.replace(new RegExp('_', 'g'), ' ') + '</label><div data-name="' + ship.name + '" class="' + ship.type + '"></div></div>');
				}
				if (ship.unique) {
					$("#colleTab [data-name='" + ship.name + "']").append('<img title="' + ship.full + '"alt="assets/full/FinalBoss.png" src="assets/icons/' + ship.type + '/' + e + '.png" id="kore' + e + '"></img>').append(extraSpan);
				}
				$("#avatars [data-name='" + ship.name + "']").append(newDiv).append(extraSpan);
			}
		}

		$("#colleTab .shipClasses").each(function (i) {
			var selectClass = $("<div class='colleAll'><input id='selectAll-" + i + "' type='checkbox'/><label for='selectAll-" + i + "'>" + (lang == "jp" ? "全て選択" : (lang == "cn" || lang == "tw") ? "全選" : "Select All") + "</label></div>");
			$(this).append(selectClass);
			selectClass.find("input").change(function () {
				var imgs = $(this).parent().parent().find("img");
				for (var e in imgs.toArray()) {
					var img = $(imgs[e]);
					colle[img.attr("id").substring(4)] = this.checked;
					img.toggleClass("selected", this.checked);
				}
				generateFunction("colleChangeAll");
			});
		});

		$('.tooltip').tooltipster();

		$(".shipClasses").find("label").next("div").each(function () {
			if ($(this).find("img").length == 0) {
				$(this).parent().remove();
			}
		});

		$("#fleetSelect div").click(function () {
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

		$("#fleets div").click(function () {
			$("#fleets .chosen").removeClass("chosen");
			$(this).toggleClass("chosen");
			var index = this.id.substring(4);
			selectedSlot = parseInt(index) - 1;
		});

		$("#fleetLevels input").change(function () {
			var index = this.id.substring(5);
			selectedSlot = parseInt(index) - 1;
			fleetLevels[selectedFleet][selectedSlot] = this.value;
			generateFunction("fleetLevelChange");
		});

		$("#avatars img").on("click", function () {
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

		$("#colleTab img").on("click", function () {
			if (colle[$(this).attr("id").substring(4)] && $(this).hasClass("selected")) {
				delete colle[$(this).attr("id").substring(4)];
			} else if (!$(this).hasClass("selected")) {
				colle[$(this).attr("id").substring(4)] = true;
			}
			$(this).toggleClass("selected");

			generateFunction("colleChange");
		});

		$("#avatars span").on("click", bindAvatars);

		$(".shipList > label").click(function () {
			$(this).next("div").slideToggle();
		});

		$(".shipClasses label").click(function () {
			$(this).next("div").toggle();
		});

		$("#removeSlot").click(function () {
			if (selectedFleet == 0 && selectedSlot == 0) {
				$(".damaged").removeClass("damaged");
				$(".flagship").removeClass("flagship");
				flagRarity = 0;
			}

			fleets[selectedFleet][selectedSlot] = null;
			$("#fleets .chosen").html("");
			generateFunction("fleetRemoveSlot");
		});

		$(".shipOptions input[type='checkbox']").change(function () {
			generateFunction("kainiShipChange");
		});

		$("#selectAll").on("change", function () {
			if (this.checked) {
				$(".shipOptions [type='checkbox']").prop("checked", true);
			}
			else {
				$(".shipOptions [type='checkbox']").prop("checked", false);
			}
			generateFunction("kainiSelectAll");
		});

		$("#displayBadge").on("click", function () {
			$("#buttonToggles button").removeClass("active");
			$(this).addClass("active");
			c.width = 850;
			c.height = 240;
			generateFunction("displayBadge");
		});
		$("#displayRoom").on("click", function () {
			$("#buttonToggles button").removeClass("active");
			$(this).addClass("active");
			c.width = 850;
			c.height = 510;
			drawRoom(132);
		});
		$("#displayPoster").on("click", function () {
			$("#buttonToggles button").removeClass("active");
			$(this).addClass("active");
			c.width = 850;
			c.height = 510;
			generateFunction("displayPoster");
		});

		$("#generate").on("click", generateFunction);

		$("#Floor,#Wall,#Desk,#Object,#Chest,#Window").on("change", function () {
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
				activeImg.on("load", function () {
					delete loading[type];
					if ($.isEmptyObject(loading)) {
						$("#buttons button").prop("disabled", false);
						$("#loadingDiv").html("");
						if ($("#displayRoom").hasClass("on")) {
							drawRoom(132);
						} else generateFunction("furnitureChangeLoaded");
					}
				})
					.on('error', function () {
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

		$("#Outside").on("change", function (byWindow) {
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
				activeOut.on("load", function () {
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

		$("#ttkTab input[type='text'],#ttkTab input[type='number']").blur(function () {
			generateFunction("ttkInfo");
		});

		$("#ttkTab select").click(function () {
			generateFunction("ttkServer");
		});

		$("#ttkTab input[type='checkbox']").click(function () {
			generateFunction("ttkLevel");
		});

		$("#loadAbyss").click(function () {
			loadAbyssalShips();
		});

		$("#save").on("click", function () {
			saveAll();
			this.setAttribute("disabled", "disabled");
		});
		$("#load").on("click", function () {
			loadAll();
		});

		$("#export").on("click", function () {
			alert("Right-click the image that opens up in a new tab and save it as PNG.");
			var dataURL = c.toDataURL("image/png");
			window.open(dataURL, "_blank");
		});

		$('#avatar').on("load", function () {
			if ($.isEmptyObject(loading)) generateFunction("avatarImgChange");
		});

		$('#bg').on("load", function () {
			if ($.isEmptyObject(loading)) generateFunction("bgImgChange");
		});

		$("#customInputs input[type='checkbox']").change(function () {
			generateFunction("customInputChange");
		});

		$("#customInputs input[type='number']").change(function () {
			generateFunction("customInputChange");
		});

		$("#avatarImg").change(function () {
			if (this.files && this.files[0]) {
				var reader = new FileReader();

				reader.onload = function (e) {
					$('#avatar').attr('src', e.target.result);
					globalavatar = e.target.result;
				}

				reader.readAsDataURL(this.files[0]);
			}
		});

		$("#shipImg").change(function () {
			if (this.files && this.files[0]) {
				var reader = new FileReader();

				reader.onload = function (e) {
					$('#customShip').attr('src', e.target.result);
					globalship = e.target.result;
					generateFunction("customShipChange");
				}

				reader.readAsDataURL(this.files[0]);
			}
		});

		$("#bgImg").change(function () {
			$("#useBG").prop("checked", false);
			if (this.files && this.files[0]) {
				var reader = new FileReader();

				reader.onload = function (e) {
					$('#bg').attr('src', e.target.result);
					globalbg = e.target.result;
				}

				reader.readAsDataURL(this.files[0]);
			}
		});

		$("#shipClear").click(function () {
			globalship = null;
			$('#shipImg').val("");
			$('#customShip').removeAttr('src');
			generateFunction('clear');
		});

		$("#avatarClear").click(function () {
			globalavatar = null;
			$('#avatarImg').val("");
			$('#avatar').removeAttr('src');
			generateFunction('clear');
		});

		$("#bgClear").click(function () {
			globalbg = null;
			$('#bgImg').val("");
			$('#bg').attr('src', 'bg.jpg');
			generateFunction('clear');
		});

	}

});

$(window).on("load", function () {
	$("#tabs").tabs();
	//$("#tabs").show();

	$(".furnitureClass.invert > div div").each(function () {
		//Newest Furniture First
		$(this).prependTo(this.parentNode);
	});
});