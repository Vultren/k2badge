const { module, test } = QUnit;

module("Data Load EN", {
    before: function () {
        lang = "en";
        loadData();
    }
});

test("Ship Type DB", function (assert) {
    assert.notEqual(shipTypes, {}, "Ship Types should be loaded")
});
test("Ship DB", function (assert) {
    assert.notEqual(shipDB, {}, "Ship DB should be loaded")
});

test("Ship Conversion", function (assert) {
    assert.notEqual(conversion, {}, "Ship Conversion data should be loaded")
});

module("Data Load JP", {
    before: function () {
        lang = "jp";
        loadData();
    }
});

test("Ship Type DB", function (assert) {
    assert.notEqual(shipTypes, {}, "Ship Types should be loaded")
});
test("Ship DB", function (assert) {
    assert.notEqual(shipDB, {}, "Ship DB should be loaded")
});

test("Ship Conversion", function (assert) {
    assert.notEqual(conversion, {}, "Ship Conversion data should be loaded")
});