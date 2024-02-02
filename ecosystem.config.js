module.exports = {
    apps: [
        {
            name: "api",
            script: "poetry run uvicorn main:app --host 0.0.0.0",
            cwd: "./api-v2",
        },
        {
            name: "ui",
            script: "npx serve -s dist -l 3000",
            cwd: "./client-v2",
        },
    ],
};
