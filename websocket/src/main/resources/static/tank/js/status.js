// Game Status

function Status() {
    this.value = Status.getStatusNormal();
    this.message = null;
    this.showMask = false;
}

Status.setStatus = function (value, message, showMask) {
    if (showMask === undefined) {
        showMask = !!message;
    }
    this.value = value;
    this.message = message;
    this.showMask = showMask;
};

Status.getShowMask = function () {
    return this.showMask;
};

Status.getMessage = function () {
    return this.message;
};

Status.getStatusValue = function () {
    return this.value;
};

Status.getStatusNormal = function () {
    return "normal";
};

Status.getStatusPause = function () {
    return "pause";
};

Status.getStatusClose = function () {
    return "close";
};