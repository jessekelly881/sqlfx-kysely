module.exports = function (
  /** @type {import('plop').NodePlopAPI} */
  plop
) {
  plop.setGenerator("empty", {
    description: "Creates a new empty file",
    prompts: [
      {
        type: "input",
        name: "destpath",
        default: "src",
      },
      {
        type: "input",
        name: "name",
      },
    ],
    actions: [
      {
        type: "add",
        path: "{{ destpath }}/{{ name }}.ts",
        templateFile: ".templates/file.hbs",
      },
    ],
  });
};
