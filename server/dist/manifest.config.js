"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const manifest_1 = require("manifest");
exports.default = (0, manifest_1.defineConfig)({
    database: {
        type: 'sqlite', // or 'postgres', 'mysql'
        path: './db.sqlite'
    },
    // Enable admin panel
    adminPanel: {
        enabled: true,
        path: '/admin'
    },
    // API configuration
    api: {
        basePath: '/api',
        cors: {
            origin: 'http://localhost:8080', // Your React app URL
            credentials: true
        }
    },
    // Custom routes
    customRoutes: [
        {
            path: '/api/chat/message',
            method: 'POST',
            handler: './backend/routes.postChatMessage'
        },
        {
            path: '/api/documents/upload',
            method: 'POST',
            handler: './backend/routes.postDocumentUpload'
        },
        {
            path: '/api/legal/search',
            method: 'POST',
            handler: './backend/routes.postLegalSearch'
        },
        {
            path: '/api/users/:userId/language',
            method: 'PATCH',
            handler: './backend/routes.patchUserLanguage'
        }
    ]
});
//# sourceMappingURL=manifest.config.js.map