module.exports = {
  extends: ["eslint:recommended", "prettier"],
  env: {
    node: true,
    es2022: true,
  },
  rules: {
    "no-unused-vars": "warn",
  },
};
