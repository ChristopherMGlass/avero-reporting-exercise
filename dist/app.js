"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var servet_1 = require("./servet");
var port = 3000;
servet_1.default.listen(port, function () {
    console.log('Server running on port %d', port);
});
//# sourceMappingURL=app.js.map